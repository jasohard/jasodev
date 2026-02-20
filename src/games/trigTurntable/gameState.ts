/**
 * Game state reducer for Trig Turntable.
 */

import type { GameState, GameAction } from './types'
import { LEVELS } from './levels'
import { createDefaultCircle, CIRCLE_COLORS } from './engine'

export function initializeLevel(levelId: number, levelStars: Record<number, number>): GameState {
  const level = LEVELS.find((l) => l.id === levelId) ?? LEVELS[0]

  const circles = Array.from({ length: level.initialCircleCount }, (_, i) =>
    createDefaultCircle(i)
  )

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
    phase: 'playing',
    waveTrace: [],
  }
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'SET_AMPLITUDE': {
      const circles = state.circles.map((c, i) =>
        i === action.circleIndex ? { ...c, amplitude: action.value } : c
      )
      return { ...state, circles }
    }

    case 'SET_FREQUENCY': {
      const circles = state.circles.map((c, i) =>
        i === action.circleIndex ? { ...c, frequency: action.value } : c
      )
      return { ...state, circles }
    }

    case 'SET_PHASE': {
      const circles = state.circles.map((c, i) =>
        i === action.circleIndex ? { ...c, phase: action.value } : c
      )
      return { ...state, circles }
    }

    case 'SELECT_CIRCLE':
      return { ...state, selectedCircleIndex: action.index }

    case 'ADD_CIRCLE': {
      if (state.circles.length >= state.level.maxCircles) return state
      const newIndex = state.circles.length
      const newCircle = {
        ...createDefaultCircle(newIndex),
        color: CIRCLE_COLORS[newIndex % CIRCLE_COLORS.length],
      }
      return {
        ...state,
        circles: [...state.circles, newCircle],
        selectedCircleIndex: newIndex,
      }
    }

    case 'REMOVE_CIRCLE': {
      if (state.circles.length <= 1) return state
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
