/**
 * Level solvability solver for Proof Pinball.
 *
 * Scans angles 0-360° in 0.5° increments and power levels from 0.3 to 1.0
 * in 0.1 increments. For each (angle, power) pair, simulates the ball path
 * and checks if ball enters goalZone after minBounces.
 */

import type { LevelConfig } from './types'
import { computeBallPath } from './physics'

interface SolveResult {
  levelId: number
  levelName: string
  solvable: boolean
  solutions: Array<{ angle: number; power: number; bounces: number }>
}

export function solveLevel(level: LevelConfig): SolveResult {
  const solutions: Array<{ angle: number; power: number; bounces: number }> = []

  for (let power = 0.3; power <= 1.0; power += 0.1) {
    for (let angle = 0; angle < 360; angle += 0.5) {
      const path = computeBallPath(
        level.launchPoint,
        angle,
        level.walls,
        level.reflectors,
        level.goalZone,
        level.maxBounces,
        level.minBounces,
        power
      )

      if (path.goalReached) {
        solutions.push({
          angle: Math.round(angle * 10) / 10,
          power: Math.round(power * 10) / 10,
          bounces: path.bounces.length,
        })
      }
    }
  }

  return {
    levelId: level.id,
    levelName: level.name,
    solvable: solutions.length > 0,
    solutions: solutions.slice(0, 10), // First 10 solutions
  }
}

export function solveAllLevels(levels: LevelConfig[]): SolveResult[] {
  return levels.map(solveLevel)
}
