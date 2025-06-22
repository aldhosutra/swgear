import {runCommand} from '@oclif/test'
import {expect} from 'chai'

describe('client', () => {
  it('runs client cmd', async () => {
    const {stdout} = await runCommand('client')
    expect(stdout).to.contain('hello world')
  })

  it('runs client --name oclif', async () => {
    const {stdout} = await runCommand('client --name oclif')
    expect(stdout).to.contain('hello oclif')
  })
})
