/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-unsafe-function-type */

import * as SwaggerParser from '@apidevtools/swagger-parser'
import * as autocannon from 'autocannon'
import {OpenAPIV2, OpenAPIV3} from 'openapi-types'

import {HookName, Logger, Report, Scenario, SwaggerV1Document, SWGRArgs, SWGRFlags} from '../../types'
import {compareReports} from './compare'
import {renderConsoleFromComparison, renderConsoleFromReport} from './renderer/console'
import {renderCsvFromComparison, renderCsvFromReport} from './renderer/csv'
import {renderHtmlFromComparison, renderHtmlFromReport} from './renderer/html'
import {renderJsonReport} from './renderer/json'
import {detectFormatFromExtension, isUrl, loadFileReport, writeOutput} from './report'
import {loadSpec} from './spec'

export class Runner {
  private args: SWGRFlags
  private hooks: Record<HookName, Function[]>
  private log: Logger

  constructor(args: SWGRArgs, flags: SWGRFlags, logger?: Logger) {
    this.log = logger || console.log

    if (args.spec && flags.spec && args.spec !== flags.spec) {
      this.log('Warning: Both positional argument and --spec flag provided. Using positional argument.')
    }

    this.args = flags
    this.args.spec = args.spec || flags.spec
    this.hooks = {onRequestResponse: [], onScenarioComplete: [], onScenarioStart: []}
  }

  registerHook(name: HookName, fn: Function) {
    if (!this.hooks[name]) throw new Error(`Unknown hook ${name}`)
    this.hooks[name].push(fn)
  }

  async run() {
    this._verifyArgs()

    const reportA = await this._loadReportOrRun(await this._getBaseUrl(), this.args.label || 'Baseline Report')

    const reportB = this.args.compareWith
      ? await this._loadReportOrRun(this.args.compareWith, this.args.compareLabel || 'Comparison Report')
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
        return openAPIv1.basePath.replace(/\/$/, '')
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

  private _handleBenchmarkOutput(report: Report) {
    if (this.args.output) {
      const fmt = detectFormatFromExtension(this.args.output)

      const rendered =
        fmt === 'json'
          ? renderJsonReport(report)
          : fmt === 'csv'
          ? renderCsvFromReport(report)
          : renderHtmlFromReport(report)

      writeOutput(this.args.output, rendered)
    } else {
      renderConsoleFromReport(report)
    }
  }

  private _handleComparisonOutput(baselineReport: Report, comparisonReport: Report) {
    const results = compareReports(baselineReport, comparisonReport)

    if (this.args.output) {
      const fmt = detectFormatFromExtension(this.args.output)

      const rendered =
        fmt === 'json'
          ? renderJsonReport(results)
          : fmt === 'csv'
          ? renderCsvFromComparison(results)
          : renderHtmlFromComparison(results)

      writeOutput(this.args.output, rendered)
    } else {
      renderConsoleFromComparison(results)
    }
  }

  private _handleOutput(reportA: Report, reportB?: Report) {
    if (this.args.compareWith && reportB) {
      this._handleComparisonOutput(reportA, reportB)
      return
    }

    this._handleBenchmarkOutput(reportA)
  }

  private async _loadReportOrRun(urlOrFile: string, label: string): Promise<Report> {
    if (isUrl(urlOrFile)) {
      const spec = await loadSpec(this.args.spec!)
      const api = await SwaggerParser.dereference(spec)
      const scenarios: Scenario[] = []

      if (api.paths) {
        for (const [path, methods] of Object.entries(api.paths)) {
          for (const [method] of Object.entries(methods)) {
            scenarios.push({method: method as Scenario['method'], path, url: urlOrFile + path})
          }
        }
      }

      for (const pl of this.args.plugins as string[]) {
        const plugin = require(pl)
        if (typeof plugin === 'function') plugin(this, this.args)
      }

      const endpoints = await this._runAllAndCollect(scenarios)
      return {
        endpoints,
        label,
        timestamp: new Date().toISOString(),
      }
    }

    return loadFileReport(urlOrFile)
  }

  private async _runAllAndCollect(scenarios: Scenario[]): Promise<Report['endpoints']> {
    const results: Report['endpoints'] = {}

    for (const scenario of scenarios) {
      console.log(`\n🚀 Benchmarking ${scenario.method!.toUpperCase()} ${scenario.url}`)
      // eslint-disable-next-line no-await-in-loop
      const result = await this._runScenario(scenario)

      const key = `${scenario.method!.toUpperCase()} ${scenario.path}`
      results[key] = {
        errors: result.errors,
        latency: {
          p50: result.latency.p50,
          p90: result.latency.p90,
          p99: result.latency.p99,
        },
        method: scenario.method!.toUpperCase(),
        path: scenario.path,
        rps: result.requests.average,
      }
    }

    return results
  }

  private async _runScenario(scenario: Scenario) {
    for (const h of this.hooks.onScenarioStart) h(scenario)

    const result = await autocannon({
      body: scenario.body,
      connections: this.args.connections,
      duration: this.args.duration,
      headers: scenario.headers,
      method: scenario.method,
      setupClient: (client) => {
        client.on('response', (_statusCode, resBytes, _responseTime) => {
          let parsed: unknown
          try {
            parsed = JSON.parse(resBytes.toString())
          } catch {
            return
          }

          for (const h of this.hooks.onRequestResponse) h(scenario, parsed, context)
        })
      },
      url: scenario.url,
    })

    for (const h of this.hooks.onScenarioComplete) h(scenario, result)
    return result
  }

  private _verifyArgs() {
    const isSpecUrl = this.args.spec && isUrl(this.args.spec)
    const isComparison = Boolean(this.args.compareWith)

    // 1. spec is a URL, single benchmark: only spec required
    if (isSpecUrl && !isComparison) {
      // OK: only spec (URL) required
    }

    // 2. spec is a file, single benchmark: require url
    if (!isSpecUrl && !isComparison && !this.args.url) {
      throw new Error('When using a spec file for single benchmarking, you must provide --url')
    }

    // 3. spec is a URL, comparison: require compareWith
    if (isSpecUrl && isComparison && !this.args.compareWith) {
      throw new Error('When using a spec URL for comparison, you must provide --compare-with')
    }

    // 4. spec is a file, comparison: require url and compareWith
    if (!isSpecUrl && isComparison) {
      if (!this.args.url) {
        throw new Error('When using a spec file for comparison, you must provide --url')
      }

      if (!this.args.compareWith) {
        throw new Error('When using a spec file for comparison, you must provide --compare-with')
      }
    }
    // fallback: spec is required
    else if (!this.args.spec) {
      throw new Error('spec is required')
    }
  }
}
