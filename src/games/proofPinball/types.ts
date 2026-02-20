/** Types for Proof Pinball game */

export interface Vec2 {
  x: number
  y: number
}

export interface Wall {
  id: string
  start: Vec2
  end: Vec2
}

export interface Reflector {
  id: string
  center: Vec2
  /** Angle in degrees (0 = horizontal) */
  angle: number
  /** Half-length of the reflector segment */
  halfLength: number
}

export interface Target {
  id: string
  center: Vec2
  radius: number
  hit: boolean
}

export interface BounceInfo {
  position: Vec2
  /** Incidence angle in degrees (relative to normal) */
  incidenceAngle: number
  /** Reflection angle in degrees (relative to normal) */
  reflectionAngle: number
  /** Direction of the normal vector at the bounce point */
  normal: Vec2
  /** Incoming direction (unit vector) */
  incoming: Vec2
  /** Outgoing direction (unit vector) */
  outgoing: Vec2
}

export interface BallPath {
  /** Sequence of positions: start, bounce points, and end */
  points: Vec2[]
  /** Bounce angle info for each wall collision */
  bounces: BounceInfo[]
  /** Which targets were hit (by id), in order */
  targetsHit: string[]
}

export interface LevelConfig {
  id: number
  name: string
  subtitle: string
  /** Walls forming the room boundary */
  walls: Wall[]
  /** Target zones to hit */
  targets: Target[]
  /** Moveable reflectors (empty for early levels) */
  reflectors: Reflector[]
  /** Ball launch position */
  launchPoint: Vec2
  /** Maximum shots allowed for 1 star */
  maxShots: number
  /** Shots at or under for 3 stars */
  parShots: number
  /** Number of prediction bounces to show (0 = none) */
  predictionBounces: number
  /** Tutorial hint text (null if none) */
  hint: string | null
  /** Maximum bounces before ball fades */
  maxBounces: number
}

export type GamePhase = 'aiming' | 'animating' | 'complete' | 'failed' | 'levelSelect'

export interface GameState {
  /** Current level config */
  level: LevelConfig
  /** Current game phase */
  phase: GamePhase
  /** Aim angle in degrees (0 = right, CCW positive) */
  aimAngle: number
  /** Whether the player is currently dragging to aim */
  isAiming: boolean
  /** Ball path from the current/last shot */
  currentPath: BallPath | null
  /** Ball animation progress (0 = start, 1 = end of path) */
  animationProgress: number
  /** Number of shots taken this level */
  shotsTaken: number
  /** Targets status (mirrors level targets but tracks hit state) */
  targets: Target[]
  /** Reflectors (may differ from level defaults if user moved them) */
  reflectors: Reflector[]
  /** Stars earned this level (0-3) */
  stars: number
  /** All completed level stars by level id */
  levelStars: Record<number, number>
  /** Currently selected reflector id for dragging */
  selectedReflectorId: string | null
}

export type GameAction =
  | { type: 'START_AIM' }
  | { type: 'SET_AIM_ANGLE'; angle: number }
  | { type: 'FIRE_SHOT'; path: BallPath }
  | { type: 'UPDATE_ANIMATION'; progress: number }
  | { type: 'SHOT_COMPLETE' }
  | { type: 'RESET_LEVEL' }
  | { type: 'SELECT_LEVEL'; levelId: number }
  | { type: 'GO_TO_LEVEL_SELECT' }
  | { type: 'SELECT_REFLECTOR'; id: string | null }
  | { type: 'ROTATE_REFLECTOR'; id: string; angle: number }
  | { type: 'HIT_TARGET'; targetId: string }
