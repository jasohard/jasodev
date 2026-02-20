/**
 * Vector Voyager game engine — geometry, collision, scoring.
 */
import type { Vec2, GameVector, Asteroid } from './types'

// ─── Board geometry ──────────────────────────────────────────────

export const BOARD_WIDTH = 440
export const BOARD_HEIGHT = 440

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

export function vecAngleDeg(v: Vec2): number {
  // Returns angle in degrees, 0° = right, positive = counter-clockwise
  return (Math.atan2(-v.y, v.x) * 180) / Math.PI
}

export function vecNormalize(v: Vec2): Vec2 {
  const len = vecLen(v)
  if (len === 0) return { x: 0, y: 0 }
  return { x: v.x / len, y: v.y / len }
}

// ─── Magnitude / direction labels ───────────────────────────────

export function magnitude(v: GameVector): number {
  return vecDist(v.start, v.end)
}

export function direction(v: GameVector): Vec2 {
  return vecSub(v.end, v.start)
}

// ─── Total fuel used ────────────────────────────────────────────

export function totalFuelUsed(vectors: GameVector[]): number {
  return vectors.reduce((sum, v) => sum + magnitude(v), 0)
}

// ─── Resultant vector ───────────────────────────────────────────

export function resultantEnd(vectors: GameVector[]): Vec2 | null {
  if (vectors.length === 0) return null
  return vectors[vectors.length - 1].end
}

// ─── Collision detection ────────────────────────────────────────

/**
 * Check if a line segment from p1 to p2 intersects a circle.
 * Returns the parameter t (0-1) of first intersection, or null.
 */
export function segmentCircleIntersection(
  p1: Vec2,
  p2: Vec2,
  center: Vec2,
  radius: number
): number | null {
  const d = vecSub(p2, p1)
  const f = vecSub(p1, center)

  const a = d.x * d.x + d.y * d.y
  const b = 2 * (f.x * d.x + f.y * d.y)
  const c = f.x * f.x + f.y * f.y - radius * radius

  let discriminant = b * b - 4 * a * c
  if (discriminant < 0) return null

  discriminant = Math.sqrt(discriminant)

  const t1 = (-b - discriminant) / (2 * a)
  const t2 = (-b + discriminant) / (2 * a)

  // Return smallest t in [0, 1]
  if (t1 >= 0 && t1 <= 1) return t1
  if (t2 >= 0 && t2 <= 1) return t2
  return null
}

/**
 * Check all vector segments against all asteroids.
 * Returns { hit: true, asteroidIdx, vectorIdx, t, point } or { hit: false }.
 */
export function checkCollisions(
  vectors: GameVector[],
  asteroids: Asteroid[]
): { hit: false } | { hit: true; vectorIdx: number; t: number; point: Vec2 } {
  for (let vi = 0; vi < vectors.length; vi++) {
    const v = vectors[vi]
    for (const ast of asteroids) {
      const t = segmentCircleIntersection(v.start, v.end, { x: ast.cx, y: ast.cy }, ast.r)
      if (t !== null) {
        const d = vecSub(v.end, v.start)
        return {
          hit: true,
          vectorIdx: vi,
          t,
          point: { x: v.start.x + d.x * t, y: v.start.y + d.y * t },
        }
      }
    }
  }
  return { hit: false }
}

/**
 * Check if the final endpoint is inside the target zone.
 */
export function reachesTarget(
  vectors: GameVector[],
  target: Vec2,
  targetRadius: number
): boolean {
  if (vectors.length === 0) return false
  const end = vectors[vectors.length - 1].end
  return vecDist(end, target) <= targetRadius
}

// ─── Scoring ────────────────────────────────────────────────────

export function computeStars(
  reached: boolean,
  vectorCount: number,
  par: number,
  fuelUsed: number,
  fuelBudget: number
): 0 | 1 | 2 | 3 {
  if (!reached) return 0
  const underPar = vectorCount <= par
  const underBudget = fuelBudget <= 0 || fuelUsed <= fuelBudget
  if (underPar && underBudget) return 3
  if (underPar || underBudget) return 2
  return 1
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

// ─── Vector palette ─────────────────────────────────────────────

export const VECTOR_COLORS = [
  '#4fc3f7', // blue
  '#81c784', // green
  '#f48fb1', // pink
  '#ffb74d', // orange
  '#ce93d8', // purple
  '#4dd0e1', // teal
  '#fff176', // yellow
  '#a1887f', // brown
]

export function vectorColor(index: number): string {
  return VECTOR_COLORS[index % VECTOR_COLORS.length]
}
