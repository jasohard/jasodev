/** Core types for Slope Surfer */

export interface Vec2 {
  x: number
  y: number
}

export interface ControlPoint {
  id: number
  x: number
  y: number
  minY: number
  maxY: number
  /** Whether this point is fixed (not draggable) */
  fixed?: boolean
}

export interface Gem {
  id: number
  x: number
  y: number
  collected: boolean
}

export interface Particle {
  id: number
  x: number
  y: number
  vx: number
  vy: number
  life: number
  maxLife: number
  size: number
  color: string
  gravity?: boolean
}

export interface TargetZone {
  xStart: number
  xEnd: number
  yCenter: number
  /** Vertical tolerance for landing */
  tolerance: number
}

export interface LevelConfig {
  id: number
  name: string
  subtitle: string
  hint: string
  /** Default control points (player can drag these) */
  controlPoints: ControlPoint[]
  /** Fixed curve endpoints that cannot be moved */
  startPoint: Vec2
  endPoint: Vec2
  gems: Gem[]
  target: TargetZone
  /** Par time in seconds for 3-star rating */
  parTime: number | null
  /** Speed multiplier for this level */
  speedMultiplier: number
  /** Whether to show derivative graph toggle */
  showDerivToggle: boolean
  /** Whether this is a tutorial/auto-pass level */
  autoPass?: boolean
  /** Creative/freestyle mode */
  freestyle?: boolean
}

export type GamePhase =
  | 'intro'
  | 'planning'
  | 'riding'
  | 'success'
  | 'failed'
  | 'levelSelect'

export interface GameState {
  phase: GamePhase
  levelId: number
  levelStars: Record<number, number>
  controlPoints: ControlPoint[]
  surferX: number
  surferSpeed: number
  gemsCollected: Set<number>
  comboCount: number
  comboTimer: number
  lastGemTime: number
  score: number
  rideTime: number
  particles: Particle[]
  showDerivGraph: boolean
  showSpeedOverlay: boolean
  cameraOffsetX: number
  shakeOffset: Vec2
  boardFlash: boolean
}

export type GameAction =
  | { type: 'DRAG_CONTROL_POINT'; id: number; y: number }
  | { type: 'LAUNCH_SURFER' }
  | { type: 'TICK'; dt: number; curveY: (x: number) => number; derivative: (x: number) => number }
  | { type: 'COLLECT_GEM'; gemId: number; comboMultiplier: number }
  | { type: 'LAND_SUCCESS'; precision: number }
  | { type: 'LAND_FAILED' }
  | { type: 'RETRY_LEVEL' }
  | { type: 'RESET_TERRAIN'; level: LevelConfig }
  | { type: 'SELECT_LEVEL'; level: LevelConfig }
  | { type: 'TOGGLE_DERIVATIVE' }
  | { type: 'TOGGLE_SPEED_OVERLAY' }
  | { type: 'UPDATE_PARTICLES'; dt: number }
  | { type: 'SPAWN_PARTICLES'; particles: Particle[] }
  | { type: 'SET_SHAKE'; offset: Vec2 }
  | { type: 'CLEAR_BOARD_FLASH' }
  | { type: 'ENTER_LEVEL_SELECT' }
  | { type: 'EXIT_INTRO' }
