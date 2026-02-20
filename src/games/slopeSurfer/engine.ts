/**
 * Slope Surfer — Curve math, interpolation, derivative computation,
 * collision detection, and scoring.
 *
 * Uses Fritsch-Carlson monotone cubic interpolation to ensure smooth,
 * overshoot-free curves through control points.
 */

import type { Vec2, Gem, TargetZone, Particle } from './types'

// ─── Constants ────────────────────────────────────────────────────────

export const BOARD_WIDTH = 600
export const BOARD_HEIGHT = 320
export const BASE_SPEED = 30   // px/s per unit slope
export const MIN_SPEED = 5     // px/s minimum
export const GEM_RADIUS = 12   // collection radius
export const DERIV_H = 0.5     // central difference step
export const CURVE_SAMPLES = 200
export const MAX_PARTICLES = 40

// ─── Fritsch-Carlson Monotone Cubic Interpolation ─────────────────────

/**
 * Build a monotone cubic spline through sorted (x, y) points.
 * Returns a function f(x) → y that interpolates smoothly.
 *
 * Algorithm: Fritsch & Carlson (1980)
 * 1. Compute secants δk = (y[k+1] - y[k]) / (x[k+1] - x[k])
 * 2. Initialize tangents m[k] = (δ[k-1] + δ[k]) / 2
 * 3. At endpoints, m[0] = δ[0], m[n-1] = δ[n-2]
 * 4. If δ[k] = 0, set m[k] = m[k+1] = 0
 * 5. Restrict: α² + β² ≤ 9 where α = m[k]/δ[k], β = m[k+1]/δ[k]
 */
export function buildMonotoneCubic(points: Vec2[]): (x: number) => number {
  const n = points.length
  if (n === 0) return () => 0
  if (n === 1) return () => points[0].y

  // Sort by x
  const sorted = [...points].sort((a, b) => a.x - b.x)
  const xs = sorted.map(p => p.x)
  const ys = sorted.map(p => p.y)

  // Step 1: Compute secants
  const delta: number[] = []
  for (let i = 0; i < n - 1; i++) {
    const dx = xs[i + 1] - xs[i]
    delta.push(dx === 0 ? 0 : (ys[i + 1] - ys[i]) / dx)
  }

  // Step 2: Initialize tangents
  const m: number[] = new Array(n)
  m[0] = delta[0]
  m[n - 1] = delta[n - 2]
  for (let i = 1; i < n - 1; i++) {
    if (delta[i - 1] * delta[i] <= 0) {
      // Different signs or zero — flat tangent
      m[i] = 0
    } else {
      m[i] = (delta[i - 1] + delta[i]) / 2
    }
  }

  // Step 3: Fritsch-Carlson monotonicity correction
  for (let k = 0; k < n - 1; k++) {
    if (delta[k] === 0) {
      m[k] = 0
      m[k + 1] = 0
      continue
    }
    const alpha = m[k] / delta[k]
    const beta = m[k + 1] / delta[k]
    const s = alpha * alpha + beta * beta
    if (s > 9) {
      const tau = 3 / Math.sqrt(s)
      m[k] = tau * alpha * delta[k]
      m[k + 1] = tau * beta * delta[k]
    }
  }

  // Return interpolation function
  return (x: number): number => {
    // Clamp to range
    if (x <= xs[0]) return ys[0]
    if (x >= xs[n - 1]) return ys[n - 1]

    // Find segment via binary search
    let lo = 0
    let hi = n - 1
    while (lo < hi - 1) {
      const mid = (lo + hi) >> 1
      if (xs[mid] <= x) lo = mid
      else hi = mid
    }

    // Hermite basis interpolation
    const h = xs[hi] - xs[lo]
    if (h === 0) return ys[lo]
    const t = (x - xs[lo]) / h
    const t2 = t * t
    const t3 = t2 * t

    const h00 = 2 * t3 - 3 * t2 + 1
    const h10 = t3 - 2 * t2 + t
    const h01 = -2 * t3 + 3 * t2
    const h11 = t3 - t2

    return h00 * ys[lo] + h10 * h * m[lo] + h01 * ys[hi] + h11 * h * m[hi]
  }
}

// ─── Derivative Computation ─────────────────────────────────────────

/**
 * Numerical derivative via central difference.
 * f'(x) ≈ (f(x+h) - f(x-h)) / (2h)
 */
export function numericalDerivative(
  f: (x: number) => number,
  x: number,
  h: number = DERIV_H
): number {
  return (f(x + h) - f(x - h)) / (2 * h)
}

/**
 * Pre-sample the curve and its derivative at N evenly spaced points.
 * Returns arrays for efficient lookup during animation.
 */
export function sampleCurve(
  f: (x: number) => number,
  xStart: number,
  xEnd: number,
  samples: number = CURVE_SAMPLES
): { xs: number[]; ys: number[]; dys: number[] } {
  const xs: number[] = []
  const ys: number[] = []
  const dys: number[] = []
  const step = (xEnd - xStart) / (samples - 1)

  for (let i = 0; i < samples; i++) {
    const x = xStart + i * step
    xs.push(x)
    ys.push(f(x))
    dys.push(numericalDerivative(f, x))
  }

  return { xs, ys, dys }
}

// ─── Surfer Physics ───────────────────────────────────────────────────

/**
 * Compute surfer speed based on slope at current position.
 * speed = baseSpeed * |f'(x)| * speedMultiplier + minSpeed
 */
export function surferSpeed(
  derivative: number,
  speedMultiplier: number = 1
): number {
  return BASE_SPEED * Math.abs(derivative) * speedMultiplier + MIN_SPEED
}

/**
 * Advance surfer position by dt.
 * Returns new x position.
 */
export function advanceSurfer(
  x: number,
  derivative: number,
  dt: number,
  speedMultiplier: number = 1
): number {
  const speed = surferSpeed(derivative, speedMultiplier)
  return x + speed * dt
}

// ─── Curve Path Generation ──────────────────────────────────────────

/**
 * Generate SVG path data for a curve between xStart and xEnd.
 */
export function curvePath(
  f: (x: number) => number,
  xStart: number,
  xEnd: number,
  steps: number = CURVE_SAMPLES
): string {
  const dx = (xEnd - xStart) / steps
  let d = ''
  for (let i = 0; i <= steps; i++) {
    const x = xStart + i * dx
    const y = f(x)
    d += i === 0 ? `M${x},${y}` : ` L${x},${y}`
  }
  return d
}

/**
 * Generate filled area path (curve to bottom of viewport).
 */
export function curveAreaPath(
  f: (x: number) => number,
  xStart: number,
  xEnd: number,
  bottomY: number,
  steps: number = CURVE_SAMPLES
): string {
  const line = curvePath(f, xStart, xEnd, steps)
  return `${line} L${xEnd},${bottomY} L${xStart},${bottomY} Z`
}

// ─── Tangent Line ───────────────────────────────────────────────────

/**
 * Get tangent line endpoints at x position.
 * Returns a line segment centered at (x, f(x)) with slope f'(x).
 */
export function tangentLine(
  f: (x: number) => number,
  x: number,
  halfLength: number = 20
): { start: Vec2; end: Vec2; angle: number } {
  const y = f(x)
  const slope = numericalDerivative(f, x)
  const angle = Math.atan(slope)
  const dx = halfLength * Math.cos(angle)
  const dy = halfLength * Math.sin(angle)

  return {
    start: { x: x - dx, y: y - dy },
    end: { x: x + dx, y: y + dy },
    angle,
  }
}

// ─── Collision Detection ────────────────────────────────────────────

/**
 * Check if surfer at (x, y) collects a gem.
 */
export function checkGemCollision(
  surferPos: Vec2,
  gem: Gem,
  radius: number = GEM_RADIUS
): boolean {
  if (gem.collected) return false
  const dx = surferPos.x - gem.x
  const dy = surferPos.y - gem.y
  return dx * dx + dy * dy < radius * radius
}

/**
 * Check if surfer has reached the target zone.
 */
export function checkTargetReached(
  surferX: number,
  surferY: number,
  target: TargetZone
): boolean {
  return (
    surferX >= target.xStart &&
    surferX <= target.xEnd &&
    Math.abs(surferY - target.yCenter) <= target.tolerance
  )
}

/**
 * Calculate landing precision (0-1, 1 = perfect center).
 */
export function landingPrecision(
  surferX: number,
  target: TargetZone
): number {
  const center = (target.xStart + target.xEnd) / 2
  const halfWidth = (target.xEnd - target.xStart) / 2
  const dist = Math.abs(surferX - center)
  return Math.max(0, 1 - dist / halfWidth)
}

// ─── Scoring ────────────────────────────────────────────────────────

/**
 * Calculate stars earned for a level.
 * ⭐: Reach target
 * ⭐⭐: Reach target + collect ≥50% gems
 * ⭐⭐⭐: Reach target + ALL gems + under par time
 */
export function computeStars(
  reachedTarget: boolean,
  gemsCollected: number,
  totalGems: number,
  rideTime: number,
  parTime: number | null,
  freestyle?: boolean
): 0 | 1 | 2 | 3 {
  if (!reachedTarget && !freestyle) return 0

  // Freestyle mode: stars based on gems only
  if (freestyle) {
    if (totalGems === 0) return 3
    const ratio = gemsCollected / totalGems
    if (ratio >= 1) return 3
    if (ratio >= 5 / 6) return 2
    if (ratio >= 0.5) return 1
    return 0
  }

  if (totalGems === 0) {
    // No gems — just reaching target is enough
    return parTime !== null && rideTime <= parTime ? 3 : 1
  }

  const gemRatio = gemsCollected / totalGems

  if (gemRatio >= 1 && parTime !== null && rideTime <= parTime) return 3
  if (gemRatio >= 0.5) return 2
  return 1
}

/**
 * Calculate total score for a completed level.
 */
export function computeScore(
  reachedTarget: boolean,
  gemsCollected: number,
  comboBonus: number,
  rideTime: number,
  parTime: number | null,
  precision: number
): number {
  let score = 0
  if (reachedTarget) score += 500
  score += gemsCollected * 100
  score += comboBonus

  // Time bonus
  if (parTime !== null && rideTime <= parTime) {
    const timeRatio = Math.max(0, 1 - rideTime / parTime)
    score += Math.round(timeRatio * 300)
  }

  // Precision bonus
  score += Math.round(precision * 200)

  return score
}

// ─── Particle Helpers ───────────────────────────────────────────────

let particleIdCounter = 0

/**
 * Create gem collection burst particles.
 */
export function createGemBurst(pos: Vec2): Particle[] {
  const particles: Particle[] = []
  const colors = ['#ffd700', '#ffeb3b', '#fff176', '#ffe082', '#ffd54f', '#ffca28']
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI * 2 * i) / 6 + (Math.random() - 0.5) * 0.3
    const speed = 120 + Math.random() * 80
    particles.push({
      id: particleIdCounter++,
      x: pos.x,
      y: pos.y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 0.4,
      maxLife: 0.4,
      size: 3 + Math.random() * 2,
      color: colors[i],
    })
  }
  return particles
}

/**
 * Create landing success burst particles.
 */
export function createLandingBurst(pos: Vec2): Particle[] {
  const particles: Particle[] = []
  const colors = ['#4caf50', '#81c784', '#a5d6a7', '#ffd700', '#66bb6a']
  for (let i = 0; i < 16; i++) {
    const angle = (Math.PI * 2 * i) / 16 + (Math.random() - 0.5) * 0.3
    const speed = 150 + Math.random() * 150
    particles.push({
      id: particleIdCounter++,
      x: pos.x,
      y: pos.y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 0.5,
      maxLife: 0.5,
      size: 2 + Math.random() * 3,
      color: colors[i % colors.length],
      gravity: true,
    })
  }
  return particles
}

/**
 * Create speed trail particle (emitted behind surfer at high speed).
 */
export function createSpeedTrail(pos: Vec2, angle: number): Particle {
  const speed = 30 + Math.random() * 20
  return {
    id: particleIdCounter++,
    x: pos.x - Math.cos(angle) * 10,
    y: pos.y - Math.sin(angle) * 10,
    vx: -Math.cos(angle) * speed + (Math.random() - 0.5) * 10,
    vy: -Math.sin(angle) * speed + (Math.random() - 0.5) * 10,
    life: 0.3,
    maxLife: 0.3,
    size: 1.5 + Math.random(),
    color: '#ffffff',
  }
}

/**
 * Update all particles by dt. Remove dead ones, enforce max count.
 */
export function updateParticles(
  particles: Particle[],
  dt: number
): Particle[] {
  const updated = particles
    .map(p => ({
      ...p,
      x: p.x + p.vx * dt,
      y: p.y + p.vy * dt + (p.gravity ? 200 * dt * dt : 0),
      vy: p.vy + (p.gravity ? 200 * dt : 0),
      life: p.life - dt,
    }))
    .filter(p => p.life > 0)

  // Enforce max
  if (updated.length > MAX_PARTICLES) {
    return updated.slice(updated.length - MAX_PARTICLES)
  }
  return updated
}

// ─── Speed Classification ───────────────────────────────────────────

export type SpeedClass = 'slow' | 'medium' | 'fast' | 'extreme'

export function classifySpeed(absDerivative: number): SpeedClass {
  if (absDerivative < 0.3) return 'slow'
  if (absDerivative < 1.0) return 'medium'
  if (absDerivative < 2.0) return 'fast'
  return 'extreme'
}

export function speedColor(cls: SpeedClass): string {
  switch (cls) {
    case 'slow': return '#4fc3f7'
    case 'medium': return '#ffffff'
    case 'fast': return '#ffb74d'
    case 'extreme': return '#ff5252'
  }
}

// ─── Combo ──────────────────────────────────────────────────────────

export function comboColor(count: number): string {
  if (count <= 1) return '#ffffff'
  if (count === 2) return '#ffd700'
  if (count === 3) return '#ff9800'
  return '#ff5252'
}

export function comboMultiplier(count: number): number {
  return 1 + (count - 1) * 0.5
}
