/** Types for Vector Voyager game — gravity wells edition */

export interface Vec2 {
  x: number
  y: number
}

/** The single launch vector: direction + magnitude = initial velocity */
export interface LaunchVector {
  start: Vec2
  end: Vec2
}

export interface Asteroid {
  cx: number
  cy: number
  r: number
}

export interface GravityWell {
  id: number
  /** Center position */
  x: number
  y: number
  /** Strength (1–5), affects gravitational pull */
  strength: number
}

export interface LevelConfig {
  id: number
  name: string
  subtitle: string
  /** Ship starting position */
  shipStart: Vec2
  /** Target zone center */
  target: Vec2
  /** Target zone radius */
  targetRadius: number
  /** Asteroid obstacles */
  asteroids: Asteroid[]
  /** Fewest wells for 3 stars */
  wellPar: number
  /** Show grid lines? */
  showGrid: boolean
  /** Hint text */
  hint: string
}

export type GamePhase =
  | 'planning'   // user draws launch vector + places wells
  | 'launching'  // ship is animating along computed trajectory
  | 'success'    // reached target
  | 'collision'  // hit an asteroid
  | 'missed'     // animation ended without reaching target (out of bounds or timeout)

export interface TrailParticle {
  x: number
  y: number
  opacity: number
  id: number
}
