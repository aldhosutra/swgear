![Header](https://raw.githubusercontent.com/aldhosutra/swgear/HEAD/website/static/img/docusaurus-social-card.jpg)

# swgear

A CLI suite to supercharge your Swagger/OpenAPI workflow

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/swgear.svg)](https://npmjs.org/package/swgear)
[![Downloads/week](https://img.shields.io/npm/dw/swgear.svg)](https://npmjs.org/package/swgear)

<!-- toc -->
* [swgear](#swgear)
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->

# Usage

<!-- usage -->
```sh-session
$ npm install -g swgear
$ swgear COMMAND
running command...
$ swgear (--version)
swgear/0.0.2 darwin-arm64 node-v18.20.3
$ swgear --help [COMMAND]
USAGE
  $ swgear COMMAND
...
```
<!-- usagestop -->

# Commands

<!-- commands -->
* [`swgear benchmark [SPEC]`](#swgear-benchmark-spec)
* [`swgear client [FILE]`](#swgear-client-file)
* [`swgear help [COMMAND]`](#swgear-help-command)

## `swgear benchmark [SPEC]`

Run HTTP benchmarks against an OpenAPI/Swagger spec or API, with optional thresholds for CI/CD.

```
USAGE
  $ swgear benchmark [SPEC] [--compare-label <value>] [-w <value>] [-c <value>] [-d <value>] [--grade-range
    <value>] [--grade-threshold Excellent|Good|Acceptable|Needs Improvement] [--label <value>] [--latency-threshold
    <value>] [-o <value>] [--p50-range <value>] [--p90-range <value>] [--p99-range <value>] [--param <value>...] [-p
    <value>...] [--rps-range <value>] [--sort-by p50|p90|p99|rps] [-s <value>] [--throughput-threshold <value>] [-u
    <value>]

ARGUMENTS
  SPEC  OpenAPI/Swagger spec file or URL (positional)

FLAGS
  -c, --connections=<value>           [default: 10] Number of concurrent connections
  -d, --duration=<value>              [default: 10] Duration of the benchmark in seconds
  -o, --output=<value>                Output file
  -p, --plugins=<value>...            [default: ] Plugins to load
  -s, --spec=<value>                  OpenAPI/Swagger spec file or URL
  -u, --url=<value>                   Base URL for the API
  -w, --compare-with=<value>          Comparison URL or report
      --compare-label=<value>         [default: Benchmark Baseline] Label for the comparison run
      --grade-range=<value>           Custom grading ranges for p50, p90, p99, and rps as comma-separated values.
                                      Example: "p50=50,150,300;p90=100,300,500;p99=200,500,1000;rps=100,20,10". Each
                                      value is Excellent,Good,Acceptable.
      --grade-threshold=<option>      Minimum allowed final grade for the benchmark (Excellent, Good, Acceptable, Needs
                                      Improvement). Fails if the overall grade is worse.
                                      <options: Excellent|Good|Acceptable|Needs Improvement>
      --label=<value>                 [default: Benchmark Report] Label for this benchmark run
      --latency-threshold=<value>     Maximum allowed latency (ms) for p90/p95
      --p50-range=<value>             Custom grading range for p50 as comma-separated values: Excellent,Good,Acceptable.
                                      Example: "50,150,300"
      --p90-range=<value>             Custom grading range for p90 as comma-separated values: Excellent,Good,Acceptable.
                                      Example: "100,300,500"
      --p99-range=<value>             Custom grading range for p99 as comma-separated values: Excellent,Good,Acceptable.
                                      Example: "200,500,1000"
      --param=<value>...              [default: ] Set default value for path parameters, e.g. --param petId=123. Can be
                                      used multiple times.
      --rps-range=<value>             Custom grading range for rps as comma-separated values: Excellent,Good,Acceptable.
                                      Example: "100,20,10"
      --sort-by=<option>              [default: p50] Sort comparison output by this metric (p50, p90, p99, rps)
                                      <options: p50|p90|p99|rps>
      --throughput-threshold=<value>  Minimum allowed throughput (RPS)

DESCRIPTION
  Run HTTP benchmarks against an OpenAPI/Swagger spec or API, with optional thresholds for CI/CD.

EXAMPLES
  $ swgear benchmark https://api.example.com/api.yaml

  $ swgear benchmark api.yaml --url https://api.example.com

  $ swgear benchmark --spec api.yaml --url https://api.example.com

  $ swgear benchmark api.yaml --url https://api.example.com --latency-threshold 200 --throughput-threshold 1000

  $ swgear benchmark api.yaml --url https://api.example.com --compare-with https://api.staging.com

  $ swgear benchmark api.yaml --url https://api.example.com --output result.json
```

_See code: [src/commands/benchmark/index.ts](https://github.com/aldhosutra/swgear/blob/v0.0.2/src/commands/benchmark/index.ts)_

## `swgear client [FILE]`

Generate a TypeScript client from your OpenAPI/Swagger spec. (COMING SOON)

```
USAGE
  $ swgear client [FILE] [-f] [-n <value>]

ARGUMENTS
  FILE  file to read

FLAGS
  -f, --force
  -n, --name=<value>  name to print

DESCRIPTION
  Generate a TypeScript client from your OpenAPI/Swagger spec. (COMING SOON)

EXAMPLES
  $ swgear client
```

_See code: [src/commands/client/index.ts](https://github.com/aldhosutra/swgear/blob/v0.0.2/src/commands/client/index.ts)_

## `swgear help [COMMAND]`

Display help for swgear.

```
USAGE
  $ swgear help [COMMAND...] [-n]

ARGUMENTS
  COMMAND...  Command to show help for.

FLAGS
  -n, --nested-commands  Include all nested commands in the output.

DESCRIPTION
  Display help for swgear.
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v6.2.29/src/commands/help.ts)_
<!-- commandsstop -->
