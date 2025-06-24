import {BenchmarkComparisonResult, BenchmarkReport} from '../../../types'

export function renderJsonReport(input: BenchmarkComparisonResult[] | BenchmarkReport, pretty: boolean = true): string {
  return JSON.stringify(input, null, pretty ? 2 : 0)
}
