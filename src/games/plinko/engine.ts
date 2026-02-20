/**
 * Physics engine for Plinko.
 *
 * Uses simple Euler integration with sub-stepping for stable collisions.
 * Balls fall under gravity, bounce off circular pegs and walls,
 * and collect in bins at the bottom.
 */
import type { Ball, Peg } from './types'

// ─── Board geometry ──────────────────────────────────────────────
export const BOARD_WIDTH = 400
export const BOARD_HEIGHT = 600
export const WALL_LEFT = 20
export const WALL_RIGHT = BOARD_WIDTH - 20
export const DROP_Y = 30
export const BIN_TOP = 510
export const BIN_BOTTOM = 590
export const PEG_ZONE_TOP = 60
export const PEG_ZONE_BOTTOM = 490

// ─── Physics constants ───────────────────────────────────────────
const GRAVITY = 600 // px/s^2
const BALL_RADIUS = 4
const DEFAULT_PEG_RADIUS = 9
const BUMPER_PEG_RADIUS = 14
const RESTITUTION = 0.65
const BUMPER_RESTITUTION = 0.85
const WALL_RESTITUTION = 0.5
const RANDOM_DEFLECTION = 0.15 // radians (~8.5 degrees)
const MAX_BALL_SPEED = 800
const BALL_TIMEOUT = 12 // seconds
const MIN_PEG_DISTANCE = 22 // minimum distance between peg centers
const FRICTION = 0.999 // very slight air friction per step

// ─── Ball creation ───────────────────────────────────────────────

let ballIdCounter = 0

export function createBall(dropX: number): Ball {
  return {
    id: ballIdCounter++,
    x: dropX + (Math.random() - 0.5) * 6,
    y: DROP_Y,
    vx: (Math.random() - 0.5) * 20,
    vy: 0,
    radius: BALL_RADIUS,
    active: true,
    binIndex: -1,
    age: 0,
  }
}

// ─── Peg creation ────────────────────────────────────────────────

export function createPegsFromLevel(
  fixedDefs: Array<{ x: number; y: number; radius?: number }>,
  moveableDefs: Array<{ x: number; y: number; radius?: number }>,
  bumperDefs: Array<{ x: number; y: number; radius?: number }> = []
): Peg[] {
  const pegs: Peg[] = []
  for (let i = 0; i < fixedDefs.length; i++) {
    const d = fixedDefs[i]
    pegs.push({
      id: `fixed-${i}`,
      x: d.x,
      y: d.y,
      radius: d.radius ?? DEFAULT_PEG_RADIUS,
      type: 'fixed',
      startX: d.x,
      startY: d.y,
    })
  }
  for (let i = 0; i < moveableDefs.length; i++) {
    const d = moveableDefs[i]
    pegs.push({
      id: `move-${i}`,
      x: d.x,
      y: d.y,
      radius: d.radius ?? DEFAULT_PEG_RADIUS,
      type: 'moveable',
      startX: d.x,
      startY: d.y,
    })
  }
  for (let i = 0; i < bumperDefs.length; i++) {
    const d = bumperDefs[i]
    pegs.push({
      id: `bump-${i}`,
      x: d.x,
      y: d.y,
      radius: d.radius ?? BUMPER_PEG_RADIUS,
      type: 'bumper',
      startX: d.x,
      startY: d.y,
    })
  }
  return pegs
}

// ─── Physics step ────────────────────────────────────────────────

/**
 * Advance the simulation by dt seconds.
 * Uses sub-stepping for stability.
 * Returns the list of bin indices that balls just landed in.
 */
export function stepPhysics(
  balls: Ball[],
  pegs: Peg[],
  binCount: number,
  dt: number
): number[] {
  const landed: number[] = []
  const subSteps = Math.max(1, Math.ceil(dt / 0.002))
  const subDt = dt / subSteps

  for (const ball of balls) {
    if (!ball.active) continue
    ball.age += dt

    // Timeout stuck balls
    if (ball.age > BALL_TIMEOUT) {
      ball.active = false
      // Place in nearest bin
      const binIdx = getBinIndex(ball.x, binCount)
      ball.binIndex = binIdx
      landed.push(binIdx)
      continue
    }

    for (let s = 0; s < subSteps; s++) {
      // Apply gravity
      ball.vy += GRAVITY * subDt

      // Apply friction
      ball.vx *= FRICTION
      ball.vy *= FRICTION

      // Cap speed
      const speed = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy)
      if (speed > MAX_BALL_SPEED) {
        const scale = MAX_BALL_SPEED / speed
        ball.vx *= scale
        ball.vy *= scale
      }

      // Move
      ball.x += ball.vx * subDt
      ball.y += ball.vy * subDt

      // Collide with pegs
      for (const peg of pegs) {
        const dx = ball.x - peg.x
        const dy = ball.y - peg.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        const minDist = ball.radius + peg.radius

        if (dist < minDist && dist > 0.001) {
          // Push ball out
          const nx = dx / dist
          const ny = dy / dist
          const overlap = minDist - dist
          ball.x += nx * overlap
          ball.y += ny * overlap

          // Reflect velocity
          const dot = ball.vx * nx + ball.vy * ny
          if (dot < 0) {
            const rest = peg.type === 'bumper' ? BUMPER_RESTITUTION : RESTITUTION
            ball.vx -= (1 + rest) * dot * nx
            ball.vy -= (1 + rest) * dot * ny

            // Random deflection for natural scatter
            const angle = Math.atan2(ball.vy, ball.vx)
            const deflection = (Math.random() - 0.5) * 2 * RANDOM_DEFLECTION
            const newAngle = angle + deflection
            const v = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy)
            ball.vx = v * Math.cos(newAngle)
            ball.vy = v * Math.sin(newAngle)
          }
        }
      }

      // Wall collisions
      if (ball.x - ball.radius < WALL_LEFT) {
        ball.x = WALL_LEFT + ball.radius
        ball.vx = Math.abs(ball.vx) * WALL_RESTITUTION
      }
      if (ball.x + ball.radius > WALL_RIGHT) {
        ball.x = WALL_RIGHT - ball.radius
        ball.vx = -Math.abs(ball.vx) * WALL_RESTITUTION
      }

      // Check if ball reached bin area
      if (ball.y >= BIN_TOP && ball.active) {
        const binIdx = getBinIndex(ball.x, binCount)
        ball.binIndex = binIdx
        ball.active = false
        // Place ball in the bin
        ball.y = BIN_TOP + ball.radius + 2
        ball.vx = 0
        ball.vy = 0
        landed.push(binIdx)
        break
      }

      // Don't let balls fall off the bottom
      if (ball.y > BIN_BOTTOM) {
        ball.y = BIN_BOTTOM
        ball.vy = 0
        if (ball.active) {
          const binIdx = getBinIndex(ball.x, binCount)
          ball.binIndex = binIdx
          ball.active = false
          landed.push(binIdx)
        }
        break
      }
    }
  }

  return landed
}

function getBinIndex(x: number, binCount: number): number {
  const boardUsable = WALL_RIGHT - WALL_LEFT
  const relX = x - WALL_LEFT
  const binWidth = boardUsable / binCount
  const idx = Math.floor(relX / binWidth)
  return Math.max(0, Math.min(binCount - 1, idx))
}

// ─── Bin geometry ────────────────────────────────────────────────

export function getBinX(binIndex: number, binCount: number): number {
  const boardUsable = WALL_RIGHT - WALL_LEFT
  const binWidth = boardUsable / binCount
  return WALL_LEFT + binIndex * binWidth + binWidth / 2
}

export function getBinWidth(binCount: number): number {
  return (WALL_RIGHT - WALL_LEFT) / binCount
}

// ─── Peg validation ──────────────────────────────────────────────

/** Check if a peg can be placed at (x, y) without overlapping others */
export function isValidPegPosition(
  x: number,
  y: number,
  pegId: string,
  allPegs: Peg[]
): boolean {
  // Must be within the peg zone
  if (x < WALL_LEFT + 15 || x > WALL_RIGHT - 15) return false
  if (y < PEG_ZONE_TOP || y > PEG_ZONE_BOTTOM) return false

  // Must not overlap other pegs
  for (const peg of allPegs) {
    if (peg.id === pegId) continue
    const dx = x - peg.x
    const dy = y - peg.y
    const dist = Math.sqrt(dx * dx + dy * dy)
    if (dist < MIN_PEG_DISTANCE) return false
  }

  return true
}

/** Clamp a peg position to valid zone */
export function clampPegPosition(x: number, y: number): { x: number; y: number } {
  return {
    x: Math.max(WALL_LEFT + 15, Math.min(WALL_RIGHT - 15, x)),
    y: Math.max(PEG_ZONE_TOP, Math.min(PEG_ZONE_BOTTOM, y)),
  }
}

// ─── Scoring ─────────────────────────────────────────────────────

/**
 * Compute match percentage between histogram and target.
 * Uses normalized absolute difference (0-100%).
 */
export function computeMatchPercent(bins: number[], target: number[]): number {
  const total = bins.reduce((a, b) => a + b, 0)
  if (total === 0) return 0

  const actual = bins.map((b) => b / total)
  let diffSum = 0
  for (let i = 0; i < actual.length; i++) {
    diffSum += Math.abs(actual[i] - (target[i] ?? 0))
  }

  // Max possible difference is 2
  const match = Math.max(0, 100 * (1 - diffSum / 2))
  return Math.round(match * 10) / 10
}

export function computeStars(
  matchPercent: number,
  star1: number,
  star2: number,
  star3: number
): 0 | 1 | 2 | 3 {
  if (matchPercent >= star3) return 3
  if (matchPercent >= star2) return 2
  if (matchPercent >= star1) return 1
  return 0
}
