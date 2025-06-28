/* eslint-disable complexity */
import * as SwaggerParser from '@apidevtools/swagger-parser'
import * as autocannon from 'autocannon'
import {isAbsolute, resolve} from 'node:path'
import {OpenAPIV2, OpenAPIV3} from 'openapi-types'

import {
  BenchmarkArgs,
  BenchmarkFlags,
  BenchmarkHook,
  BenchmarkReport,
  BenchmarkScenario,
  HookName,
  Logger,
  SwaggerV1Document,
} from '../../types'
import {compareReports} from './compare'
import {aggregateGrades, DEFAULT_GRADE_THRESHOLDS, getGrade, parseGradeRangeFlag, parseRangeFlag} from './grade'
import {BenchmarkProgressBar} from './progress'
import {renderConsoleFromComparison, renderConsoleFromReport} from './renderer/console'
import {renderCsvFromComparison, renderCsvFromReport} from './renderer/csv'
import {renderHtmlFromComparison, renderHtmlFromReport} from './renderer/html'
import {renderJsonFromComparison, renderJsonFromReport} from './renderer/json'
import {detectFormatFromExtension, isUrl, loadFileReport, writeOutput} from './report'
import {loadSpec} from './spec'

export class BenchmarkRunner {
  private args: BenchmarkFlags
  private hooks: {[K in HookName]: BenchmarkHook[K]}
  private log: Logger

  constructor(args: BenchmarkArgs, flags: BenchmarkFlags, logger: Logger) {
    this.log = logger

    if (args.spec && flags.spec && args.spec !== flags.spec) {
      this.log('\nWarning: Both positional argument and --spec flag provided. Using positional argument.')
    }

    this.args = flags
    this.args.spec = args.spec || flags.spec
    this.hooks = {
      onBenchmarkCompleted: [],
      onBenchmarkStart: [],
      onScenarioCompleted: [],
      onScenarioStart: [],
    }
  }

  async run() {
    this._verifyArgs()

    const reportA = await this._loadReportOrRun(await this._getBaseUrl(), this.args.label)

    const reportB = this.args['compare-with']
      ? await this._loadReportOrRun(this.args['compare-with'], this.args['compare-label'])
      : undefined

    this._handleOutput(reportA, reportB)
  }

  private async _getBaseUrl(): Promise<string> {
    // If url is provided directly, use it
    if (this.args.url && isUrl(this.args.url)) return this.args.url

    // If spec is a URL, try to extract base URL from spec
    if (this.args.spec && isUrl(this.args.spec)) {
      const spec = await loadSpec(this.args.spec)
      const api = await SwaggerParser.dereference(spec)

      // OpenAPI 3.x: servers[0].url
      const openAPIv3 = api as OpenAPIV3.Document
      if (
        openAPIv3.servers &&
        Array.isArray(openAPIv3.servers) &&
        openAPIv3.servers.length > 0 &&
        openAPIv3.servers[0].url
      ) {
        return openAPIv3.servers[0].url.replace(/\/$/, '')
      }

      // Swagger 2.0: host, basePath, schemes
      const openAPIv2 = api as OpenAPIV2.Document
      if (typeof openAPIv2.host === 'string') {
        const scheme = (openAPIv2.schemes && openAPIv2.schemes[0]) || 'http'
        const basePath = openAPIv2.basePath || ''
        return `${scheme}://${openAPIv2.host}${basePath}`.replace(/\/$/, '')
      }

      // Swagger 1.x: top-level basePath
      const openAPIv1 = api as unknown as SwaggerV1Document
      if (typeof openAPIv1.basePath === 'string') {
        if (isUrl(openAPIv1.basePath)) {
          return openAPIv1.basePath.replace(/\/$/, '')
        }

        // Try to get host and scheme from v2 or from the spec URL
        let host: string | undefined = openAPIv2 && openAPIv2.host ? openAPIv2.host : undefined
        let scheme: string = openAPIv2 && openAPIv2.schemes && openAPIv2.schemes[0] ? openAPIv2.schemes[0] : 'http'

        if (!host) {
          try {
            const url = new URL(this.args.spec!)
            host = url.host
            scheme = url.protocol ? url.protocol.replace(':', '') : scheme
          } catch {
            host = ''
          }
        }

        if (!host) {
          return `${openAPIv1.basePath}`.replace(/\/$/, '')
        }

        return `${scheme}://${host}${openAPIv1.basePath}`.replace(/\/$/, '')
      }

      // Fallback: use the directory of the spec URL
      try {
        const url = new URL(this.args.spec)
        url.pathname = url.pathname.replace(/\/[^/]*$/, '')
        return url.toString().replace(/\/$/, '')
      } catch {
        throw new TypeError('Could not determine base URL from OpenAPI/Swagger spec or spec URL')
      }
    }

    throw new TypeError('No valid base URL could be determined')
  }

  private _handleBenchmarkOutput(report: BenchmarkReport) {
    const sortBy = this.args['sort-by'] || 'p50'
    if (this.args.output) {
      const fmt = detectFormatFromExtension(this.args.output)

      const rendered =
        fmt === 'json'
          ? renderJsonFromReport(report, sortBy)
          : fmt === 'csv'
          ? renderCsvFromReport(report, sortBy)
          : renderHtmlFromReport(report, sortBy)

      writeOutput(this.args.output, rendered)
      this.log(`\nReport saved to ${this.args.output}`)
    } else {
      renderConsoleFromReport(report, sortBy)
    }
  }

  private _handleComparisonOutput(newReport: BenchmarkReport, oldReport: BenchmarkReport) {
    const sortBy = this.args['sort-by'] || 'p50'
    const results = compareReports(newReport, oldReport)

    if (this.args.output) {
      const fmt = detectFormatFromExtension(this.args.output)

      const rendered =
        fmt === 'json'
          ? renderJsonFromComparison(results, sortBy)
          : fmt === 'csv'
          ? renderCsvFromComparison(results, sortBy)
          : renderHtmlFromComparison(results, sortBy)

      writeOutput(this.args.output, rendered)
      this.log(`\nReport saved to ${this.args.output}`)
    } else {
      renderConsoleFromComparison(results, sortBy)
    }
  }

  private _handleOutput(reportA: BenchmarkReport, reportB?: BenchmarkReport) {
    if (this.args['compare-with'] && reportB) {
      this._handleComparisonOutput(reportA, reportB)
      return
    }

    this._handleBenchmarkOutput(reportA)
  }

  private async _loadReportOrRun(urlOrFile: string, label: string): Promise<BenchmarkReport> {
    if (isUrl(urlOrFile)) {
      const spec = await loadSpec(this.args.spec!)
      const api = await SwaggerParser.dereference(spec)
      const scenarios: BenchmarkScenario[] = []

      // Parse custom param values from flags.param (e.g., ["petId=123", "userId=abc"])
      const paramMap: Record<string, string> = {}
      if (Array.isArray(this.args.param)) {
        for (const entry of this.args.param) {
          const [key, value] = entry.split('=')
          if (key && value !== undefined) paramMap[key] = value
        }
      }

      if (api.paths) {
        for (const [path, methods] of Object.entries(api.paths)) {
          // Replace path parameters like {petId} with user-supplied or default value
          const resolvedPath = path.replaceAll(/\{([^}]+)\}/g, (_match, p1) => paramMap[p1] ?? '1')
          for (const [method] of Object.entries(methods)) {
            scenarios.push({
              method: method.toUpperCase() as BenchmarkScenario['method'],
              path,
              url: urlOrFile + resolvedPath,
            })
          }
        }
      }

      // eslint-disable-next-line no-await-in-loop
      for (const pl of this.args.plugins as string[]) await this._registerPlugin(pl)

      const endpoints = await this._runAllAndCollect(scenarios)

      // Optionally, you can aggregate a global grade for the whole report
      const allFinalGrades = new Set(Object.values(endpoints).map((e) => e.grades?.final))
      const finalGrade = aggregateGrades({
        p90: allFinalGrades.has('Needs Improvement')
          ? 'Needs Improvement'
          : allFinalGrades.has('Acceptable')
          ? 'Acceptable'
          : allFinalGrades.has('Good')
          ? 'Good'
          : 'Excellent',
        p99: allFinalGrades.has('Needs Improvement')
          ? 'Needs Improvement'
          : allFinalGrades.has('Acceptable')
          ? 'Acceptable'
          : allFinalGrades.has('Good')
          ? 'Good'
          : 'Excellent',
        rps: allFinalGrades.has('Needs Improvement')
          ? 'Needs Improvement'
          : allFinalGrades.has('Acceptable')
          ? 'Acceptable'
          : allFinalGrades.has('Good')
          ? 'Good'
          : 'Excellent',
      })

      return {
        endpoints,
        finalGrade,
        label,
        timestamp: new Date().toISOString(),
      }
    }

    return loadFileReport(urlOrFile)
  }

  private _parseGradeTresholds() {
    // Parse grade thresholds from flags
    const gradeThresholds = {...DEFAULT_GRADE_THRESHOLDS}
    // Per-metric flags override grade-range, which overrides defaults
    const gradeRange = parseGradeRangeFlag(this.args['grade-range'])
    const p50 = parseRangeFlag(this.args['p50-range'])
    const p90 = parseRangeFlag(this.args['p90-range'])
    const p99 = parseRangeFlag(this.args['p99-range'])
    const rps = parseRangeFlag(this.args['rps-range'])
    if (gradeRange.p50) gradeThresholds.p50 = gradeRange.p50
    if (gradeRange.p90) gradeThresholds.p90 = gradeRange.p90
    if (gradeRange.p99) gradeThresholds.p99 = gradeRange.p99
    if (gradeRange.rps) gradeThresholds.rps = gradeRange.rps
    if (p50) gradeThresholds.p50 = p50
    if (p90) gradeThresholds.p90 = p90
    if (p99) gradeThresholds.p99 = p99
    if (rps) gradeThresholds.rps = rps

    return gradeThresholds
  }

  private _registerHook<T extends HookName>(name: T, fn: BenchmarkHook[T][number]) {
    if (!this.hooks[name]) {
      process.exitCode = 1
      throw new Error(`Unknown hook ${name}`)
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.hooks[name].push(fn as any)
  }

  private async _registerPlugin(pluginPath: string) {
    try {
      const resolvedPath = isAbsolute(pluginPath) ? pluginPath : resolve(process.cwd(), pluginPath)
      const imported = await import(resolvedPath)
      const PluginClass = imported.default || imported.Plugin || imported
      const pluginHook: HookName[] = [
        'onBenchmarkStart',
        'onBenchmarkCompleted',
        'onScenarioStart',
        'onScenarioCompleted',
      ]
      if (
        typeof PluginClass === 'function' &&
        pluginHook.some((hook) => typeof PluginClass.prototype[hook] === 'function')
      ) {
        const pluginInstance = new PluginClass()
        for (const hook of pluginHook) {
          if (typeof pluginInstance[hook] === 'function') {
            this._registerHook(
              hook as HookName,
              pluginInstance[hook].bind(pluginInstance) as Parameters<typeof this._registerHook>[1],
            )
          }
        }
      }
    } catch (error) {
      const msg = (error instanceof Error ? error.message : String(error)).split('\n')[0]
      this.log(`\nWarning: Failed to load plugin at ${pluginPath}: ${msg}`)
    }
  }

  private async _runAllAndCollect(scenarios: BenchmarkScenario[]): Promise<BenchmarkReport['endpoints']> {
    const results: BenchmarkReport['endpoints'] = {}
    const gradeThresholds = this._parseGradeTresholds()

    for (const hook of this.hooks.onBenchmarkStart) hook(scenarios)

    BenchmarkProgressBar.create(scenarios.length)

    for (const scenario of scenarios) {
      BenchmarkProgressBar.update(scenario.url, scenario.method!.toUpperCase())

      // eslint-disable-next-line no-await-in-loop
      const result = await this._runScenario(scenario)

      const key = `${scenario.method!.toUpperCase()} ${scenario.path}`
      const grades = {
        p50: getGrade('p50', result.latency.p50, gradeThresholds.p50),
        p90: getGrade('p90', result.latency.p90, gradeThresholds.p90),
        p99: getGrade('p99', result.latency.p99, gradeThresholds.p99),
        rps: getGrade('rps', result.requests.average, gradeThresholds.rps),
      }
      const final = aggregateGrades(grades)

      results[key] = {
        errors: result.errors,
        grades: {...grades, final},
        latency: {
          p50: result.latency.p50,
          p90: result.latency.p90,
          p99: result.latency.p99,
        },
        method: scenario.method!.toUpperCase(),
        path: scenario.path,
        rps: result.requests.average,
      }

      if (this.args['grade-threshold']) {
        const allowed = ['Excellent', 'Good', 'Acceptable', 'Needs Improvement']

        const thresholdIdx = allowed.indexOf(this.args['grade-threshold'])
        const actualIdx = allowed.indexOf(final)

        if (actualIdx > thresholdIdx) {
          process.exitCode = 1
          throw new Error(`❌ Final grade (${final}) is worse than threshold (${this.args['grade-threshold']})`)
        }
      }

      BenchmarkProgressBar.increment()
    }

    BenchmarkProgressBar.stop()

    for (const hook of this.hooks.onBenchmarkCompleted) hook(scenarios, results)

    return results
  }

  private async _runScenario(scenario: BenchmarkScenario) {
    for (const hook of this.hooks.onScenarioStart) hook(scenario)

    const result = await autocannon({
      body: scenario.body,
      connections: this.args.connections,
      duration: this.args.duration,
      headers: scenario.headers,
      method: scenario.method,
      url: scenario.url,
    })

    if (this.args['latency-threshold'] && result.latency.p90 > this.args['latency-threshold']) {
      process.exitCode = 1
      throw new Error(
        `❌ Latency p90 (${result.latency.p90}ms) exceeds threshold (${this.args['latency-threshold']}ms)`,
      )
    }

    if (this.args['throughput-threshold'] && result.requests.average < this.args['throughput-threshold']) {
      process.exitCode = 1
      throw new Error(
        `❌ Throughput (${result.requests.average} RPS) is below threshold (${this.args['throughput-threshold']} RPS)`,
      )
    }

    for (const hook of this.hooks.onScenarioCompleted) hook(scenario, result)

    return result
  }

  private _verifyArgs() {
    const isSpecUrl = this.args.spec && isUrl(this.args.spec)
    const isComparison = Boolean(this.args['compare-with'])

    // 1. spec is a URL, single benchmark: only spec required
    if (isSpecUrl && !isComparison) {
      // OK: only spec (URL) required
    }

    // 2. spec is a file, single benchmark: require --url
    if (!isSpecUrl && !isComparison && !this.args.url) {
      process.exitCode = 1
      throw new Error('When using a spec file for single benchmarking, you must provide --url')
    }

    // 3. spec is a URL, comparison: require --compare-with
    if (isSpecUrl && isComparison && !this.args['compare-with']) {
      process.exitCode = 1
      throw new Error('When using a spec URL for comparison, you must provide --compare-with')
    }

    // 4. spec is a file, comparison: require --url and --compare-with
    if (!isSpecUrl && isComparison) {
      if (!this.args.url) {
        process.exitCode = 1
        throw new Error('When using a spec file for comparison, you must provide --url')
      }

      if (!this.args['compare-with']) {
        process.exitCode = 1
        throw new Error('When using a spec file for comparison, you must provide --compare-with')
      }
    }
    // fallback: spec is required
    else if (!this.args.spec) {
      process.exitCode = 1
      throw new Error('spec is required')
    }
  }
}
