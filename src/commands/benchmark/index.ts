import {Args, Command, Flags} from '@oclif/core'

import {BenchmarkRunner} from '../../lib/benchmark'
import {BenchmarkArgs, BenchmarkFlags} from '../../types'

export default class Benchmark extends Command {
  static override args = {
    spec: Args.string({description: 'OpenAPI/Swagger spec file or URL (positional)', required: false}),
  }
  static override description =
    'Run HTTP benchmarks against an OpenAPI/Swagger spec or API, with optional thresholds for CI/CD.'
  static override examples = [
    '$ swgear benchmark https://api.example.com/api.yaml',
    '$ swgear benchmark api.yaml --url https://api.example.com',
    '$ swgear benchmark --spec api.yaml --url https://api.example.com',
    '$ swgear benchmark api.yaml --url https://api.example.com --latency-threshold 200 --throughput-threshold 1000',
    '$ swgear benchmark api.yaml --url https://api.example.com --compare-with https://api.staging.com',
    '$ swgear benchmark api.yaml --url https://api.example.com --output result.json',
  ]
  static override flags = {
    'compare-label': Flags.string({default: 'Benchmark Baseline', description: 'Label for the comparison run'}),
    'compare-with': Flags.string({char: 'w', description: 'Comparison URL or report'}),
    connections: Flags.integer({char: 'c', default: 10, description: 'Number of concurrent connections'}),
    duration: Flags.integer({char: 'd', default: 10, description: 'Duration of the benchmark in seconds'}),
    'grade-range': Flags.string({
      description:
        'Custom grading ranges for p50, p90, p99, and rps as comma-separated values. Example: "p50=50,150,300;p90=100,300,500;p99=200,500,1000;rps=100,20,10". Each value is Excellent,Good,Acceptable.',
      required: false,
    }),
    'grade-threshold': Flags.string({
      description:
        'Minimum allowed final grade for the benchmark (Excellent, Good, Acceptable, Needs Improvement). Fails if the overall grade is worse.',
      options: ['Excellent', 'Good', 'Acceptable', 'Needs Improvement'],
      required: false,
    }),
    label: Flags.string({default: 'Benchmark Report', description: 'Label for this benchmark run'}),
    'latency-threshold': Flags.integer({description: 'Maximum allowed latency (ms) for p90/p95'}),
    output: Flags.string({char: 'o', description: 'Output file'}),
    'p50-range': Flags.string({
      description:
        'Custom grading range for p50 as comma-separated values: Excellent,Good,Acceptable. Example: "50,150,300"',
      required: false,
    }),
    'p90-range': Flags.string({
      description:
        'Custom grading range for p90 as comma-separated values: Excellent,Good,Acceptable. Example: "100,300,500"',
      required: false,
    }),
    'p99-range': Flags.string({
      description:
        'Custom grading range for p99 as comma-separated values: Excellent,Good,Acceptable. Example: "200,500,1000"',
      required: false,
    }),
    param: Flags.string({
      default: [],
      description: 'Set default value for path parameters, e.g. --param petId=123. Can be used multiple times.',
      multiple: true,
    }),
    plugins: Flags.string({char: 'p', default: [], description: 'Plugins to load', multiple: true}),
    'rps-range': Flags.string({
      description:
        'Custom grading range for rps as comma-separated values: Excellent,Good,Acceptable. Example: "100,20,10"',
      required: false,
    }),
    'sort-by': Flags.string({
      default: 'p50',
      description: 'Sort comparison output by this metric (p50, p90, p99, rps)',
      options: ['p50', 'p90', 'p99', 'rps'],
      required: false,
    }),
    spec: Flags.string({char: 's', description: 'OpenAPI/Swagger spec file or URL'}),
    'throughput-threshold': Flags.integer({description: 'Minimum allowed throughput (RPS)'}),
    url: Flags.string({char: 'u', description: 'Base URL for the API'}),
  }

  public async run(): Promise<void> {
    const {args, flags} = await this.parse(Benchmark)
    const runner = new BenchmarkRunner(args as BenchmarkArgs, flags as BenchmarkFlags, this.log.bind(this))
    await runner.run()
  }
}
