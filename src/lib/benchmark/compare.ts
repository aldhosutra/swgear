import {BenchmarkComparisonReport, BenchmarkReport} from '../../types'

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
      target: targ,
    })
  }

  return results
}
