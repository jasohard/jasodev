/** Types for the reworked Physics Plinko game */

export interface Vec2 {
  x: number
  y: number
}

/** A peg on the board */
export interface Peg {
  /** Unique identifier */
  id: string
  /** Position in board coordinates */
  x: number
  y: number
  /** Radius of the peg */
  radius: number
  /** Peg type */
  type: 'fixed' | 'moveable' | 'bumper'
  /** Starting position (for reset) */
  startX: number
  startY: number
}

/** A ball being simulated */
export interface Ball {
  id: number
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  /** Whether this ball is still active (hasn't landed in a bin) */
  active: boolean
  /** Which bin the ball landed in (-1 if still active) */
  binIndex: number
  /** Time alive in seconds (for timeout) */
  age: number
}

/** Level configuration */
export interface LevelConfig {
  id: number
  name: string
  subtitle: string
  /** Fixed pegs that can't be moved */
  fixedPegs: Array<{ x: number; y: number; radius?: number }>
  /** Moveable pegs the player can drag */
  moveablePegs: Array<{ x: number; y: number; radius?: number }>
  /** Bumper pegs (larger, bouncier) */
  bumperPegs?: Array<{ x: number; y: number; radius?: number }>
  /** Number of bins at the bottom */
  binCount: number
  /** Target distribution (normalized, sums to 1) */
  targetDistribution: number[]
  /** Minimum balls required for scoring */
  minBallsForScore: number
  /** Star thresholds (match %) */
  star1: number
  star2: number
  star3: number
  /** Hint text */
  hint: string
  /** Whether this is free play (no target) */
  freePlay?: boolean
  /** Drop x position (default: center) */
  dropX?: number
}

export type SpeedMultiplier = 1 | 3 | 10
export type DropCount = 10 | 50 | 100
