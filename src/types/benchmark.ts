import * as autocannon from 'autocannon'

import {BenchmarkRunner} from '../lib/benchmark/runner'

export type HookName = 'onRequestResponse' | 'onScenarioComplete' | 'onScenarioStart'

// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
export type BenchmarkHook = Record<HookName, Function[]>

export type BenchmarkArgs = {
  spec?: string
}

export type BenchmarkFlags = {
  compareLabel?: string
  compareWith?: string
  connections?: number
  duration?: number
  label?: string
  latencyThreshold?: number
  output?: string
  plugins?: string[]
  spec?: string
  throughputThreshold?: number
  url: string
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
  endpoints: Record<string, BenchmarkEndpointMetrics> // key = method + path
  label: string
  timestamp: string
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
