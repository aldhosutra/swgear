import * as autocannon from 'autocannon'

import {BenchmarkRunner} from '../lib/benchmark/runner'

export type HookName = 'onRequestResponse' | 'onScenarioComplete' | 'onScenarioStart'

// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
export type BenchmarkHook = Record<HookName, Function[]>

export type BenchmarkArgs = {
  spec?: string
}

export type BenchmarkGradeThresholds = {
  Acceptable: number
  Excellent: number
  Good: number
}

export type BenchmarkFlags = {
  'compare-label': string
  'compare-with': string | undefined
  connections: number
  duration: number
  'grade-range'?: string
  label: string
  'latency-threshold': number | undefined
  output: string | undefined
  param?: string[]
  plugins: string[]
  spec: string | undefined
  'throughput-threshold': number | undefined
  url: string | undefined
}

export type BechmarkPlugin = (runner: BenchmarkRunner, opts: BenchmarkArgs) => void

export type BenchmarkScenario = {
  body?: Buffer<ArrayBufferLike> | string
  headers?: Record<string, string>
  method: autocannon.Request['method']
  path: string
  url: string
}

export interface BenchmarkEndpointMetrics {
  errors: number
  grades: BenchmarkGrades
  latency: {
    p50: number
    p90: number
    p99: number
  }
  method: string
  path: string
  rps: number
}

export interface BenchmarkReport {
  endpoints: Record<string, BenchmarkEndpointMetrics>
  finalGrade: string
  label: string
  timestamp: string
}

export interface BenchmarkGrades {
  final: string
  p90: string
  p99: string
  rps: string
}

export interface BenchmarkComparisonResult {
  baseline: BenchmarkEndpointMetrics
  delta: {
    p90: number
    p99: number
    rps: number
  }
  method: string
  path: string
  target: BenchmarkEndpointMetrics
}

export type BenchmarkComparisonReport = BenchmarkComparisonResult[]
