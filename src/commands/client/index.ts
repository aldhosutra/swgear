import {Args, Command, Flags} from '@oclif/core'

export default class Client extends Command {
  static override args = {
    file: Args.string({description: 'file to read'}),
  }
  static override description = 'Generate a TypeScript client from your OpenAPI/Swagger spec. (COMING SOON)'
  static override examples = ['<%= config.bin %> <%= command.id %>']
  static override flags = {
    // flag with no value (-f, --force)
    force: Flags.boolean({char: 'f'}),
    // flag with a value (-n, --name=VALUE)
    name: Flags.string({char: 'n', description: 'name to print'}),
  }

  public async run(): Promise<void> {
    const {args, flags} = await this.parse(Client)

    const name = flags.name ?? 'world'
    this.log(`hello ${name} from /Users/aldhosutra/Documents/Personal/project/swgear/src/commands/client.ts`)
    if (args.file && flags.force) {
      this.log(`you input --force and --file: ${args.file}`)
    }
  }
}
