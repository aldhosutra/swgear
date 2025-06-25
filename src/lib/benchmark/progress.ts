// Progress bar utility for swgr benchmark
import * as cliProgress from 'cli-progress'

export class BenchmarkProgressBar {
  private static bar: cliProgress.SingleBar | null = null
  private static barValue = 0
  private static spinnerInterval: NodeJS.Timeout | null = null

  static create(total: number) {
    BenchmarkProgressBar.bar = new cliProgress.SingleBar({
      barCompleteChar: '\u2588',
      barIncompleteChar: '\u2591',
      clearOnComplete: true,
      format:
        '{spinner} Benchmark |{bar}| {percentage}% | {value}/{total} | ETA: {eta_formatted} | {method} {endpoint}',
      hideCursor: true,
    })

    BenchmarkProgressBar.bar.start(total, 0, {endpoint: '', method: '', spinner: '⠋'})

    let spinnerIndex = 0
    const spinnerChars = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏']
    BenchmarkProgressBar.spinnerInterval = setInterval(() => {
      spinnerIndex = (spinnerIndex + 1) % spinnerChars.length
      BenchmarkProgressBar.bar?.update(undefined as unknown as number, {spinner: spinnerChars[spinnerIndex]})
    }, 80)

    return BenchmarkProgressBar.bar
  }

  static increment() {
    BenchmarkProgressBar.barValue++
  }

  static stop() {
    if (BenchmarkProgressBar.spinnerInterval) clearInterval(BenchmarkProgressBar.spinnerInterval)
    BenchmarkProgressBar.bar?.update(BenchmarkProgressBar.barValue, {endpoint: '', method: 'Done', spinner: '✔'})
    BenchmarkProgressBar.bar?.stop()

    BenchmarkProgressBar.barValue = 0
    BenchmarkProgressBar.spinnerInterval = null
    BenchmarkProgressBar.bar = null
  }

  static update(endpoint: string, method: string) {
    BenchmarkProgressBar.bar?.update(BenchmarkProgressBar.barValue, {endpoint, method})
  }
}
