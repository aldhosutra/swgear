import {Args, Command, Flags} from '@oclif/core'

import {BenchmarkRunner} from '../../lib/benchmark'

export default class Benchmark extends Command {
  static override args = {
    spec: Args.string({description: 'OpenAPI/Swagger spec file or URL (positional)', required: false}),
  }
  static override description =
    'Run HTTP benchmarks against an OpenAPI/Swagger spec or API, with optional thresholds for CI/CD.'
  static override examples = [
    '$ swgr benchmark https://api.example.com/api.yaml',
    '$ swgr benchmark api.yaml --url https://api.example.com',
    '$ swgr benchmark --spec api.yaml --url https://api.example.com',
    '$ swgr benchmark api.yaml --url https://api.example.com --latency-threshold 200 --throughput-threshold 1000',
    '$ swgr benchmark api.yaml --url https://api.example.com --compare-with https://api.staging.com',
    '$ swgr benchmark api.yaml --url https://api.example.com --output result.json',
  ]
  static override flags = {
    'compare-label': Flags.string({default: 'Comparison Report', description: 'Label for the comparison run'}),
    'compare-with': Flags.string({char: 'w', description: 'Comparison URL or report'}),
    connections: Flags.integer({char: 'c', default: 10, description: 'Number of concurrent connections'}),
    duration: Flags.integer({char: 'd', default: 10, description: 'Duration of the benchmark in seconds'}),
    'grade-range': Flags.string({
      description:
        'Custom grading ranges for p90, p99, and rps as JSON. Example: {"p90":{"Excellent":100,"Good":300,"Acceptable":500},"p99":{"Excellent":200,"Good":500,"Acceptable":1000},"rps":{"Excellent":100,"Good":20,"Acceptable":10}}',
      required: false,
    }),
    label: Flags.string({default: 'Baseline Report', description: 'Label for this benchmark run'}),
    'latency-threshold': Flags.integer({description: 'Maximum allowed latency (ms) for p90/p95'}),
    output: Flags.string({char: 'o', description: 'Output file'}),
    param: Flags.string({
      default: [],
      description: 'Set default value for path parameters, e.g. --param petId=123. Can be used multiple times.',
      multiple: true,
    }),
    plugins: Flags.string({char: 'p', default: [], description: 'Plugins to load', multiple: true}),
    spec: Flags.string({char: 's', description: 'OpenAPI/Swagger spec file or URL'}),
    'throughput-threshold': Flags.integer({description: 'Minimum allowed throughput (RPS)'}),
    url: Flags.string({char: 'u', description: 'Base URL for the API'}),
  }

  public async run(): Promise<void> {
    const {args, flags} = await this.parse(Benchmark)
    const runner = new BenchmarkRunner(args, flags, this.log)
    await runner.run()
  }
}
