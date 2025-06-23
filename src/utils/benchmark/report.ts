import {existsSync, readFileSync, writeFileSync} from 'node:fs'
import {extname} from 'node:path'

import {Report} from '../../types'

export function detectFormatFromExtension(outputPath: string): 'csv' | 'html' | 'json' {
  const ext = extname(outputPath).toLowerCase()
  if (ext.endsWith('json')) return 'json'
  if (ext.endsWith('csv')) return 'csv'
  if (ext.endsWith('html') || ext.endsWith('htm')) return 'html'
  throw new Error(`Unsupported output file format: ${ext}`)
}

export async function loadReport(input: string): Promise<Report> {
  const raw = readFileSync(input, 'utf8')
  return JSON.parse(raw)
}

export function writeOutput(filePath: string, content: string) {
  writeFileSync(filePath, content)
  console.log(`\n📄 Report saved to ${filePath}`)
}

export const isUrl = (v: string) => /^https?:\/\//.test(v)

export const isJsonFile = (v: string) => existsSync(v) && v.endsWith('.json')
