import * as autocannon from 'autocannon'

import {Runner} from '../lib/benchmark/runner'

export type HookName = 'onRequestResponse' | 'onScenarioComplete' | 'onScenarioStart'

export type Scenario = {
  body?: Buffer<ArrayBufferLike> | string
  headers?: Record<string, string>
  method: autocannon.Request['method']
  path: string
  url: string
}

export type SWGRArgs = {
  spec?: string
}

export type SWGRFlags = {
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

export type Plugin = (runner: Runner, opts: SWGRArgs) => void

export interface EndpointMetrics {
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

export interface Report {
  endpoints: Record<string, EndpointMetrics> // key = method + path
  label: string
  timestamp: string
}

export interface ComparisonResult {
  baseline: EndpointMetrics
  delta: {
    p90: number
    p99: number
    rps: number
  }
  method: string
  path: string
  target: EndpointMetrics
}
