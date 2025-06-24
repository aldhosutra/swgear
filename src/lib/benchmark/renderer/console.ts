import {BenchmarkComparisonReport, BenchmarkReport} from '../../../types'

export function renderConsoleFromComparison(results: BenchmarkComparisonReport) {
  console.table(
    results.map((r) => ({
      'baseline grade': r.baseline.grades?.final ?? '',
      'baseline p90': r.baseline.latency.p90.toFixed(1),
      'baseline p99': r.baseline.latency.p99.toFixed(1),
      'baseline rps': r.baseline.rps.toFixed(1),
      'delta p90': r.delta.p90.toFixed(1),
      'delta p99': r.delta.p99.toFixed(1),
      'delta rps': r.delta.rps.toFixed(1),
      method: r.method,
      path: r.path,
      'target grade': r.target.grades?.final ?? '',
      'target p90': r.target.latency.p90.toFixed(1),
      'target p99': r.target.latency.p99.toFixed(1),
      'target rps': r.target.rps.toFixed(1),
    })),
  )
}

export function renderConsoleFromReport(report: BenchmarkReport) {
  console.table(
    Object.values(report.endpoints).map((e) => ({
      errors: e.errors,
      'final grade': e.grades.final,
      method: e.method,
      p50: e.latency.p50.toFixed(1),
      p90: e.latency.p90.toFixed(1),
      'p90 grade': e.grades.p90,
      p99: e.latency.p99.toFixed(1),
      'p99 grade': e.grades.p99,
      path: e.path,
      rps: e.rps.toFixed(1),
      'rps grade': e.grades.rps,
    })),
  )
}
