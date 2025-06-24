import {BenchmarkComparisonResult, BenchmarkReport} from '../../types'

export function compareReports(baseline: BenchmarkReport, target: BenchmarkReport): BenchmarkComparisonResult[] {
  const results: BenchmarkComparisonResult[] = []

  // eslint-disable-next-line guard-for-in
  for (const key in baseline.endpoints) {
    const base = baseline.endpoints[key]
    const targ = target.endpoints[key]
    if (!targ) continue // skip if missing in target

    results.push({
      baseline: base,
      delta: {
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
