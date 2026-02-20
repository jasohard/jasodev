/**
 * Vector Voyager game engine — gravity simulation, collision, trajectory.
 */
import type { Vec2, LaunchVector, Asteroid, GravityWell } from './types'

// ─── Board geometry ──────────────────────────────────────────────

export const BOARD_WIDTH = 440
export const BOARD_HEIGHT = 440

// ─── Physics constants ───────────────────────────────────────────

/** Gravitational constant (tunable) */
const G = 8000
/** Minimum distance to prevent singularity at well center */
const MIN_DIST = 12
/** Max simulation steps for trajectory preview */
const PREVIEW_STEPS = 1200
/** Simulation time step (smaller = more accurate) */
const DT = 0.012
/** Max simulation time (seconds) before auto-miss */
export const MAX_SIM_TIME = PREVIEW_STEPS * DT
/** Speed scale: converts launch vector pixel length to velocity */
const SPEED_SCALE = 2.5
/** Ship collision radius */
const SHIP_RADIUS = 6

// ─── Vector math helpers ────────────────────────────────────────

export function vecSub(a: Vec2, b: Vec2): Vec2 {
  return { x: a.x - b.x, y: a.y - b.y }
}

export function vecAdd(a: Vec2, b: Vec2): Vec2 {
  return { x: a.x + b.x, y: a.y + b.y }
}

export function vecScale(v: Vec2, s: number): Vec2 {
  return { x: v.x * s, y: v.y * s }
}

export function vecLen(v: Vec2): number {
  return Math.sqrt(v.x * v.x + v.y * v.y)
}

export function vecDist(a: Vec2, b: Vec2): number {
  return vecLen(vecSub(a, b))
}

export function vecNormalize(v: Vec2): Vec2 {
  const len = vecLen(v)
  if (len === 0) return { x: 0, y: 0 }
  return { x: v.x / len, y: v.y / len }
}

export function vecAngleDeg(v: Vec2): number {
  return (Math.atan2(-v.y, v.x) * 180) / Math.PI
}

// ─── Trajectory simulation ──────────────────────────────────────

export interface SimResult {
  /** All positions along the trajectory */
  path: Vec2[]
  /** Whether the ship reached the target */
  reachedTarget: boolean
  /** Whether the ship hit an asteroid */
  hitAsteroid: boolean
  /** Index into path where collision/success occurred (-1 if missed) */
  endIdx: number
}

/**
 * Compute gravitational acceleration from all wells at a position.
 */
function computeGravAccel(px: number, py: number, wells: GravityWell[]): Vec2 {
  let ax = 0
  let ay = 0
  for (const well of wells) {
    const dx = well.x - px
    const dy = well.y - py
    const distSq = dx * dx + dy * dy
    const dist = Math.sqrt(distSq)
    const clampedDist = Math.max(dist, MIN_DIST)
    const force = G * well.strength / (clampedDist * clampedDist)
    const norm = dist > 0 ? 1 / dist : 0
    ax += dx * norm * force
    ay += dy * norm * force
  }
  return { x: ax, y: ay }
}

/**
 * Simulate the ship's trajectory under gravity well influence.
 * Uses Velocity Verlet integration for stability.
 */
export function simulateTrajectory(
  launch: LaunchVector,
  wells: GravityWell[],
  asteroids: Asteroid[],
  target: Vec2,
  targetRadius: number,
  maxSteps: number = PREVIEW_STEPS
): SimResult {
  const dir = vecSub(launch.end, launch.start)
  let vx = dir.x * SPEED_SCALE
  let vy = dir.y * SPEED_SCALE
  let px = launch.start.x
  let py = launch.start.y

  const path: Vec2[] = [{ x: px, y: py }]

  for (let step = 0; step < maxSteps; step++) {
    // Compute gravitational acceleration at current position
    const a1 = computeGravAccel(px, py, wells)

    // Velocity Verlet: half-step velocity update
    vx += a1.x * DT * 0.5
    vy += a1.y * DT * 0.5

    // Position update
    px += vx * DT
    py += vy * DT

    // Recompute acceleration at new position
    const a2 = computeGravAccel(px, py, wells)

    // Second half-step velocity update
    vx += a2.x * DT * 0.5
    vy += a2.y * DT * 0.5

    path.push({ x: px, y: py })

    // Check target reached
    const distToTarget = Math.sqrt(
      (px - target.x) * (px - target.x) + (py - target.y) * (py - target.y)
    )
    if (distToTarget <= targetRadius) {
      return { path, reachedTarget: true, hitAsteroid: false, endIdx: path.length - 1 }
    }

    // Check asteroid collision (line segment from prev to current)
    const prev = path[path.length - 2]
    for (const ast of asteroids) {
      if (segmentCircleHit(prev, { x: px, y: py }, { x: ast.cx, y: ast.cy }, ast.r + SHIP_RADIUS)) {
        return { path, reachedTarget: false, hitAsteroid: true, endIdx: path.length - 1 }
      }
    }

    // Out of bounds check (with generous margin)
    const margin = 60
    if (px < -margin || px > BOARD_WIDTH + margin || py < -margin || py > BOARD_HEIGHT + margin) {
      return { path, reachedTarget: false, hitAsteroid: false, endIdx: path.length - 1 }
    }
  }

  return { path, reachedTarget: false, hitAsteroid: false, endIdx: path.length - 1 }
}

/** Check if a line segment from p1→p2 intersects a circle */
function segmentCircleHit(p1: Vec2, p2: Vec2, center: Vec2, radius: number): boolean {
  const d = vecSub(p2, p1)
  const f = vecSub(p1, center)
  const a = d.x * d.x + d.y * d.y
  if (a === 0) {
    // Degenerate segment — check point-in-circle
    return f.x * f.x + f.y * f.y <= radius * radius
  }
  const b = 2 * (f.x * d.x + f.y * d.y)
  const c = f.x * f.x + f.y * f.y - radius * radius
  let disc = b * b - 4 * a * c
  if (disc < 0) return false
  disc = Math.sqrt(disc)
  const t1 = (-b - disc) / (2 * a)
  const t2 = (-b + disc) / (2 * a)
  return (t1 >= 0 && t1 <= 1) || (t2 >= 0 && t2 <= 1)
}

// ─── Scoring ────────────────────────────────────────────────────

/**
 * Star rating based on gravity well count vs level par.
 * wellPar wells → 3 stars
 * wellPar + 1 → 2 stars
 * wellPar + 2 or more → 1 star
 * 0 stars if target not reached
 */
export function computeStars(
  reached: boolean,
  wellCount: number,
  wellPar: number
): 0 | 1 | 2 | 3 {
  if (!reached) return 0
  if (wellCount <= wellPar) return 3
  if (wellCount <= wellPar + 1) return 2
  return 1
}

/**
 * Maximum wells allowed for a level: wellPar + 3
 */
export function maxWells(wellPar: number): number {
  return wellPar + 3
}

// ─── Utility: check if a point is too close to obstacles ────────

/**
 * Check if a position is too close to any asteroid or the ship
 * (to prevent placing wells on top of them).
 */
export function isTooClose(
  pos: Vec2,
  asteroids: Asteroid[],
  shipStart: Vec2,
  target: Vec2,
  targetRadius: number,
  wells: GravityWell[],
  minAsteroidDist: number = 30,
  minShipDist: number = 30,
  minWellDist: number = 25
): boolean {
  // Too close to asteroids?
  for (const ast of asteroids) {
    if (vecDist(pos, { x: ast.cx, y: ast.cy }) < ast.r + minAsteroidDist) return true
  }
  // Too close to ship?
  if (vecDist(pos, shipStart) < minShipDist) return true
  // Too close to target?
  if (vecDist(pos, target) < targetRadius + 10) return true
  // Too close to existing wells?
  for (const well of wells) {
    if (vecDist(pos, { x: well.x, y: well.y }) < minWellDist) return true
  }
  return false
}

// ─── Star field generation ──────────────────────────────────────

export interface Star {
  x: number
  y: number
  r: number
  opacity: number
}

export function generateStarField(count: number): Star[] {
  const stars: Star[] = []
  for (let i = 0; i < count; i++) {
    stars.push({
      x: Math.random() * BOARD_WIDTH,
      y: Math.random() * BOARD_HEIGHT,
      r: 0.4 + Math.random() * 1.6,
      opacity: 0.25 + Math.random() * 0.55,
    })
  }
  return stars
}
