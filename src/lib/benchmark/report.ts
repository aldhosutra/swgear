/* eslint-disable camelcase */
import {readFileSync, writeFileSync} from 'node:fs'
import {extname} from 'node:path'

import {BenchmarkEndpointMetrics, BenchmarkReport} from '../../types'
import {aggregateFinalGrades} from './grade'

export function writeOutput(filePath: string, content: string) {
  writeFileSync(filePath, content)
}

export const isUrl = (v: string) => /^https?:\/\//.test(v)

export function detectFormatFromExtension(outputPath: string): 'csv' | 'html' | 'json' {
  const ext = extname(outputPath).toLowerCase()
  if (ext.endsWith('json')) return 'json'
  if (ext.endsWith('csv')) return 'csv'
  if (ext.endsWith('html') || ext.endsWith('htm')) return 'html'

  process.exitCode = 1
  throw new Error(`Unsupported output file format: ${ext}`)
}

export async function loadFileReport(input: string): Promise<BenchmarkReport> {
  const raw = readFileSync(input, 'utf8')
  const ext = extname(input).toLowerCase()

  let report: BenchmarkReport
  if (ext.endsWith('json')) {
    report = parseJsonReport(raw)
  } else if (ext.endsWith('csv')) {
    report = parseCsvReport(raw)
  } else if (ext.endsWith('html') || ext.endsWith('htm')) {
    report = parseHtmlReport(raw)
  } else {
    process.exitCode = 1
    throw new Error(`Unsupported input: ${input}`)
  }

  if (!isReport(report)) {
    process.exitCode = 1
    throw new Error('Loaded file is not a valid Report')
  }

  return report
}

function isReport(obj: Record<'endpoints' | 'label' | 'timestamp', unknown>): obj is BenchmarkReport {
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

function parseJsonReport(raw: string): BenchmarkReport {
  let obj: unknown
  try {
    obj = JSON.parse(raw)
  } catch {
    process.exitCode = 1
    throw new Error('Invalid JSON format')
  }

  if (!obj || typeof obj !== 'object') {
    process.exitCode = 1
    throw new Error('JSON does not contain an object')
  }

  const report = obj as Partial<BenchmarkReport>
  if (
    typeof report.label !== 'string' ||
    typeof report.timestamp !== 'string' ||
    !report.endpoints ||
    typeof report.endpoints !== 'object' ||
    Array.isArray(report.endpoints)
  ) {
    process.exitCode = 1
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
      process.exitCode = 1
      throw new Error(`Invalid or missing field(s) in JSON report endpoint: ${key}`)
    }
  }

  return report as BenchmarkReport
}

function isValidRowOrCells(rowOrCells: string[] | unknown[], line: number): boolean {
  const [method, path, rps, rps_grade, p50, p50_grade, p90, p90_grade, p99, p99_grade, errors, final_grade] = rowOrCells
  if (
    method === undefined ||
    path === undefined ||
    rps === undefined ||
    p50 === undefined ||
    p90 === undefined ||
    p99 === undefined ||
    p50_grade === undefined ||
    p90_grade === undefined ||
    p99_grade === undefined ||
    rps_grade === undefined ||
    final_grade === undefined ||
    errors === undefined
  ) {
    process.exitCode = 1
    throw new Error(`Invalid or missing report field(s) at line ${line}`)
  }

  return true
}

function parseCsvReport(csv: string): BenchmarkReport {
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

  const endpoints: Record<string, BenchmarkEndpointMetrics> = {}
  for (let i = startIdx; i < lines.length; i++) {
    const row = lines[i].split(',').map((cell) => JSON.parse(cell))
    const [method, path, rps, rps_grade, p50, p50_grade, p90, p90_grade, p99, p99_grade, errors, final_grade] = row
    isValidRowOrCells(row, i + 1)

    endpoints[method + path] = {
      errors: Number(errors),
      grades: {
        final: final_grade,
        p50: p50_grade,
        p90: p90_grade,
        p99: p99_grade,
        rps: rps_grade,
      },
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
    finalGrade: aggregateFinalGrades(endpoints),
    label,
    timestamp,
  }
}

function parseHtmlReport(html: string): BenchmarkReport {
  // Extract label and timestamp
  const labelMatch = html.match(/<strong>Label:<\/strong>\s*([^<]*)/)
  const timestampMatch = html.match(/<strong>Timestamp:<\/strong>\s*([^<]*)/)
  const label = labelMatch ? labelMatch[1].trim() : ''
  const timestamp = timestampMatch ? timestampMatch[1].trim() : ''

  // Extract table rows from HTML
  const rowRegex = /<tr>([\s\S]*?)<\/tr>/g
  const cellRegex = /<td>([\s\S]*?)<\/td>/g
  const endpoints: Record<string, BenchmarkEndpointMetrics> = {}
  const rows = [...html.matchAll(rowRegex)]

  // Skip header row, start from 1
  for (let i = 1; i < rows.length; i++) {
    const cells = [...rows[i][1].matchAll(cellRegex)].map((m) => m[1].replaceAll(/<[^>]+>/g, '').trim())
    if (cells.length < 7) continue
    const [method, path, rps, rps_grade, p50, p50_grade, p90, p90_grade, p99, p99_grade, errors, final_grade] = cells
    isValidRowOrCells(cells, i)

    endpoints[method + path] = {
      errors: Number(errors),
      grades: {
        final: final_grade,
        p50: p50_grade,
        p90: p90_grade,
        p99: p99_grade,
        rps: rps_grade,
      },
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
    finalGrade: aggregateFinalGrades(endpoints),
    label,
    timestamp,
  }
}
