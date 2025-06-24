/* eslint-disable perfectionist/sort-objects */
import {BenchmarkComparisonReport, BenchmarkReport} from '../../../types'

export function renderConsoleFromComparison(results: BenchmarkComparisonReport) {
  console.table(
    results.map((r) => ({
      method: r.method,
      path: r.path,
      'baseline rps': r.baseline.rps.toFixed(1),
      'target rps': r.target.rps.toFixed(1),
      'delta rps': r.delta.rps.toFixed(1),
      'baseline rps grade': r.baseline.grades.rps,
      'target rps grade': r.target.grades.rps,
      'baseline p50': r.baseline.latency.p50.toFixed(1),
      'target p50': r.target.latency.p50.toFixed(1),
      'delta p50': r.delta.p50.toFixed(1),
      'baseline p50 grade': r.baseline.grades.p50,
      'target p50 grade': r.target.grades.p50,
      'baseline p90': r.baseline.latency.p90.toFixed(1),
      'target p90': r.target.latency.p90.toFixed(1),
      'delta p90': r.delta.p90.toFixed(1),
      'baseline p90 grade': r.baseline.grades.p90,
      'target p90 grade': r.target.grades.p90,
      'baseline p99': r.baseline.latency.p99.toFixed(1),
      'target p99': r.target.latency.p99.toFixed(1),
      'delta p99': r.delta.p99.toFixed(1),
      'baseline p99 grade': r.baseline.grades.p99,
      'target p99 grade': r.target.grades.p99,
      'baseline grade': r.baseline.grades.final,
      'target grade': r.target.grades.final,
    })),
  )
}

export function renderConsoleFromReport(report: BenchmarkReport) {
  console.table(
    Object.values(report.endpoints).map((e) => ({
      method: e.method,
      path: e.path,
      rps: e.rps.toFixed(1),
      'rps grade': e.grades.rps,
      p50: e.latency.p50.toFixed(1),
      'p50 grade': e.grades.p50,
      p90: e.latency.p90.toFixed(1),
      'p90 grade': e.grades.p90,
      p99: e.latency.p99.toFixed(1),
      'p99 grade': e.grades.p99,
      errors: e.errors,
      'final grade': e.grades.final,
    })),
  )
}
