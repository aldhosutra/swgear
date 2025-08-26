import * as autocannon from 'autocannon'

import {BenchmarkRunner} from '../lib/benchmark/runner'

export type HookName = 'onBenchmarkCompleted' | 'onBenchmarkStart' | 'onScenarioCompleted' | 'onScenarioStart'

export interface BenchmarkHook {
  onBenchmarkCompleted: Array<(scenarios: BenchmarkScenario[], results: BenchmarkReport['endpoints']) => void>
  onBenchmarkStart: Array<(scenarios: BenchmarkScenario[]) => void>
  onScenarioCompleted: Array<(scenario: BenchmarkScenario, result: autocannon.Result) => void>
  onScenarioStart: Array<(scenario: BenchmarkScenario) => void>
}

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
  'grade-threshold'?: string
  label: string
  'latency-threshold': number | undefined
  output: string | undefined
  'p50-range'?: string
  'p90-range'?: string
  'p99-range'?: string
  param?: string[]
  plugins: string[]
  'rps-range'?: string
  skip?: string[]
  'sort-by'?: BenchmarkMetric
  spec: string | undefined
  'throughput-threshold': number | undefined
  url: string | undefined
}

export type BechmarkPlugin = (runner: BenchmarkRunner, opts: BenchmarkArgs) => void

export type BenchmarkScenario = {
  body?: Buffer<ArrayBufferLike> | string
  headers?: Record<string, string>
  method: autocannon.Request['method']
  operationId?: string
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
  p50: string
  p90: string
  p99: string
  rps: string
}

export interface BenchmarkComparisonResult {
  baseline: BenchmarkEndpointMetrics
  delta: {
    p50: number
    p90: number
    p99: number
    rps: number
  }
  method: string
  path: string
  percentChange: {
    p50: number
    p90: number
    p99: number
    rps: number
  }
  target: BenchmarkEndpointMetrics
}

export type BenchmarkComparisonReport = BenchmarkComparisonResult[]

export type BenchmarkMetric = 'p50' | 'p90' | 'p99' | 'rps'
