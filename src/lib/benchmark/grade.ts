import {BenchmarkGradeThresholds, BenchmarkReport} from '../../types'

// Default grading thresholds
export const DEFAULT_GRADE_THRESHOLDS = {
  p90: {Acceptable: 500, Excellent: 100, Good: 300},
  p99: {Acceptable: 1000, Excellent: 200, Good: 500},
  rps: {Acceptable: 10, Excellent: 100, Good: 20},
}

export function getGrade(metric: 'p90' | 'p99' | 'rps', value: number, thresholds: BenchmarkGradeThresholds): string {
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

export function aggregateGrades(grades: {p90: string; p99: string; rps: string}): string {
  // Worst grade wins: Needs Improvement > Acceptable > Good > Excellent
  if (Object.values(grades).includes('Needs Improvement')) return 'Needs Improvement'
  if (Object.values(grades).includes('Acceptable')) return 'Acceptable'
  if (Object.values(grades).includes('Good')) return 'Good'
  return 'Excellent'
}

export function aggregateFinalGrades(endpoints: BenchmarkReport['endpoints']) {
  const allFinalGrades = new Set(Object.values(endpoints).map((e) => e.grades?.final))
  const finalGrade = aggregateGrades({
    p90: allFinalGrades.has('Needs Improvement')
      ? 'Needs Improvement'
      : allFinalGrades.has('Acceptable')
      ? 'Acceptable'
      : allFinalGrades.has('Good')
      ? 'Good'
      : 'Excellent',
    p99: allFinalGrades.has('Needs Improvement')
      ? 'Needs Improvement'
      : allFinalGrades.has('Acceptable')
      ? 'Acceptable'
      : allFinalGrades.has('Good')
      ? 'Good'
      : 'Excellent',
    rps: allFinalGrades.has('Needs Improvement')
      ? 'Needs Improvement'
      : allFinalGrades.has('Acceptable')
      ? 'Acceptable'
      : allFinalGrades.has('Good')
      ? 'Good'
      : 'Excellent',
  })

  return finalGrade
}
