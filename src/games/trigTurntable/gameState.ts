/**
 * Game state reducer for Trig Turntable.
 */

import type { GameState, GameAction } from './types'
import { LEVELS } from './levels'
import { createDefaultCircle, CIRCLE_COLORS } from './engine'

export function initializeLevel(levelId: number, levelStars: Record<number, number>): GameState {
  const level = LEVELS.find((l) => l.id === levelId) ?? LEVELS[0]

  // For observation mode, set circles to the target values directly
  const circles = level.observationMode
    ? level.targetCircles.map((tc, i) => ({
        ...tc,
        id: `circle-${Date.now()}-${i}`,
        color: CIRCLE_COLORS[i % CIRCLE_COLORS.length],
      }))
    : Array.from({ length: level.initialCircleCount }, (_, i) => {
        const circle = createDefaultCircle(i)
        // For locked circles, pre-set them to the target values
        if (level.lockedCircleIndices?.includes(i) && level.targetCircles[i]) {
          return {
            ...circle,
            amplitude: level.targetCircles[i].amplitude,
            frequency: level.targetCircles[i].frequency,
            phase: level.targetCircles[i].phase,
          }
        }
        return circle
      })

  return {
    level,
    circles,
    selectedCircleIndex: 0,
    time: 0,
    isPlaying: true,
    speed: 1,
    matchScore: 0,
    stars: 0,
    levelStars,
    phase: level.observationMode ? 'observation' : 'playing',
    waveTrace: [],
    observationPhase: 'circle1',
    showSecondaryHint: false,
  }
}

/** Check if a circle index is locked for the current level */
export function isCircleLocked(level: GameState['level'], circleIndex: number): boolean {
  return level.lockedCircleIndices?.includes(circleIndex) ?? false
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'SET_AMPLITUDE': {
      if (isCircleLocked(state.level, action.circleIndex)) return state
      const circles = state.circles.map((c, i) =>
        i === action.circleIndex ? { ...c, amplitude: action.value } : c
      )
      return { ...state, circles }
    }

    case 'SET_FREQUENCY': {
      if (isCircleLocked(state.level, action.circleIndex)) return state
      const circles = state.circles.map((c, i) =>
        i === action.circleIndex ? { ...c, frequency: action.value } : c
      )
      return { ...state, circles }
    }

    case 'SET_PHASE': {
      if (isCircleLocked(state.level, action.circleIndex)) return state
      const circles = state.circles.map((c, i) =>
        i === action.circleIndex ? { ...c, phase: action.value } : c
      )
      return { ...state, circles }
    }

    case 'SELECT_CIRCLE': {
      // Don't allow selecting locked circles
      if (isCircleLocked(state.level, action.index)) return state
      return { ...state, selectedCircleIndex: action.index }
    }

    case 'ADD_CIRCLE': {
      if (state.circles.length >= state.level.maxCircles) return state
      const newIndex = state.circles.length
      const newCircle = {
        ...createDefaultCircle(newIndex),
        color: CIRCLE_COLORS[newIndex % CIRCLE_COLORS.length],
      }
      // Show secondary hint when adding a circle on guided levels
      const showSecondaryHint = !!state.level.secondaryHint
      return {
        ...state,
        circles: [...state.circles, newCircle],
        selectedCircleIndex: newIndex,
        showSecondaryHint,
      }
    }

    case 'REMOVE_CIRCLE': {
      if (state.circles.length <= 1) return state
      // Don't allow removing locked circles
      if (isCircleLocked(state.level, action.index)) return state
      const circles = state.circles.filter((_, i) => i !== action.index)
      const selectedCircleIndex = Math.min(state.selectedCircleIndex, circles.length - 1)
      return { ...state, circles, selectedCircleIndex }
    }

    case 'TOGGLE_PLAY':
      return { ...state, isPlaying: !state.isPlaying }

    case 'SET_SPEED':
      return { ...state, speed: action.speed }

    case 'UPDATE_TIME':
      return { ...state, time: action.time }

    case 'UPDATE_SCORE':
      return { ...state, matchScore: action.score }

    case 'SET_WAVE_TRACE':
      return { ...state, waveTrace: action.trace }

    case 'ADVANCE_OBSERVATION':
      return { ...state, observationPhase: action.phase }

    case 'COMPLETE_OBSERVATION': {
      // Auto-complete the observation level with 3 stars
      const newLevelStars = { ...state.levelStars }
      newLevelStars[state.level.id] = 3
      return {
        ...state,
        phase: 'complete',
        stars: 3,
        matchScore: 100,
        levelStars: newLevelStars,
      }
    }

    case 'DISMISS_SECONDARY_HINT':
      return { ...state, showSecondaryHint: false }

    case 'COMPLETE_LEVEL': {
      const newLevelStars = { ...state.levelStars }
      const existing = newLevelStars[state.level.id] ?? 0
      newLevelStars[state.level.id] = Math.max(existing, action.stars)
      return {
        ...state,
        phase: 'complete',
        stars: action.stars,
        levelStars: newLevelStars,
      }
    }

    case 'RESET_LEVEL':
      return initializeLevel(state.level.id, state.levelStars)

    case 'SELECT_LEVEL':
      return initializeLevel(action.levelId, state.levelStars)

    case 'GO_TO_LEVEL_SELECT':
      return { ...state, phase: 'levelSelect' }

    default:
      return state
  }
}
