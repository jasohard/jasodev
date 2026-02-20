/**
 * Slope Surfer — Game state management via useReducer.
 * All game logic flows through this reducer.
 */

import type { GameState, GameAction, LevelConfig, ControlPoint } from './types'
import { updateParticles, computeScore } from './engine'

/** Create initial state for a given level */
export function createInitialState(level: LevelConfig): GameState {
  return {
    phase: 'planning',
    levelId: level.id,
    levelStars: {},
    controlPoints: level.controlPoints.map(cp => ({ ...cp })),
    surferX: level.startPoint.x,
    surferSpeed: 0,
    gemsCollected: new Set<number>(),
    comboCount: 0,
    comboTimer: 0,
    lastGemTime: 0,
    score: 0,
    rideTime: 0,
    particles: [],
    showDerivGraph: false,
    showSpeedOverlay: false,
    cameraOffsetX: 0,
    shakeOffset: { x: 0, y: 0 },
    boardFlash: false,
  }
}

/** Reset state for retrying or selecting a new level */
function resetForLevel(state: GameState, level: LevelConfig): GameState {
  return {
    ...state,
    phase: 'planning',
    levelId: level.id,
    controlPoints: level.controlPoints.map(cp => ({ ...cp })),
    surferX: level.startPoint.x,
    surferSpeed: 0,
    gemsCollected: new Set<number>(),
    comboCount: 0,
    comboTimer: 0,
    lastGemTime: 0,
    score: 0,
    rideTime: 0,
    particles: [],
    cameraOffsetX: 0,
    shakeOffset: { x: 0, y: 0 },
    boardFlash: false,
  }
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'DRAG_CONTROL_POINT': {
      const points = state.controlPoints.map((cp: ControlPoint) =>
        cp.id === action.id && !cp.fixed
          ? { ...cp, y: Math.max(cp.minY, Math.min(cp.maxY, action.y)) }
          : cp
      )
      return { ...state, controlPoints: points }
    }

    case 'LAUNCH_SURFER':
      if (state.phase !== 'planning') return state
      return {
        ...state,
        phase: 'riding',
        rideTime: 0,
        gemsCollected: new Set<number>(),
        comboCount: 0,
        comboTimer: 0,
        lastGemTime: 0,
        score: 0,
        particles: [],
      }

    case 'TICK': {
      if (state.phase !== 'riding') return state
      const speed = action.derivative
        ? Math.abs(action.derivative(state.surferX))
        : 0
      return {
        ...state,
        surferX: state.surferX + (30 * Math.abs(speed) + 5) * action.dt,
        surferSpeed: 30 * Math.abs(speed) + 5,
        rideTime: state.rideTime + action.dt,
        // Decay combo timer
        comboTimer: Math.max(0, state.comboTimer - action.dt),
        comboCount: state.comboTimer - action.dt <= 0 ? 0 : state.comboCount,
      }
    }

    case 'COLLECT_GEM': {
      const collected = new Set(state.gemsCollected)
      collected.add(action.gemId)
      const newCombo = state.comboTimer > 0 ? state.comboCount + 1 : 1
      return {
        ...state,
        gemsCollected: collected,
        comboCount: newCombo,
        comboTimer: 1.0, // 1 second combo window
        lastGemTime: state.rideTime,
        score: state.score + Math.round(100 * action.comboMultiplier),
        boardFlash: true,
      }
    }

    case 'LAND_SUCCESS': {
      const comboBonus = action.rideCombo > 1 ? (action.rideCombo - 1) * 50 : 0
      const landingScore = computeScore(
        true,
        action.rideGems.size,
        comboBonus,
        action.rideTime,
        null,
        action.precision
      )
      return {
        ...state,
        phase: 'success',
        gemsCollected: action.rideGems,
        rideTime: action.rideTime,
        score: action.rideScore + landingScore,
        comboCount: action.rideCombo,
      }
    }

    case 'LAND_FAILED':
      return {
        ...state,
        phase: 'failed',
        gemsCollected: action.rideGems,
        rideTime: action.rideTime,
        score: action.rideScore,
      }

    case 'RETRY_LEVEL':
      return {
        ...state,
        phase: 'planning',
        surferX: 0, // Will be set by component
        surferSpeed: 0,
        gemsCollected: new Set<number>(),
        comboCount: 0,
        comboTimer: 0,
        lastGemTime: 0,
        score: 0,
        rideTime: 0,
        particles: [],
        cameraOffsetX: 0,
        shakeOffset: { x: 0, y: 0 },
        boardFlash: false,
      }

    case 'RESET_TERRAIN':
      return resetForLevel(state, action.level)

    case 'SELECT_LEVEL':
      return resetForLevel(state, action.level)

    case 'TOGGLE_DERIVATIVE':
      return { ...state, showDerivGraph: !state.showDerivGraph }

    case 'TOGGLE_SPEED_OVERLAY':
      return { ...state, showSpeedOverlay: !state.showSpeedOverlay }

    case 'UPDATE_PARTICLES':
      return { ...state, particles: updateParticles(state.particles, action.dt) }

    case 'SPAWN_PARTICLES':
      return {
        ...state,
        particles: [...state.particles, ...action.particles].slice(-40),
      }

    case 'SET_SHAKE':
      return { ...state, shakeOffset: action.offset }

    case 'CLEAR_BOARD_FLASH':
      return { ...state, boardFlash: false }

    case 'ENTER_LEVEL_SELECT':
      return { ...state, phase: 'levelSelect' }

    case 'EXIT_INTRO':
      return { ...state, phase: 'planning' }

    default:
      return state
  }
}
