swgr
=================

A CLI suite to supercharge your Swagger/OpenAPI workflow


[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/swgr.svg)](https://npmjs.org/package/swgr)
[![Downloads/week](https://img.shields.io/npm/dw/swgr.svg)](https://npmjs.org/package/swgr)


<!-- toc -->
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
* [`swgr benchmark [FILE]`](#swgr-benchmark-file)
* [`swgr client [FILE]`](#swgr-client-file)
* [`swgr help [COMMAND]`](#swgr-help-command)

## `swgr benchmark [FILE]`

describe the command here

```
USAGE
  $ swgr benchmark [FILE] [-f] [-n <value>]

ARGUMENTS
  FILE  file to read

FLAGS
  -f, --force
  -n, --name=<value>  name to print

DESCRIPTION
  describe the command here

EXAMPLES
  $ swgr benchmark
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
