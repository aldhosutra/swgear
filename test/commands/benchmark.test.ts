import {runCommand} from '@oclif/test'
import {expect} from 'chai'

describe('benchmark', () => {
  it('runs benchmark cmd', async () => {
    const {stdout} = await runCommand('benchmark')
    expect(stdout).to.contain('hello world')
  })

  it('runs benchmark --name oclif', async () => {
    const {stdout} = await runCommand('benchmark --name oclif')
    expect(stdout).to.contain('hello oclif')
  })
})
