# swgr

A CLI suite to supercharge your Swagger/OpenAPI workflow

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/swgr.svg)](https://npmjs.org/package/swgr)
[![Downloads/week](https://img.shields.io/npm/dw/swgr.svg)](https://npmjs.org/package/swgr)

<!-- toc -->
* [swgr](#swgr)
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->

# Usage

<!-- usage -->
```sh-session
$ npm install -g swgr
$ swgr COMMAND
running command...
$ swgr (--version)
swgr/0.0.0 darwin-arm64 node-v18.20.3
$ swgr --help [COMMAND]
USAGE
  $ swgr COMMAND
...
```
<!-- usagestop -->

# Commands

<!-- commands -->
* [`swgr benchmark [SPEC]`](#swgr-benchmark-spec)
* [`swgr client [FILE]`](#swgr-client-file)
* [`swgr help [COMMAND]`](#swgr-help-command)

## `swgr benchmark [SPEC]`

Run HTTP benchmarks against an OpenAPI/Swagger spec or API, with optional thresholds for CI/CD.

```
USAGE
  $ swgr benchmark [SPEC] [--compare-label <value>] [-w <value>] [-c <value>] [-d <value>] [--label <value>]
    [--latency-threshold <value>] [-o <value>] [-p <value>...] [-s <value>] [--throughput-threshold <value>] [-u
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
      --compare-label=<value>         [default: Comparison Report] Label for the comparison run
      --label=<value>                 [default: Baseline Report] Label for this benchmark run
      --latency-threshold=<value>     Maximum allowed latency (ms) for p90/p95
      --throughput-threshold=<value>  Minimum allowed throughput (RPS)

DESCRIPTION
  Run HTTP benchmarks against an OpenAPI/Swagger spec or API, with optional thresholds for CI/CD.

EXAMPLES
  $ swgr benchmark https://api.example.com/api.yaml

  $ swgr benchmark api.yaml --url https://api.example.com

  $ swgr benchmark --spec api.yaml --url https://api.example.com

  $ swgr benchmark api.yaml --url https://api.example.com --latency-threshold 200 --throughput-threshold 1000

  $ swgr benchmark api.yaml --url https://api.example.com --compare-with https://api.staging.com

  $ swgr benchmark api.yaml --url https://api.example.com --output result.json
```

_See code: [src/commands/benchmark/index.ts](https://github.com/aldhosutra/swgr/blob/v0.0.0/src/commands/benchmark/index.ts)_

## `swgr client [FILE]`

describe the command here

```
USAGE
  $ swgr client [FILE] [-f] [-n <value>]

ARGUMENTS
  FILE  file to read

FLAGS
  -f, --force
  -n, --name=<value>  name to print

DESCRIPTION
  describe the command here

EXAMPLES
  $ swgr client
```

_See code: [src/commands/client/index.ts](https://github.com/aldhosutra/swgr/blob/v0.0.0/src/commands/client/index.ts)_

## `swgr help [COMMAND]`

Display help for swgr.

```
USAGE
  $ swgr help [COMMAND...] [-n]

ARGUMENTS
  COMMAND...  Command to show help for.

FLAGS
  -n, --nested-commands  Include all nested commands in the output.

DESCRIPTION
  Display help for swgr.
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v6.2.29/src/commands/help.ts)_
<!-- commandsstop -->
