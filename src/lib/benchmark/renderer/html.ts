import {BenchmarkComparisonReport, BenchmarkMetric, BenchmarkReport} from '../../../types'
import {formatPercent, sortComparisonResults, sortEndpoints} from '../compare'

export function renderHtmlFromComparison(results: BenchmarkComparisonReport, sortBy: BenchmarkMetric = 'p50'): string {
  const style = `
    <style>
      body { font-family: sans-serif; padding: 1em; }
      table { border-collapse: collapse; width: 100%; }
      th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
      th { background: #f0f0f0; }
      .pos { color: green; }
      .neg { color: red; }
      .Excellent { color: green; }
      .Good { color: #2a7; }
      .Acceptable { color: orange; }
      .Needs\\ Improvement { color: red; }
    </style>
  `

  const rows = sortComparisonResults(results, sortBy)
    .map(
      (r) => `
    <tr>
      <td>${r.method}</td>
      <td>${r.path}</td>
      <td>${r.baseline.rps.toFixed(1)}</td>
      <td>${r.target.rps.toFixed(1)}</td>
      <td>${r.delta.rps.toFixed(1)}</td>
      <td class="${r.percentChange.rps === null ? '' : r.percentChange.rps > 0 ? 'neg' : 'pos'}">${formatPercent(
        r.percentChange.rps,
      )}</td>
      <td class="${r.baseline.grades.rps}">${r.baseline.grades.rps}</td>
      <td class="${r.target.grades.rps}">${r.target.grades.rps}</td>
      <td>${r.baseline.latency.p50.toFixed(1)}</td>
      <td>${r.target.latency.p50.toFixed(1)}</td>
      <td>${r.delta.p50.toFixed(1)}</td>
      <td class="${r.percentChange.p50 === null ? '' : r.percentChange.p50 > 0 ? 'neg' : 'pos'}">${formatPercent(
        r.percentChange.p50,
      )}</td>
      <td class="${r.baseline.grades.p50}">${r.baseline.grades.p50}</td>
      <td class="${r.target.grades.p50}">${r.target.grades.p50}</td>
      <td>${r.baseline.latency.p90.toFixed(1)}</td>
      <td>${r.target.latency.p90.toFixed(1)}</td>
      <td>${r.delta.p90.toFixed(1)}</td>
      <td class="${r.percentChange.p90 === null ? '' : r.percentChange.p90 > 0 ? 'neg' : 'pos'}">${formatPercent(
        r.percentChange.p90,
      )}</td>
      <td class="${r.baseline.grades.p90}">${r.baseline.grades.p90}</td>
      <td class="${r.target.grades.p90}">${r.target.grades.p90}</td>
      <td>${r.baseline.latency.p99.toFixed(1)}</td>
      <td>${r.target.latency.p99.toFixed(1)}</td>
      <td>${r.delta.p99.toFixed(1)}</td>
      <td class="${r.percentChange.p99 === null ? '' : r.percentChange.p99 > 0 ? 'neg' : 'pos'}">${formatPercent(
        r.percentChange.p99,
      )}</td>
      <td class="${r.baseline.grades.p99}">${r.baseline.grades.p99}</td>
      <td class="${r.target.grades.p99}">${r.target.grades.p99}</td>
      <td class="${r.baseline.grades.final}">${r.baseline.grades.final}</td>
      <td class="${r.target.grades.final}">${r.target.grades.final}</td>
    </tr>
  `,
    )
    .join('\n')

  return `
    <html>
    <head>
      <meta charset="utf-8">
      <title>Swagbench Comparison Report</title>
      ${style}
    </head>
    <body>
      <h1>Swagbench Comparison Report</h1>
      <table>
        <thead>
          <tr>
            <th>Method</th>
            <th>Path</th>
            <th>Baseline RPS</th>
            <th>Target RPS</th>
            <th>Δ RPS</th>
            <th>%Δ RPS</th>
            <th>Baseline RPS Grade</th>
            <th>Target RPS Grade</th>
            <th>Baseline p50</th>
            <th>Target p50</th>
            <th>Δ p50</th>
            <th>%Δ p50</th>
            <th>Baseline p50 Grade</th>
            <th>Target p50 Grade</th>
            <th>Baseline p90</th>
            <th>Target p90</th>
            <th>Δ p90</th>
            <th>%Δ p90</th>
            <th>Baseline p90 Grade</th>
            <th>Target p90 Grade</th>
            <th>Baseline p99</th>
            <th>Target p99</th>
            <th>Δ p99</th>
            <th>%Δ p99</th>
            <th>Baseline p99 Grade</th>
            <th>Target p99 Grade</th>
            <th>Baseline Grade</th>
            <th>Target Grade</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    </body>
    </html>
  `
}

export function renderHtmlFromReport(report: BenchmarkReport, sortBy: BenchmarkMetric = 'p50'): string {
  const style = `
    <style>
      body { font-family: sans-serif; padding: 1em; }
      table { border-collapse: collapse; width: 100%; }
      th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
      th { background: #f0f0f0; }
      .Excellent { color: green; }
      .Good { color: #2a7; }
      .Acceptable { color: orange; }
      .Needs\\ Improvement { color: red; }
    </style>
  `

  const meta = `
    <div style="margin-bottom:1em;">
      <strong>Label:</strong> ${report.label || ''}<br/>
      <strong>Timestamp:</strong> ${report.timestamp || ''}
    </div>
  `
  const rows = sortEndpoints(report.endpoints, sortBy)
    .map(
      (e) => `
    <tr>
      <td>${e.method}</td>
      <td>${e.path}</td>
      <td>${e.rps.toFixed(1)}</td>
      <td class="${e.grades.rps}">${e.grades.rps}</td>
      <td>${e.latency.p50.toFixed(1)}</td>
      <td class="${e.grades.p50}">${e.grades.p50}</td>
      <td>${e.latency.p90.toFixed(1)}</td>
      <td class="${e.grades.p90}">${e.grades.p90}</td>
      <td>${e.latency.p99.toFixed(1)}</td>
      <td class="${e.grades.p99}">${e.grades.p99}</td>
      <td>${e.errors}</td>
      <td class="${e.grades.final}">${e.grades.final}</td>
    </tr>
  `,
    )
    .join('\n')
  return `
    <html>
    <head>
      <meta charset="utf-8">
      <title>Swagbench Report</title>
      ${style}
    </head>
    <body>
      <h1>Swagbench Report</h1>
      ${meta}
      <table>
        <thead>
          <tr>
            <th>Method</th>
            <th>Path</th>
            <th>RPS</th>
            <th>RPS Grade</th>
            <th>p50</th>
            <th>p50 Grade</th>
            <th>p90</th>
            <th>p90 Grade</th>
            <th>p99</th>
            <th>p99 Grade</th>
            <th>Errors</th>
            <th>Final Grade</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    </body>
    </html>
  `
}
