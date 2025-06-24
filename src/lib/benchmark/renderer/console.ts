import {BenchmarkComparisonReport, BenchmarkReport} from '../../../types'

export function renderConsoleFromComparison(results: BenchmarkComparisonReport) {
  console.table(
    results.map((r) => ({
      method: r.method,
      path: r.path,
      'Δ p90': r.delta.p90.toFixed(1),
      'Δ p99': r.delta.p99.toFixed(1),
      'Δ rps': r.delta.rps.toFixed(1),
    })),
  )
}

export function renderConsoleFromReport(report: BenchmarkReport) {
  console.table(
    Object.values(report.endpoints).map((e) => ({
      errors: e.errors,
      method: e.method,
      p90: e.latency.p90.toFixed(1),
      p99: e.latency.p99.toFixed(1),
      path: e.path,
      rps: e.rps.toFixed(1),
    })),
  )
}
