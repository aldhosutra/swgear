import {BenchmarkComparisonReport, BenchmarkReport} from '../../../types'

export function renderJsonFromReport(input: BenchmarkReport, pretty: boolean = true): string {
  return JSON.stringify(input, null, pretty ? 2 : 0)
}

export function renderJsonFromComparison(input: BenchmarkComparisonReport, pretty: boolean = true): string {
  return JSON.stringify(input, null, pretty ? 2 : 0)
}
