/**
 * Game state reducer for Proof Pinball.
 */

import type { GameState, GameAction, Target } from './types'
import { LEVELS } from './levels'

function resetTargets(targets: Target[]): Target[] {
  return targets.map((t) => ({ ...t, hit: false }))
}

function calculateStars(shotsTaken: number, parShots: number, maxShots: number): number {
  if (shotsTaken <= parShots) return 3
  if (shotsTaken <= Math.ceil((parShots + maxShots) / 2)) return 2
  return 1
}

export function initializeLevel(levelId: number, levelStars: Record<number, number>): GameState {
  const level = LEVELS.find((l) => l.id === levelId) ?? LEVELS[0]
  return {
    level,
    phase: 'aiming',
    aimAngle: 45,
    isAiming: false,
    currentPath: null,
    animationProgress: 0,
    shotsTaken: 0,
    targets: resetTargets(level.targets),
    reflectors: level.reflectors.map((r) => ({ ...r })),
    stars: 0,
    levelStars,
    selectedReflectorId: null,
  }
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'START_AIM':
      if (state.phase !== 'aiming') return state
      return { ...state, isAiming: true }

    case 'SET_AIM_ANGLE':
      return { ...state, aimAngle: action.angle }

    case 'FIRE_SHOT':
      if (state.phase !== 'aiming') return state
      return {
        ...state,
        phase: 'animating',
        isAiming: false,
        currentPath: action.path,
        animationProgress: 0,
        shotsTaken: state.shotsTaken + 1,
      }

    case 'UPDATE_ANIMATION':
      return { ...state, animationProgress: action.progress }

    case 'HIT_TARGET': {
      const newTargets = state.targets.map((t) =>
        t.id === action.targetId ? { ...t, hit: true } : t
      )
      return { ...state, targets: newTargets }
    }

    case 'SHOT_COMPLETE': {
      const allHit = state.targets.every((t) => t.hit)
      if (allHit) {
        const stars = calculateStars(state.shotsTaken, state.level.parShots, state.level.maxShots)
        const newLevelStars = { ...state.levelStars }
        const existing = newLevelStars[state.level.id] ?? 0
        newLevelStars[state.level.id] = Math.max(existing, stars)
        return {
          ...state,
          phase: 'complete',
          stars,
          levelStars: newLevelStars,
        }
      }
      // If not all targets hit, go back to aiming
      if (state.shotsTaken >= state.level.maxShots) {
        // Out of shots - level failed, reset
        return {
          ...state,
          phase: 'aiming',
          currentPath: null,
          targets: resetTargets(state.level.targets),
          shotsTaken: 0,
        }
      }
      return {
        ...state,
        phase: 'aiming',
        currentPath: null,
      }
    }

    case 'RESET_LEVEL':
      return initializeLevel(state.level.id, state.levelStars)

    case 'SELECT_LEVEL':
      return initializeLevel(action.levelId, state.levelStars)

    case 'GO_TO_LEVEL_SELECT':
      return { ...state, phase: 'levelSelect' }

    case 'SELECT_REFLECTOR':
      return { ...state, selectedReflectorId: action.id }

    case 'ROTATE_REFLECTOR':
      return {
        ...state,
        reflectors: state.reflectors.map((r) =>
          r.id === action.id ? { ...r, angle: action.angle } : r
        ),
      }

    default:
      return state
  }
}
