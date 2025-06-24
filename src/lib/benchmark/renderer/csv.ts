import {BenchmarkComparisonReport, BenchmarkReport} from '../../../types'

export function renderCsvFromComparison(results: BenchmarkComparisonReport): string {
  const header = [
    'method',
    'path',
    'baseline_rps',
    'target_rps',
    'delta_rps',
    'baseline_rps_grade',
    'target_rps_grade',
    'baseline_p50',
    'target_p50',
    'delta_p50',
    'baseline_p50_grade',
    'target_p50_grade',
    'baseline_p90',
    'target_p90',
    'delta_p90',
    'baseline_p90_grade',
    'target_p90_grade',
    'baseline_p99',
    'target_p99',
    'delta_p99',
    'baseline_p99_grade',
    'target_p99_grade',
    'baseline_grade',
    'target_grade',
  ]

  const rows = results.map((r) => [
    r.method,
    r.path,
    r.baseline.rps,
    r.target.rps,
    r.delta.rps,
    r.baseline.grades.rps,
    r.target.grades.rps,
    r.baseline.latency.p50,
    r.target.latency.p50,
    r.delta.p50,
    r.baseline.grades.p50,
    r.target.grades.p50,
    r.baseline.latency.p90,
    r.target.latency.p90,
    r.delta.p90,
    r.baseline.grades.p90,
    r.target.grades.p90,
    r.baseline.latency.p99,
    r.target.latency.p99,
    r.delta.p99,
    r.baseline.grades.p99,
    r.target.grades.p99,
    r.baseline.grades.final,
    r.target.grades.final,
  ])

  return [header, ...rows].map((row) => row.map((cell) => JSON.stringify(cell)).join(',')).join('\n')
}

export function renderCsvFromReport(report: BenchmarkReport): string {
  const meta = [`label: ${JSON.stringify(report.label)}`, `timestamp: ${JSON.stringify(report.timestamp)}`].join(',')
  const header = [
    'method',
    'path',
    'rps',
    'rps_grade',
    'p50',
    'p50_grade',
    'p90',
    'p90_grade',
    'p99',
    'p99_grade',
    'errors',
    'final_grade',
  ]
  const rows = Object.values(report.endpoints).map((e) => [
    e.method,
    e.path,
    e.rps,
    e.grades.rps,
    e.latency.p50,
    e.grades.p50,
    e.latency.p90,
    e.grades.p90,
    e.latency.p99,
    e.grades.p99,
    e.errors,
    e.grades.final,
  ])
  return [meta, header, ...rows]
    .map((row) => (Array.isArray(row) ? row.map((cell) => JSON.stringify(cell)).join(',') : row))
    .join('\n')
}
