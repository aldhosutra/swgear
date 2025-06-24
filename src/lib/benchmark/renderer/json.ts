import {BenchmarkComparisonReport, BenchmarkMetric, BenchmarkReport} from '../../../types'
import {sortComparisonResults} from '../compare'

export function renderJsonFromReport(
  input: BenchmarkReport,
  _sortBy?: BenchmarkMetric,
  pretty: boolean = true,
): string {
  return JSON.stringify(input, null, pretty ? 2 : 0)
}

export function renderJsonFromComparison(
  input: BenchmarkComparisonReport,
  sortBy?: BenchmarkMetric,
  pretty: boolean = true,
): string {
  return JSON.stringify(sortComparisonResults(input, sortBy), null, pretty ? 2 : 0)
}
