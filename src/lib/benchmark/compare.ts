import {BenchmarkComparisonReport, BenchmarkEndpointMetrics, BenchmarkMetric, BenchmarkReport} from '../../types'

function percentChangeLatency(newValue: number, oldValue: number): number {
  if (oldValue === newValue) return 0

  if (oldValue > newValue) {
    if (newValue === 0) return Infinity
    return ((oldValue - newValue) / newValue) * 100
  }

  if (oldValue === 0) return -Infinity
  return ((newValue - oldValue) / oldValue) * -100
}

function percentChangeRps(newValue: number, oldValue: number): number {
  if (oldValue === newValue) return 0

  if (oldValue > newValue) {
    if (newValue === 0) return -Infinity
    return ((newValue - oldValue) / newValue) * 100
  }

  if (oldValue === 0) return Infinity
  return ((oldValue - newValue) / oldValue) * -100
}

export function formatPercent(val: number): string {
  if (val === null) return 'N/A'
  const sign = val > 0 ? '+' : val < 0 ? '-' : ''
  return sign + Math.abs(val).toFixed(1) + '%'
}

export function compareReports(newReport: BenchmarkReport, oldReport: BenchmarkReport): BenchmarkComparisonReport {
  const results: BenchmarkComparisonReport = []

  // eslint-disable-next-line guard-for-in
  for (const key in newReport.endpoints) {
    const base = oldReport.endpoints[key]
    const targ = newReport.endpoints[key]
    if (!targ) continue // skip if missing in target (oldReport)

    results.push({
      baseline: base,
      delta: {
        p50: targ.latency.p50 - base.latency.p50,
        p90: targ.latency.p90 - base.latency.p90,
        p99: targ.latency.p99 - base.latency.p99,
        rps: targ.rps - base.rps,
      },
      method: base.method,
      path: base.path,
      percentChange: {
        p50: percentChangeLatency(targ.latency.p50, base.latency.p50),
        p90: percentChangeLatency(targ.latency.p90, base.latency.p90),
        p99: percentChangeLatency(targ.latency.p99, base.latency.p99),
        rps: percentChangeRps(targ.rps, base.rps),
      },
      target: targ,
    })
  }

  return results
}

export function sortEndpoints(
  endpoints: Record<string, BenchmarkEndpointMetrics>,
  sortBy: BenchmarkMetric = 'p50',
): BenchmarkEndpointMetrics[] {
  return Object.values(endpoints).sort((a, b) =>
    sortBy === 'rps' ? b.rps - a.rps : a.latency[sortBy] - b.latency[sortBy],
  )
}

export function sortComparisonResults(
  results: BenchmarkComparisonReport,
  sortBy: BenchmarkMetric = 'p50',
): BenchmarkComparisonReport {
  return results.sort((a, b) =>
    sortBy === 'rps'
      ? (b.percentChange[sortBy] ?? 0) - (a.percentChange[sortBy] ?? 0)
      : (a.percentChange[sortBy] ?? 0) - (b.percentChange[sortBy] ?? 0),
  )
}
