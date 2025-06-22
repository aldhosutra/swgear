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
* [`swgr hello PERSON`](#swgr-hello-person)
* [`swgr hello world`](#swgr-hello-world)
* [`swgr help [COMMAND]`](#swgr-help-command)
* [`swgr plugins`](#swgr-plugins)
* [`swgr plugins add PLUGIN`](#swgr-plugins-add-plugin)
* [`swgr plugins:inspect PLUGIN...`](#swgr-pluginsinspect-plugin)
* [`swgr plugins install PLUGIN`](#swgr-plugins-install-plugin)
* [`swgr plugins link PATH`](#swgr-plugins-link-path)
* [`swgr plugins remove [PLUGIN]`](#swgr-plugins-remove-plugin)
* [`swgr plugins reset`](#swgr-plugins-reset)
* [`swgr plugins uninstall [PLUGIN]`](#swgr-plugins-uninstall-plugin)
* [`swgr plugins unlink [PLUGIN]`](#swgr-plugins-unlink-plugin)
* [`swgr plugins update`](#swgr-plugins-update)

## `swgr hello PERSON`

Say hello

```
USAGE
  $ swgr hello PERSON -f <value>

ARGUMENTS
  PERSON  Person to say hello to

FLAGS
  -f, --from=<value>  (required) Who is saying hello

DESCRIPTION
  Say hello

EXAMPLES
  $ swgr hello friend --from oclif
  hello friend from oclif! (./src/commands/hello/index.ts)
```

_See code: [src/commands/hello/index.ts](https://github.com/aldhosutra/swgr/blob/v0.0.0/src/commands/hello/index.ts)_

## `swgr hello world`

Say hello world

```
USAGE
  $ swgr hello world

DESCRIPTION
  Say hello world

EXAMPLES
  $ swgr hello world
  hello world! (./src/commands/hello/world.ts)
```

_See code: [src/commands/hello/world.ts](https://github.com/aldhosutra/swgr/blob/v0.0.0/src/commands/hello/world.ts)_

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

## `swgr plugins`

List installed plugins.

```
USAGE
  $ swgr plugins [--json] [--core]

FLAGS
  --core  Show core plugins.

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  List installed plugins.

EXAMPLES
  $ swgr plugins
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.4.42/src/commands/plugins/index.ts)_

## `swgr plugins add PLUGIN`

Installs a plugin into swgr.

```
USAGE
  $ swgr plugins add PLUGIN... [--json] [-f] [-h] [-s | -v]

ARGUMENTS
  PLUGIN...  Plugin to install.

FLAGS
  -f, --force    Force npm to fetch remote resources even if a local copy exists on disk.
  -h, --help     Show CLI help.
  -s, --silent   Silences npm output.
  -v, --verbose  Show verbose npm output.

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  Installs a plugin into swgr.

  Uses npm to install plugins.

  Installation of a user-installed plugin will override a core plugin.

  Use the SWGR_NPM_LOG_LEVEL environment variable to set the npm loglevel.
  Use the SWGR_NPM_REGISTRY environment variable to set the npm registry.

ALIASES
  $ swgr plugins add

EXAMPLES
  Install a plugin from npm registry.

    $ swgr plugins add myplugin

  Install a plugin from a github url.

    $ swgr plugins add https://github.com/someuser/someplugin

  Install a plugin from a github slug.

    $ swgr plugins add someuser/someplugin
```

## `swgr plugins:inspect PLUGIN...`

Displays installation properties of a plugin.

```
USAGE
  $ swgr plugins inspect PLUGIN...

ARGUMENTS
  PLUGIN...  [default: .] Plugin to inspect.

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  Displays installation properties of a plugin.

EXAMPLES
  $ swgr plugins inspect myplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.4.42/src/commands/plugins/inspect.ts)_

## `swgr plugins install PLUGIN`

Installs a plugin into swgr.

```
USAGE
  $ swgr plugins install PLUGIN... [--json] [-f] [-h] [-s | -v]

ARGUMENTS
  PLUGIN...  Plugin to install.

FLAGS
  -f, --force    Force npm to fetch remote resources even if a local copy exists on disk.
  -h, --help     Show CLI help.
  -s, --silent   Silences npm output.
  -v, --verbose  Show verbose npm output.

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  Installs a plugin into swgr.

  Uses npm to install plugins.

  Installation of a user-installed plugin will override a core plugin.

  Use the SWGR_NPM_LOG_LEVEL environment variable to set the npm loglevel.
  Use the SWGR_NPM_REGISTRY environment variable to set the npm registry.

ALIASES
  $ swgr plugins add

EXAMPLES
  Install a plugin from npm registry.

    $ swgr plugins install myplugin

  Install a plugin from a github url.

    $ swgr plugins install https://github.com/someuser/someplugin

  Install a plugin from a github slug.

    $ swgr plugins install someuser/someplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.4.42/src/commands/plugins/install.ts)_

## `swgr plugins link PATH`

Links a plugin into the CLI for development.

```
USAGE
  $ swgr plugins link PATH [-h] [--install] [-v]

ARGUMENTS
  PATH  [default: .] path to plugin

FLAGS
  -h, --help          Show CLI help.
  -v, --verbose
      --[no-]install  Install dependencies after linking the plugin.

DESCRIPTION
  Links a plugin into the CLI for development.

  Installation of a linked plugin will override a user-installed or core plugin.

  e.g. If you have a user-installed or core plugin that has a 'hello' command, installing a linked plugin with a 'hello'
  command will override the user-installed or core plugin implementation. This is useful for development work.


EXAMPLES
  $ swgr plugins link myplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.4.42/src/commands/plugins/link.ts)_

## `swgr plugins remove [PLUGIN]`

Removes a plugin from the CLI.

```
USAGE
  $ swgr plugins remove [PLUGIN...] [-h] [-v]

ARGUMENTS
  PLUGIN...  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ swgr plugins unlink
  $ swgr plugins remove

EXAMPLES
  $ swgr plugins remove myplugin
```

## `swgr plugins reset`

Remove all user-installed and linked plugins.

```
USAGE
  $ swgr plugins reset [--hard] [--reinstall]

FLAGS
  --hard       Delete node_modules and package manager related files in addition to uninstalling plugins.
  --reinstall  Reinstall all plugins after uninstalling.
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.4.42/src/commands/plugins/reset.ts)_

## `swgr plugins uninstall [PLUGIN]`

Removes a plugin from the CLI.

```
USAGE
  $ swgr plugins uninstall [PLUGIN...] [-h] [-v]

ARGUMENTS
  PLUGIN...  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ swgr plugins unlink
  $ swgr plugins remove

EXAMPLES
  $ swgr plugins uninstall myplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.4.42/src/commands/plugins/uninstall.ts)_

## `swgr plugins unlink [PLUGIN]`

Removes a plugin from the CLI.

```
USAGE
  $ swgr plugins unlink [PLUGIN...] [-h] [-v]

ARGUMENTS
  PLUGIN...  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ swgr plugins unlink
  $ swgr plugins remove

EXAMPLES
  $ swgr plugins unlink myplugin
```

## `swgr plugins update`

Update installed plugins.

```
USAGE
  $ swgr plugins update [-h] [-v]

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Update installed plugins.
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.4.42/src/commands/plugins/update.ts)_
<!-- commandsstop -->
