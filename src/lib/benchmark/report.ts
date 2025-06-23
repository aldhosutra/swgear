import {readFileSync, writeFileSync} from 'node:fs'
import {extname} from 'node:path'

import {EndpointMetrics, Report} from '../../types'

export function writeOutput(filePath: string, content: string) {
  writeFileSync(filePath, content)
  console.log(`\n📄 Report saved to ${filePath}`)
}

export const isUrl = (v: string) => /^https?:\/\//.test(v)

export function detectFormatFromExtension(outputPath: string): 'csv' | 'html' | 'json' {
  const ext = extname(outputPath).toLowerCase()
  if (ext.endsWith('json')) return 'json'
  if (ext.endsWith('csv')) return 'csv'
  if (ext.endsWith('html') || ext.endsWith('htm')) return 'html'
  throw new Error(`Unsupported output file format: ${ext}`)
}

export async function loadFileReport(input: string): Promise<Report> {
  const raw = readFileSync(input, 'utf8')
  const ext = extname(input).toLowerCase()

  let report: Report
  if (ext.endsWith('json')) {
    report = parseJsonReport(raw)
  } else if (ext.endsWith('csv')) {
    report = parseCsvReport(raw)
  } else if (ext.endsWith('html') || ext.endsWith('htm')) {
    report = parseHtmlReport(raw)
  } else {
    throw new Error(`Unsupported input: ${input}`)
  }

  if (!isReport(report)) {
    throw new Error('Loaded file is not a valid Report')
  }

  return report
}

function isReport(obj: Record<'endpoints' | 'label' | 'timestamp', unknown>): obj is Report {
  return (
    obj !== undefined &&
    typeof obj === 'object' &&
    typeof obj.label === 'string' &&
    typeof obj.timestamp === 'string' &&
    obj.endpoints !== undefined &&
    typeof obj.endpoints === 'object' &&
    !Array.isArray(obj.endpoints)
  )
}

function parseJsonReport(raw: string): Report {
  let obj: unknown
  try {
    obj = JSON.parse(raw)
  } catch {
    throw new Error('Invalid JSON format')
  }

  if (!obj || typeof obj !== 'object') {
    throw new Error('JSON does not contain an object')
  }

  const report = obj as Partial<Report>
  if (
    typeof report.label !== 'string' ||
    typeof report.timestamp !== 'string' ||
    !report.endpoints ||
    typeof report.endpoints !== 'object' ||
    Array.isArray(report.endpoints)
  ) {
    throw new Error('JSON report missing required fields: label, timestamp, or endpoints')
  }

  for (const key in report.endpoints) {
    if (!Object.hasOwn(report.endpoints, key)) continue
    const endpoint = report.endpoints[key]
    if (
      !endpoint ||
      typeof endpoint.method !== 'string' ||
      typeof endpoint.path !== 'string' ||
      typeof endpoint.rps !== 'number' ||
      typeof endpoint.errors !== 'number' ||
      !endpoint.latency ||
      typeof endpoint.latency.p50 !== 'number' ||
      typeof endpoint.latency.p90 !== 'number' ||
      typeof endpoint.latency.p99 !== 'number'
    ) {
      throw new Error(`Invalid or missing field(s) in JSON report endpoint: ${key}`)
    }
  }

  return report as Report
}

function parseCsvReport(csv: string): Report {
  const lines = csv.trim().split(/\r?\n/)
  let label = ''
  let timestamp = ''
  let startIdx = 0
  if (lines[0].startsWith('label:')) {
    const meta = lines[0].split(',')
    label = JSON.parse(meta[0].split(':').slice(1).join(':').trim())
    timestamp = JSON.parse(meta[1].split(':').slice(1).join(':').trim())
    startIdx = 2 // skip meta and header
  } else {
    startIdx = 1 // only header present
  }

  const endpoints: Record<string, EndpointMetrics> = {}
  for (let i = startIdx; i < lines.length; i++) {
    const row = lines[i].split(',').map((cell) => JSON.parse(cell))
    const [method, path, rps, p50, p90, p99, errors] = row
    if (
      method === undefined ||
      path === undefined ||
      rps === undefined ||
      p50 === undefined ||
      p90 === undefined ||
      p99 === undefined ||
      errors === undefined
    ) {
      throw new Error(`Invalid or missing field(s) in CSV report at line ${i + 1}`)
    }

    endpoints[method + path] = {
      errors: Number(errors),
      latency: {
        p50: Number(p50),
        p90: Number(p90),
        p99: Number(p99),
      },
      method,
      path,
      rps: Number(rps),
    }
  }

  return {
    endpoints,
    label,
    timestamp,
  }
}

function parseHtmlReport(html: string): Report {
  // Extract label and timestamp
  const labelMatch = html.match(/<strong>Label:<\/strong>\s*([^<]*)/)
  const timestampMatch = html.match(/<strong>Timestamp:<\/strong>\s*([^<]*)/)
  const label = labelMatch ? labelMatch[1].trim() : ''
  const timestamp = timestampMatch ? timestampMatch[1].trim() : ''

  // Extract table rows from HTML
  const rowRegex = /<tr>([\s\S]*?)<\/tr>/g
  const cellRegex = /<td>([\s\S]*?)<\/td>/g
  const endpoints: Record<string, EndpointMetrics> = {}
  const rows = [...html.matchAll(rowRegex)]
  // Skip header row, start from 1
  for (let i = 1; i < rows.length; i++) {
    const cells = [...rows[i][1].matchAll(cellRegex)].map((m) => m[1].replaceAll(/<[^>]+>/g, '').trim())
    if (cells.length < 7) continue
    const [method, path, rps, p50, p90, p99, errors] = cells
    if (
      method === undefined ||
      path === undefined ||
      rps === undefined ||
      p50 === undefined ||
      p90 === undefined ||
      p99 === undefined ||
      errors === undefined
    ) {
      throw new Error(`Invalid or missing field(s) in HTML report at row ${i}`)
    }

    endpoints[method + path] = {
      errors: Number(errors),
      latency: {
        p50: Number(p50),
        p90: Number(p90),
        p99: Number(p99),
      },
      method,
      path,
      rps: Number(rps),
    }
  }

  return {
    endpoints,
    label,
    timestamp,
  }
}
