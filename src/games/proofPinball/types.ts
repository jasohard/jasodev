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

export interface GoalZone {
  center: Vec2
  radius: number
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
  /** Whether ball entered the goal zone (after min bounces met) */
  goalReached: boolean
  /** Index of the point where the goal was reached (for animation) */
  goalReachedAtPoint: number
  /** Energy at each point along the path (0-1 scale, index matches points) */
  energyAtPoints: number[]
}

export interface LevelConfig {
  id: number
  name: string
  subtitle: string
  /** Walls forming the room boundary */
  walls: Wall[]
  /** Goal zone to reach */
  goalZone: GoalZone
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
  /** Safety cap on bounces to prevent infinite loops */
  maxBounces: number
  /** Minimum bounces required before goal zone counts (0 = no requirement) */
  minBounces: number
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
  /** Launch power (0-1 range, maps to speed 200-600 px/s) */
  launchPower: number
  /** Ball path from the current/last shot */
  currentPath: BallPath | null
  /** Ball animation progress (0 = start, 1 = end of path) */
  animationProgress: number
  /** Current ball energy (0-1 scale, shown during animation) */
  currentEnergy: number
  /** Number of shots taken this level */
  shotsTaken: number
  /** Whether the goal has been reached this shot */
  goalReached: boolean
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
  | { type: 'SET_LAUNCH_POWER'; power: number }
  | { type: 'FIRE_SHOT'; path: BallPath }
  | { type: 'UPDATE_ANIMATION'; progress: number; energy: number }
  | { type: 'GOAL_REACHED' }
  | { type: 'SHOT_COMPLETE' }
  | { type: 'RESET_LEVEL' }
  | { type: 'SELECT_LEVEL'; levelId: number }
  | { type: 'GO_TO_LEVEL_SELECT' }
  | { type: 'SELECT_REFLECTOR'; id: string | null }
  | { type: 'ROTATE_REFLECTOR'; id: string; angle: number }
