import {BenchmarkComparisonReport, BenchmarkMetric, BenchmarkReport} from '../../../types'
import {formatPercent, sortComparisonResults, sortEndpoints} from '../compare'

function commonHtmlHead(title: string, style: string): string {
  return `
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      ${style}
      <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.3/dist/chart.umd.min.js"></script>
    </head>
  `
}

function commonHtmlFooter(): string {
  return `
    <div class="footer">
      <p>
        Created by
        <a href="https://github.com/aldhosutra/swgear" target="_blank" rel="noopener noreferrer">swgear</a>
        - A CLI suite to supercharge your Swagger/OpenAPI workflow
      </p>
      <p>
        <a href="https://www.npmjs.com/package/swgear" target="_blank" rel="noopener noreferrer">Install on npm</a> |
        <a href="https://github.com/aldhosutra/swgear" target="_blank" rel="noopener noreferrer">Star on GitHub</a> |
        <a href="https://swgear.js.org" target="_blank" rel="noopener noreferrer">Visit the website</a>
      </p>
    </div>

    <details class="technical-terms">
      <summary>Explanation of Technical Terms</summary>
      <p><strong>RPS (Requests Per Second):</strong> The number of requests the system can handle per second. Higher is generally better.</p>
      <p><strong>p50 (50th Percentile Latency):</strong> Also known as the median latency. 50% of requests completed within this time.</p>
      <p><strong>p90 (90th Percentile Latency):</strong> 90% of requests completed within this time. Important for understanding most users’ experience.</p>
      <p><strong>p99 (99th Percentile Latency):</strong> 99% of requests completed within this time. Crucial for identifying outliers and worst-case experience.</p>
      <p><strong>Grades (Excellent, Good, Acceptable, Needs Improvement):</strong> Performance grades assigned based on thresholds for each metric.</p>
    </details>
  `
}

const commonStyle = `
  <style>
    :root {
      --primary-color: #007bff;
      --secondary-color: #6c757d;
      --success-color: #28a745;
      --danger-color: #dc3545;
      --warning-color: #ffc107;
      --info-color: #17a2b8;
      --light-bg: #f8f9fa;
      --dark-bg: #343a40;
      --text-color: #212529;
      --border-color: #dee2e6;
      --header-bg: #e9ecef;
    }

    body {
      font-family: 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      padding: 1.5em;
      line-height: 1.6;
      color: var(--text-color);
      background-color: var(--light-bg);
      margin: 0;
    }

    h1 {
      color: var(--primary-color);
      text-align: center;
      margin-bottom: 1em;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 2em;
      box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
      background-color: #fff;
    }

    th,
    td {
      padding: 0.75em 1em;
      border: 1px solid var(--border-color);
      text-align: left;
      vertical-align: middle;
    }

    th {
      background-color: var(--header-bg);
      font-weight: 600;
      color: var(--secondary-color);
      position: sticky;
      top: 0;
      z-index: 10;
      cursor: pointer; /* Indicate sortable */
    }

    th:hover {
      background-color: #e0e0e0;
    }

    tbody tr:nth-child(even) {
      background-color: #f2f2f2;
    }

    tbody tr:hover {
      background-color: #e9ecef;
    }

    .pos {
      color: var(--success-color);
      font-weight: bold;
    }

    .neg {
      color: var(--danger-color);
      font-weight: bold;
    }

    .Excellent {
      color: var(--success-color);
      font-weight: bold;
    }

    .Good {
      color: var(--info-color);
      font-weight: bold;
    }

    .Acceptable {
      color: var(--warning-color);
      font-weight: bold;
    }

    .Needs.Improvement {
      color: var(--danger-color);
      font-weight: bold;
    }

    .footer {
      text-align: center;
      margin-top: 3em;
      padding-top: 1.5em;
      border-top: 1px solid var(--border-color);
      font-size: 0.9em;
      color: var(--secondary-color);
    }

    .footer a {
      color: var(--primary-color);
      text-decoration: none;
    }

    .footer a:hover {
      text-decoration: underline;
    }

    .technical-terms {
      margin-top: 2em;
      border: 1px solid var(--border-color);
      padding: 1em;
      border-radius: 0.25rem;
      background-color: #fff;
    }

    .technical-terms summary {
      font-weight: bold;
      cursor: pointer;
      color: var(--primary-color);
    }

    .technical-terms p {
      margin-bottom: 0.5em;
      font-size: 0.9em;
    }

    .technical-terms p:last-child {
      margin-bottom: 0;
    }

    .chart-container {
      width: 80%;
      margin: 2em auto;
      background-color: #fff;
      padding: 1em;
      border-radius: 0.25rem;
      box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
    }

    .filter-controls {
      margin-bottom: 1em;
      display: flex;
      gap: 1em;
      align-items: center;
    }

    .filter-controls label {
      font-weight: bold;
      color: var(--secondary-color);
    }

    .filter-controls input[type="text"] {
      padding: 0.5em;
      border: 1px solid var(--border-color);
      border-radius: 0.25rem;
      flex-grow: 1;
      max-width: 300px;
    }
  </style>
`

export function renderHtmlFromComparison(results: BenchmarkComparisonReport, sortBy: BenchmarkMetric = 'p50'): string {
  const sortedResults = sortComparisonResults(results, sortBy)

  const rows = sortedResults
    .map(
      (r) => `
    <tr>
      <td>${r.method}</td>
      <td>${r.path}</td>
      <td>${r.baseline.rps.toFixed(1)}</td>
      <td>${r.target.rps.toFixed(1)}</td>
      <td>${r.delta.rps.toFixed(1)}</td>
      <td class="${r.percentChange.rps === null ? '' : r.percentChange.rps > 0 ? 'pos' : 'neg'}">${formatPercent(
        r.percentChange.rps,
      )}</td>
      <td class="${r.baseline.grades.rps}">${r.baseline.grades.rps}</td>
      <td class="${r.target.grades.rps}">${r.target.grades.rps}</td>
      <td>${r.baseline.latency.p50.toFixed(1)}</td>
      <td>${r.target.latency.p50.toFixed(1)}</td>
      <td>${r.delta.p50.toFixed(1)}</td>
      <td class="${r.percentChange.p50 === null ? '' : r.percentChange.p50 > 0 ? 'pos' : 'neg'}">${formatPercent(
        r.percentChange.p50,
      )}</td>
      <td class="${r.baseline.grades.p50}">${r.baseline.grades.p50}</td>
      <td class="${r.target.grades.p50}">${r.target.grades.p50}</td>
      <td>${r.baseline.latency.p90.toFixed(1)}</td>
      <td>${r.target.latency.p90.toFixed(1)}</td>
      <td>${r.delta.p90.toFixed(1)}</td>
      <td class="${r.percentChange.p90 === null ? '' : r.percentChange.p90 > 0 ? 'pos' : 'neg'}">${formatPercent(
        r.percentChange.p90,
      )}</td>
      <td class="${r.baseline.grades.p90}">${r.baseline.grades.p90}</td>
      <td class="${r.target.grades.p90}">${r.target.grades.p90}</td>
      <td>${r.baseline.latency.p99.toFixed(1)}</td>
      <td>${r.target.latency.p99.toFixed(1)}</td>
      <td>${r.delta.p99.toFixed(1)}</td>
      <td class="${r.percentChange.p99 === null ? '' : r.percentChange.p99 > 0 ? 'pos' : 'neg'}">${formatPercent(
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

  // Prepare data for Chart.js
  const chartLabels = JSON.stringify(sortedResults.map((r) => `${r.method} ${r.path}`))
  const baselineRPS = JSON.stringify(sortedResults.map((r) => r.baseline.rps))
  const targetRPS = JSON.stringify(sortedResults.map((r) => r.target.rps))
  const baselineP50 = JSON.stringify(sortedResults.map((r) => r.baseline.latency.p50))
  const targetP50 = JSON.stringify(sortedResults.map((r) => r.target.latency.p50))
  const baselineP90 = JSON.stringify(sortedResults.map((r) => r.baseline.latency.p90))
  const targetP90 = JSON.stringify(sortedResults.map((r) => r.target.latency.p90))
  const baselineP99 = JSON.stringify(sortedResults.map((r) => r.baseline.latency.p99))
  const targetP99 = JSON.stringify(sortedResults.map((r) => r.target.latency.p99))

  return `
    <!DOCTYPE html>
    <html lang="en">
    ${commonHtmlHead('swgear Comparison Report', commonStyle)}
    <body>
      <h1>swgear Comparison Report</h1>
      <div class="filter-controls">
        <label for="endpointSearch">Search Endpoint:</label>
        <input type="text" id="endpointSearch" placeholder="Type to search Method or Path...">
      </div>
      <table id="benchmarkTable">
        <thead>
          <tr>
            <th scope="col" data-sort-key="method">Method</th>
            <th scope="col" data-sort-key="path">Path</th>
            <th scope="col" data-sort-key="baseline.rps">Baseline RPS</th>
            <th scope="col" data-sort-key="target.rps">Target RPS</th>
            <th scope="col" data-sort-key="delta.rps">Δ RPS</th>
            <th scope="col" data-sort-key="percentChange.rps">%Δ RPS</th>
            <th scope="col" data-sort-key="baseline.grades.rps">Baseline RPS Grade</th>
            <th scope="col" data-sort-key="target.grades.rps">Target RPS Grade</th>
            <th scope="col" data-sort-key="baseline.latency.p50">Baseline p50</th>
            <th scope="col" data-sort-key="target.latency.p50">Target p50</th>
            <th scope="col" data-sort-key="delta.p50">Δ p50</th>
            <th scope="col" data-sort-key="percentChange.p50">%Δ p50</th>
            <th scope="col" data-sort-key="baseline.grades.p50">Baseline p50 Grade</th>
            <th scope="col" data-sort-key="target.grades.p50">Target p50 Grade</th>
            <th scope="col" data-sort-key="baseline.latency.p90">Baseline p90</th>
            <th scope="col" data-sort-key="target.latency.p90">Target p90</th>
            <th scope="col" data-sort-key="delta.p90">Δ p90</th>
            <th scope="col" data-sort-key="percentChange.p90">%Δ p90</th>
            <th scope="col" data-sort-key="baseline.grades.p90">Baseline p90 Grade</th>
            <th scope="col" data-sort-key="target.grades.p90">Target p90 Grade</th>
            <th scope="col" data-sort-key="baseline.latency.p99">Baseline p99</th>
            <th scope="col" data-sort-key="target.latency.p99">Target p99</th>
            <th scope="col" data-sort-key="delta.p99">Δ p99</th>
            <th scope="col" data-sort-key="percentChange.p99">%Δ p99</th>
            <th scope="col" data-sort-key="baseline.grades.p99">Baseline p99 Grade</th>
            <th scope="col" data-sort-key="target.grades.p99">Target p99 Grade</th>
            <th scope="col" data-sort-key="baseline.grades.final">Baseline Grade</th>
            <th scope="col" data-sort-key="target.grades.final">Target Grade</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
      <div class="chart-container">
        <h2>RPS Comparison</h2>
        <canvas id="rpsChart"></canvas>
      </div>
      <div class="chart-container">
        <h2>Latency (p50) Comparison</h2>
        <canvas id="p50Chart"></canvas>
      </div>
      <div class="chart-container">
        <h2>Latency (p90) Comparison</h2>
        <canvas id="p90Chart"></canvas>
      </div>
      <div class="chart-container">
        <h2>Latency (p99) Comparison</h2>
        <canvas id="p99Chart"></canvas>
      </div>
      ${commonHtmlFooter()}
      <script>
        document.addEventListener('DOMContentLoaded', () => {
          const table = document.getElementById('benchmarkTable');
          const tbody = table.querySelector('tbody');
          const initialRows = Array.from(tbody.querySelectorAll('tr')); // Store initial rows
          let currentRows = [...initialRows]; // Working copy of rows
          const headers = table.querySelectorAll('th[data-sort-key]');
          const endpointSearch = document.getElementById('endpointSearch');

          let sortDirection = {}; // Stores sort direction for each column

          // Helper to get cell value, handling numeric and percentage values
          const getCellValue = (row, colIndex, isNumeric) => {
            const cell = row.cells[colIndex];
            if (cell) {
              const text = cell.textContent.trim();
              if (text.endsWith('%')) {
                return parseFloat(text.replace('%', ''));
              }
              return isNumeric ? parseFloat(text) : text;
            }
            return '';
          };

          headers.forEach(header => {
            header.addEventListener('click', () => {
              const key = header.dataset.sortKey;
              // Determine if the column is numeric based on its key
              const isNumeric = ['rps', 'p50', 'p90', 'p99', 'delta', 'percentChange'].some(metric => key.includes(metric));

              // Toggle sort direction
              sortDirection[key] = sortDirection[key] === 'asc' ? 'desc' : 'asc';

              currentRows.sort((a, b) => {
                const headerIndex = Array.from(header.parentNode.children).indexOf(header);
                const valA = getCellValue(a, headerIndex, isNumeric);
                const valB = getCellValue(b, headerIndex, isNumeric);

                if (isNumeric) {
                  return sortDirection[key] === 'asc' ? valA - valB : valB - valA;
                } else {
                  return sortDirection[key] === 'asc' ? String(valA).localeCompare(String(valB)) : String(valB).localeCompare(String(valA));
                }
              });

              // Re-render table with sorted rows
              while (tbody.firstChild) {
                tbody.removeChild(tbody.firstChild);
              }
              currentRows.forEach(row => tbody.appendChild(row));
            });
          });

          endpointSearch.addEventListener('keyup', () => {
            const searchTerm = endpointSearch.value.toLowerCase();
            currentRows = initialRows.filter(row => {
              const method = row.cells[0].textContent.toLowerCase();
              const path = row.cells[1].textContent.toLowerCase();
              return method.includes(searchTerm) || path.includes(searchTerm);
            });

            // Re-render table with filtered rows
            while (tbody.firstChild) {
              tbody.removeChild(tbody.firstChild);
            }
            currentRows.forEach(row => tbody.appendChild(row));
          });

          // Chart.js Integration for Comparison Report
          const rpsCtx = document.getElementById('rpsChart').getContext('2d');
          const p50Ctx = document.getElementById('p50Chart').getContext('2d');
          const p90Ctx = document.getElementById('p90Chart').getContext('2d');
          const p99Ctx = document.getElementById('p99Chart').getContext('2d');

          // Data injected from TypeScript
          const chartLabels = ${chartLabels};
          const baselineRPS = ${baselineRPS};
          const targetRPS = ${targetRPS};
          const baselineP50 = ${baselineP50};
          const targetP50 = ${targetP50};
          const baselineP90 = ${baselineP90};
          const targetP90 = ${targetP90};
          const baselineP99 = ${baselineP99};
          const targetP99 = ${targetP99};

          new Chart(rpsCtx, {
            type: 'bar',
            data: {
              labels: chartLabels,
              datasets: [
                { label: 'Baseline RPS', data: baselineRPS, backgroundColor: 'rgba(0, 123, 255, 0.6)' },
                { label: 'Target RPS', data: targetRPS, backgroundColor: 'rgba(40, 167, 69, 0.6)' }
              ]
            },
            options: {
              responsive: true,
              scales: {
                x: { title: { display: true, text: 'Endpoint' } },
                y: { beginAtZero: true, title: { display: true, text: 'RPS' } }
              }
            }
          });

          new Chart(p50Ctx, {
            type: 'bar',
            data: {
              labels: chartLabels,
              datasets: [
                { label: 'Baseline p50', data: baselineP50, backgroundColor: 'rgba(0, 123, 255, 0.6)' },
                { label: 'Target p50', data: targetP50, backgroundColor: 'rgba(40, 167, 69, 0.6)' }
              ]
            },
            options: {
              responsive: true,
              scales: {
                x: { title: { display: true, text: 'Endpoint' } },
                y: { beginAtZero: true, title: { display: true, text: 'Latency (ms)' } }
              }
            }
          });

          new Chart(p90Ctx, {
            type: 'bar',
            data: {
              labels: chartLabels,
              datasets: [
                { label: 'Baseline p90', data: baselineP90, backgroundColor: 'rgba(0, 123, 255, 0.6)' },
                { label: 'Target p90', data: targetP90, backgroundColor: 'rgba(40, 167, 69, 0.6)' }
              ]
            },
            options: {
              responsive: true,
              scales: {
                x: { title: { display: true, text: 'Endpoint' } },
                y: { beginAtZero: true, title: { display: true, text: 'Latency (ms)' } }
              }
            }
          });

          new Chart(p99Ctx, {
            type: 'bar',
            data: {
              labels: chartLabels,
              datasets: [
                { label: 'Baseline p99', data: baselineP99, backgroundColor: 'rgba(0, 123, 255, 0.6)' },
                { label: 'Target p99', data: targetP99, backgroundColor: 'rgba(40, 167, 69, 0.6)' }
              ]
            },
            options: {
              responsive: true,
              scales: {
                x: { title: { display: true, text: 'Endpoint' } },
                y: { beginAtZero: true, title: { display: true, text: 'Latency (ms)' } }
              }
            }
          });
        });
      </script>
    </body>
    </html>
  `
}

export function renderHtmlFromReport(report: BenchmarkReport, sortBy: BenchmarkMetric = 'p50'): string {
  const sortedEndpoints = sortEndpoints(report.endpoints, sortBy)

  const rows = sortedEndpoints
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

  // Prepare data for Chart.js
  const chartLabels = JSON.stringify(sortedEndpoints.map((e) => `${e.method} ${e.path}`))
  const rpsData = JSON.stringify(sortedEndpoints.map((e) => e.rps))
  const p50Data = JSON.stringify(sortedEndpoints.map((e) => e.latency.p50))
  const p90Data = JSON.stringify(sortedEndpoints.map((e) => e.latency.p90))
  const p99Data = JSON.stringify(sortedEndpoints.map((e) => e.latency.p99))

  const metaHtml = `
    <div class="report-meta">
      <strong>Label:</strong> ${report.label || ''}<br/>
      <strong>Timestamp:</strong> ${report.timestamp || ''}
    </div>
  `

  return `
    <!DOCTYPE html>
    <html lang="en">
    ${commonHtmlHead('swgear Report', commonStyle)}
    <body>
      <h1>swgear Report</h1>
      ${metaHtml}
      <div class="filter-controls">
        <label for="endpointSearch">Search Endpoint:</label>
        <input type="text" id="endpointSearch" placeholder="Type to search Method or Path...">
      </div>
      <table id="benchmarkTable">
        <thead>
          <tr>
            <th scope="col" data-sort-key="method">Method</th>
            <th scope="col" data-sort-key="path">Path</th>
            <th scope="col" data-sort-key="rps">RPS</th>
            <th scope="col" data-sort-key="grades.rps">RPS Grade</th>
            <th scope="col" data-sort-key="latency.p50">p50</th>
            <th scope="col" data-sort-key="grades.p50">p50 Grade</th>
            <th scope="col" data-sort-key="latency.p90">p90</th>
            <th scope="col" data-sort-key="grades.p90">p90 Grade</th>
            <th scope="col" data-sort-key="latency.p99">p99</th>
            <th scope="col" data-sort-key="grades.p99">p99 Grade</th>
            <th scope="col" data-sort-key="errors">Errors</th>
            <th scope="col" data-sort-key="grades.final">Final Grade</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
      <div class="chart-container">
        <h2>RPS Overview</h2>
        <canvas id="rpsChart"></canvas>
      </div>
      <div class="chart-container">
        <h2>Latency (p50) Overview</h2>
        <canvas id="p50Chart"></canvas>
      </div>
      <div class="chart-container">
        <h2>Latency (p90) Overview</h2>
        <canvas id="p90Chart"></canvas>
      </div>
      <div class="chart-container">
        <h2>Latency (p99) Overview</h2>
        <canvas id="p99Chart"></canvas>
      </div>
      ${commonHtmlFooter()}
      <script>
        document.addEventListener('DOMContentLoaded', () => {
          const table = document.getElementById('benchmarkTable');
          const tbody = table.querySelector('tbody');
          const initialRows = Array.from(tbody.querySelectorAll('tr')); // Store initial rows
          let currentRows = [...initialRows]; // Working copy of rows
          const headers = table.querySelectorAll('th[data-sort-key]');
          const endpointSearch = document.getElementById('endpointSearch');

          let sortDirection = {}; // Stores sort direction for each column

          // Helper to get cell value, handling numeric and percentage values
          const getCellValue = (row, colIndex, isNumeric) => {
            const cell = row.cells[colIndex];
            if (cell) {
              const text = cell.textContent.trim();
              if (text.endsWith('%')) {
                return parseFloat(text.replace('%', ''));
              }
              return isNumeric ? parseFloat(text) : text;
            }
            return '';
          };

          headers.forEach(header => {
            header.addEventListener('click', () => {
              const key = header.dataset.sortKey;
              // Determine if the column is numeric based on its key
              const isNumeric = ['rps', 'p50', 'p90', 'p99', 'errors'].some(metric => key.includes(metric));

              // Toggle sort direction
              sortDirection[key] = sortDirection[key] === 'asc' ? 'desc' : 'asc';

              currentRows.sort((a, b) => {
                const headerIndex = Array.from(header.parentNode.children).indexOf(header);
                const valA = getCellValue(a, headerIndex, isNumeric);
                const valB = getCellValue(b, headerIndex, isNumeric);

                if (isNumeric) {
                  return sortDirection[key] === 'asc' ? valA - valB : valB - valA;
                } else {
                  return sortDirection[key] === 'asc' ? String(valA).localeCompare(String(valB)) : String(valB).localeCompare(String(valA));
                }
              });

              // Re-render table with sorted rows
              while (tbody.firstChild) {
                tbody.removeChild(tbody.firstChild);
              }
              currentRows.forEach(row => tbody.appendChild(row));
            });
          });

          endpointSearch.addEventListener('keyup', () => {
            const searchTerm = endpointSearch.value.toLowerCase();
            currentRows = initialRows.filter(row => {
              const method = row.cells[0].textContent.toLowerCase();
              const path = row.cells[1].textContent.toLowerCase();
              return method.includes(searchTerm) || path.includes(searchTerm);
            });

            // Re-render table with filtered rows
            while (tbody.firstChild) {
              tbody.removeChild(tbody.firstChild);
            }
            currentRows.forEach(row => tbody.appendChild(row));
          });

          // Chart.js Integration for Single Report
          const rpsCtx = document.getElementById('rpsChart').getContext('2d');
          const p50Ctx = document.getElementById('p50Chart').getContext('2d');
          const p90Ctx = document.getElementById('p90Chart').getContext('2d');
          const p99Ctx = document.getElementById('p99Chart').getContext('2d');

          // Data injected from TypeScript
          const chartLabels = ${chartLabels};
          const rpsData = ${rpsData};
          const p50Data = ${p50Data};
          const p90Data = ${p90Data};
          const p99Data = ${p99Data};

          new Chart(rpsCtx, {
            type: 'bar',
            data: {
              labels: chartLabels,
              datasets: [
                { label: 'RPS', data: rpsData, backgroundColor: 'rgba(0, 123, 255, 0.6)' }
              ]
            },
            options: {
              responsive: true,
              scales: {
                x: { title: { display: true, text: 'Endpoint' } },
                y: { beginAtZero: true, title: { display: true, text: 'RPS' } }
              }
            }
          });

          new Chart(p50Ctx, {
            type: 'bar',
            data: {
              labels: chartLabels,
              datasets: [
                { label: 'p50 Latency', data: p50Data, backgroundColor: 'rgba(40, 167, 69, 0.6)' }
              ]
            },
            options: {
              responsive: true,
              scales: {
                x: { title: { display: true, text: 'Endpoint' } },
                y: { beginAtZero: true, title: { display: true, text: 'Latency (ms)' } }
              }
            }
          });

          new Chart(p90Ctx, {
            type: 'bar',
            data: {
              labels: chartLabels,
              datasets: [
                { label: 'p90 Latency', data: p90Data, backgroundColor: 'rgba(40, 167, 69, 0.6)' }
              ]
            },
            options: {
              responsive: true,
              scales: {
                x: { title: { display: true, text: 'Endpoint' } },
                y: { beginAtZero: true, title: { display: true, text: 'Latency (ms)' } }
              }
            }
          });

          new Chart(p99Ctx, {
            type: 'bar',
            data: {
              labels: chartLabels,
              datasets: [
                { label: 'p99 Latency', data: p99Data, backgroundColor: 'rgba(40, 167, 69, 0.6)' }
              ]
            },
            options: {
              responsive: true,
              scales: {
                x: { title: { display: true, text: 'Endpoint' } },
                y: { beginAtZero: true, title: { display: true, text: 'Latency (ms)' } }
              }
            }
          });
        });
      </script>
    </body>
    </html>`
}
