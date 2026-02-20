/** Types for Vector Voyager game */

export interface Vec2 {
  x: number
  y: number
}

export interface GameVector {
  /** Unique id */
  id: number
  /** Start point (determined by chain) */
  start: Vec2
  /** End point (user-dragged) */
  end: Vec2
}

export interface Asteroid {
  cx: number
  cy: number
  r: number
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
  /** Maximum total magnitude (fuel budget). 0 = unlimited */
  fuelBudget: number
  /** Par — number of vectors for 2-star */
  par: number
  /** Show grid lines? */
  showGrid: boolean
  /** Show component lines on active vector? */
  showComponents: boolean
  /** Hint text */
  hint: string
}

export type GamePhase =
  | 'planning'   // user draws vectors
  | 'launching'  // ship is animating
  | 'success'    // reached target
  | 'collision'  // hit an asteroid
  | 'missed'     // animation ended without reaching target

export interface TrailParticle {
  x: number
  y: number
  opacity: number
  id: number
}
