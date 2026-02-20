/** Types for Trig Turntable game */

export interface CircleParams {
  /** Unique id */
  id: string
  /** Amplitude (radius of the circle, 0–2) */
  amplitude: number
  /** Frequency multiplier (1 = base speed) */
  frequency: number
  /** Phase offset in radians */
  phase: number
  /** Color for this circle */
  color: string
}

export interface LevelConfig {
  id: number
  name: string
  subtitle: string
  /** Target wave defined as a list of CircleParams */
  targetCircles: CircleParams[]
  /** How many circles the player starts with */
  initialCircleCount: number
  /** Maximum circles allowed */
  maxCircles: number
  /** Which parameters are locked (not editable) */
  lockedParams: ('amplitude' | 'frequency' | 'phase')[]
  /** Star thresholds: [1-star, 2-star, 3-star] match percentages */
  starThresholds: [number, number, number]
  /** Hint text */
  hint: string | null
  /** Whether this is art mode (no target, no scoring) */
  artMode: boolean
}

export type GamePhase = 'playing' | 'complete' | 'levelSelect'

export interface GameState {
  /** Current level */
  level: LevelConfig
  /** Player's circles */
  circles: CircleParams[]
  /** Selected circle index */
  selectedCircleIndex: number
  /** Current animation time (radians, advances with rAF) */
  time: number
  /** Whether animation is playing */
  isPlaying: boolean
  /** Animation speed multiplier */
  speed: number
  /** Current match score (0-100) */
  matchScore: number
  /** Stars earned (0-3) */
  stars: number
  /** Best stars per level */
  levelStars: Record<number, number>
  /** Current game phase */
  phase: GamePhase
  /** Wave trace points for player's wave [x, y][] */
  waveTrace: [number, number][]
}

export type GameAction =
  | { type: 'SET_AMPLITUDE'; circleIndex: number; value: number }
  | { type: 'SET_FREQUENCY'; circleIndex: number; value: number }
  | { type: 'SET_PHASE'; circleIndex: number; value: number }
  | { type: 'SELECT_CIRCLE'; index: number }
  | { type: 'ADD_CIRCLE' }
  | { type: 'REMOVE_CIRCLE'; index: number }
  | { type: 'TOGGLE_PLAY' }
  | { type: 'SET_SPEED'; speed: number }
  | { type: 'UPDATE_TIME'; time: number }
  | { type: 'UPDATE_SCORE'; score: number }
  | { type: 'RESET_LEVEL' }
  | { type: 'SELECT_LEVEL'; levelId: number }
  | { type: 'GO_TO_LEVEL_SELECT' }
  | { type: 'COMPLETE_LEVEL'; stars: number }
  | { type: 'SET_WAVE_TRACE'; trace: [number, number][] }
