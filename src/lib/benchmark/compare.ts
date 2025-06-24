import {BenchmarkComparisonReport, BenchmarkEndpointMetrics, BenchmarkMetric, BenchmarkReport} from '../../types'

function percentChangeLatency(baseline: number, comparison: number): number {
  if (baseline === 0) return 0
  return ((baseline - comparison) / baseline) * 100
}

function percentChangeRps(baseline: number, comparison: number): number {
  if (baseline === 0) return 0
  return ((comparison - baseline) / baseline) * 100
}

export function formatPercent(val: number): string {
  if (val === null) return 'N/A'
  const sign = val > 0 ? '+' : val < 0 ? '-' : ''
  return sign + Math.abs(val).toFixed(1) + '%'
}

export function compareReports(baseline: BenchmarkReport, target: BenchmarkReport): BenchmarkComparisonReport {
  const results: BenchmarkComparisonReport = []

  // eslint-disable-next-line guard-for-in
  for (const key in baseline.endpoints) {
    const base = baseline.endpoints[key]
    const targ = target.endpoints[key]
    if (!targ) continue // skip if missing in target

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
        p50: percentChangeLatency(base.latency.p50, targ.latency.p50),
        p90: percentChangeLatency(base.latency.p90, targ.latency.p90),
        p99: percentChangeLatency(base.latency.p99, targ.latency.p99),
        rps: percentChangeRps(base.rps, targ.rps),
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
