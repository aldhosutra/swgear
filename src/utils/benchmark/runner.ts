/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-unsafe-function-type */

import * as SwaggerParser from '@apidevtools/swagger-parser'
import * as autocannon from 'autocannon'

import {HookName, Report, Scenario, SWGRArgs} from '../../types'
import {compareReports} from './compare'
import {renderConsoleFromComparison, renderConsoleFromReport} from './renderer/console'
import {renderCsvFromComparison, renderCsvFromReport} from './renderer/csv'
import {renderHtmlFromComparison, renderHtmlFromReport} from './renderer/html'
import {renderJsonReport} from './renderer/json'
import {detectFormatFromExtension, isJsonFile, isUrl, loadReport, writeOutput} from './report'
import {loadSpec} from './spec'

export class Runner {
  private args: SWGRArgs
  private hooks: Record<HookName, Function[]>

  constructor(public opts: SWGRArgs) {
    this.args = opts
    this.hooks = {onRequestResponse: [], onScenarioComplete: [], onScenarioStart: []}
  }

  registerHook(name: HookName, fn: Function) {
    if (!this.hooks[name]) throw new Error(`Unknown hook ${name}`)
    this.hooks[name].push(fn)
  }

  async run() {
    if (this.args.compareWith && isUrl(this.args.compareWith) && isUrl(this.args.url) && !this.args.spec) {
      throw new Error('spec is required when benchmarking a URL')
    }

    const reportA = await this._loadReportOrRun(this.args.url, this.args.label || 'Baseline Report')

    const reportB = this.args.compareWith
      ? await this._loadReportOrRun(this.args.compareWith, this.args.compareLabel || 'Comparison Report')
      : undefined

    this._handleOutput(reportA, reportB)
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

    if (isJsonFile(urlOrFile)) {
      return loadReport(urlOrFile)
    }

    throw new Error(`Invalid input: ${urlOrFile}`)
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
}
