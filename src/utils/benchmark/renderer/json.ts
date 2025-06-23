import {ComparisonResult, Report} from '../../../types'

export function renderJsonReport(input: ComparisonResult[] | Report, pretty: boolean = true): string {
  return JSON.stringify(input, null, pretty ? 2 : 0)
}
