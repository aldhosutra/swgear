import {BenchmarkComparisonResult, BenchmarkReport} from '../../../types'

export function renderCsvFromComparison(results: BenchmarkComparisonResult[]): string {
  const header = [
    'method',
    'path',
    'baseline_rps',
    'target_rps',
    'delta_rps',
    'baseline_p90',
    'target_p90',
    'delta_p90',
    'baseline_p99',
    'target_p99',
    'delta_p99',
  ]

  const rows = results.map((r) => [
    r.method,
    r.path,
    r.baseline.rps,
    r.target.rps,
    r.delta.rps,
    r.baseline.latency.p90,
    r.target.latency.p90,
    r.delta.p90,
    r.baseline.latency.p99,
    r.target.latency.p99,
    r.delta.p99,
  ])

  return [header, ...rows].map((row) => row.map((cell) => JSON.stringify(cell)).join(',')).join('\n')
}

export function renderCsvFromReport(report: BenchmarkReport): string {
  const meta = [`label: ${JSON.stringify(report.label)}`, `timestamp: ${JSON.stringify(report.timestamp)}`].join(',')
  const header = ['method', 'path', 'rps', 'p50', 'p90', 'p99', 'errors']
  const rows = Object.values(report.endpoints).map((e) => [
    e.method,
    e.path,
    e.rps,
    e.latency.p50,
    e.latency.p90,
    e.latency.p99,
    e.errors,
  ])
  return [meta, header, ...rows]
    .map((row) => (Array.isArray(row) ? row.map((cell) => JSON.stringify(cell)).join(',') : row))
    .join('\n')
}
