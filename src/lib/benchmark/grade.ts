import {BenchmarkGradeThresholds, BenchmarkMetric, BenchmarkReport} from '../../types'

// Default grading thresholds
export const DEFAULT_GRADE_THRESHOLDS = {
  p50: {Acceptable: 300, Excellent: 50, Good: 150},
  p90: {Acceptable: 500, Excellent: 100, Good: 300},
  p99: {Acceptable: 1000, Excellent: 200, Good: 500},
  rps: {Acceptable: 10, Excellent: 100, Good: 20},
}

export function getGrade(metric: BenchmarkMetric, value: number, thresholds: BenchmarkGradeThresholds): string {
  if (metric === 'rps') {
    if (value > thresholds.Excellent) return 'Excellent'
    if (value > thresholds.Good) return 'Good'
    if (value > thresholds.Acceptable) return 'Acceptable'
    return 'Needs Improvement'
  }

  if (value < thresholds.Excellent) return 'Excellent'
  if (value < thresholds.Good) return 'Good'
  if (value < thresholds.Acceptable) return 'Acceptable'
  return 'Needs Improvement'
}

export function aggregateGrades(grades: {p50?: string; p90: string; p99: string; rps: string}): string {
  // Worst grade wins: Needs Improvement > Acceptable > Good > Excellent
  if (Object.values(grades).includes('Needs Improvement')) return 'Needs Improvement'
  if (Object.values(grades).includes('Acceptable')) return 'Acceptable'
  if (Object.values(grades).includes('Good')) return 'Good'
  return 'Excellent'
}

export function aggregateFinalGrades(endpoints: BenchmarkReport['endpoints']) {
  const allP50Grades = new Set(Object.values(endpoints).map((e) => e.grades.p50))
  const allP90Grades = new Set(Object.values(endpoints).map((e) => e.grades.p90))
  const allP99Grades = new Set(Object.values(endpoints).map((e) => e.grades.p99))
  const allrpsGrades = new Set(Object.values(endpoints).map((e) => e.grades.rps))

  const finalGrade = aggregateGrades({
    p50: allP50Grades.has('Needs Improvement')
      ? 'Needs Improvement'
      : allP50Grades.has('Acceptable')
      ? 'Acceptable'
      : allP50Grades.has('Good')
      ? 'Good'
      : 'Excellent',
    p90: allP90Grades.has('Needs Improvement')
      ? 'Needs Improvement'
      : allP90Grades.has('Acceptable')
      ? 'Acceptable'
      : allP90Grades.has('Good')
      ? 'Good'
      : 'Excellent',
    p99: allP99Grades.has('Needs Improvement')
      ? 'Needs Improvement'
      : allP99Grades.has('Acceptable')
      ? 'Acceptable'
      : allP99Grades.has('Good')
      ? 'Good'
      : 'Excellent',
    rps: allrpsGrades.has('Needs Improvement')
      ? 'Needs Improvement'
      : allrpsGrades.has('Acceptable')
      ? 'Acceptable'
      : allrpsGrades.has('Good')
      ? 'Good'
      : 'Excellent',
  })

  return finalGrade
}

export function parseRangeFlag(val?: string): BenchmarkGradeThresholds | undefined {
  if (!val) return undefined
  const parts = val.split(',').map(Number)
  if (parts.length !== 3 || parts.some((element) => Number.isNaN(element))) return undefined
  return {Acceptable: parts[2], Excellent: parts[0], Good: parts[1]}
}

export function parseGradeRangeFlag(val?: string): Partial<Record<BenchmarkMetric, BenchmarkGradeThresholds>> {
  if (!val) return {}
  const result: Partial<Record<BenchmarkMetric, BenchmarkGradeThresholds>> = {}
  for (const entry of val.split(';')) {
    const [metric, values] = entry.split('=')
    if (!metric || !values) continue
    const parts = values.split(',').map(Number)
    if (parts.length !== 3 || parts.some((element) => Number.isNaN(element))) continue
    result[metric.trim() as BenchmarkMetric] = {
      Acceptable: parts[2],
      Excellent: parts[0],
      Good: parts[1],
    }
  }

  return result
}
