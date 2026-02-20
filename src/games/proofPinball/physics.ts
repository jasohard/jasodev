/**
 * Physics engine for Proof Pinball.
 *
 * Handles line-segment intersection, reflection vectors,
 * and full ball-path computation through a room of walls.
 */

import type { Vec2, Wall, BounceInfo, BallPath, Target, Reflector } from './types'

// ── Vector helpers ────────────────────────────────────────

export function vec(x: number, y: number): Vec2 {
  return { x, y }
}

export function add(a: Vec2, b: Vec2): Vec2 {
  return { x: a.x + b.x, y: a.y + b.y }
}

export function sub(a: Vec2, b: Vec2): Vec2 {
  return { x: a.x - b.x, y: a.y - b.y }
}

export function scale(v: Vec2, s: number): Vec2 {
  return { x: v.x * s, y: v.y * s }
}

export function dot(a: Vec2, b: Vec2): number {
  return a.x * b.x + a.y * b.y
}

export function length(v: Vec2): number {
  return Math.sqrt(v.x * v.x + v.y * v.y)
}

export function normalize(v: Vec2): Vec2 {
  const len = length(v)
  if (len === 0) return { x: 0, y: 0 }
  return { x: v.x / len, y: v.y / len }
}

export function distance(a: Vec2, b: Vec2): number {
  return length(sub(b, a))
}

export function degToRad(deg: number): number {
  return (deg * Math.PI) / 180
}

export function radToDeg(rad: number): number {
  return (rad * 180) / Math.PI
}

/** Get a direction vector from an angle in degrees (0 = right, CCW positive in math coords) */
export function directionFromAngle(angleDeg: number): Vec2 {
  const rad = degToRad(angleDeg)
  return { x: Math.cos(rad), y: -Math.sin(rad) } // negative y because SVG y is flipped
}

// ── Geometry ──────────────────────────────────────────────

/**
 * Find the intersection point of two line segments (p1->p2) and (p3->p4).
 * Returns the intersection point and the parametric t along the first segment,
 * or null if no intersection.
 */
export function segmentIntersection(
  p1: Vec2,
  p2: Vec2,
  p3: Vec2,
  p4: Vec2
): { point: Vec2; t: number; u: number } | null {
  const d1 = sub(p2, p1)
  const d2 = sub(p4, p3)

  const denom = d1.x * d2.y - d1.y * d2.x

  // Parallel or coincident
  if (Math.abs(denom) < 1e-10) return null

  const d3 = sub(p3, p1)
  const t = (d3.x * d2.y - d3.y * d2.x) / denom
  const u = (d3.x * d1.y - d3.y * d1.x) / denom

  // Check if intersection is within both segments
  if (t < 1e-6 || t > 1 - 1e-6 || u < 1e-6 || u > 1 - 1e-6) return null

  return {
    point: add(p1, scale(d1, t)),
    t,
    u,
  }
}

/**
 * Get the outward normal of a wall. We use the "left" normal,
 * then ensure it faces toward the ball's approach direction.
 */
export function getWallNormal(wall: Wall, incomingDir: Vec2): Vec2 {
  const wallDir = normalize(sub(wall.end, wall.start))
  // Left-hand normal: perpendicular
  let normal: Vec2 = { x: -wallDir.y, y: wallDir.x }

  // Make sure normal faces towards incoming ball (opposite to incoming direction)
  if (dot(normal, incomingDir) > 0) {
    normal = scale(normal, -1)
  }

  return normal
}

/**
 * Reflect a direction vector across a normal.
 * reflection = d - 2(d.n)n
 */
export function reflect(direction: Vec2, normal: Vec2): Vec2 {
  const d = dot(direction, normal)
  return {
    x: direction.x - 2 * d * normal.x,
    y: direction.y - 2 * d * normal.y,
  }
}

/**
 * Convert a reflector to a Wall for physics purposes.
 */
export function reflectorToWall(ref: Reflector): Wall {
  const rad = degToRad(ref.angle)
  const dx = Math.cos(rad) * ref.halfLength
  const dy = Math.sin(rad) * ref.halfLength
  return {
    id: ref.id,
    start: { x: ref.center.x - dx, y: ref.center.y - dy },
    end: { x: ref.center.x + dx, y: ref.center.y + dy },
  }
}

// ── Ball path computation ────────────────────────────────

const EPSILON = 0.01 // small offset to prevent re-intersection with the same wall

/**
 * Compute the full ball path through a room.
 * Returns the path (all points) and bounce info at each wall collision.
 */
export function computeBallPath(
  startPos: Vec2,
  angleDeg: number,
  walls: Wall[],
  reflectors: Reflector[],
  targets: Target[],
  maxBounces: number
): BallPath {
  const allWalls = [...walls, ...reflectors.map(reflectorToWall)]
  const points: Vec2[] = [startPos]
  const bounces: BounceInfo[] = []
  const targetsHit: string[] = []
  const hitTargetSet = new Set<string>()

  let pos = { ...startPos }
  let dir = directionFromAngle(angleDeg)
  let bounceCount = 0

  // Maximum path length to prevent infinite loops
  const MAX_PATH_LENGTH = 5000

  while (bounceCount < maxBounces) {
    // Cast a ray from pos in direction dir, find nearest wall intersection
    const rayEnd = add(pos, scale(dir, MAX_PATH_LENGTH))

    let nearest: { point: Vec2; t: number; wall: Wall } | null = null
    let minDist = Infinity

    for (const wall of allWalls) {
      const hit = segmentIntersection(pos, rayEnd, wall.start, wall.end)
      if (hit) {
        const dist = distance(pos, hit.point)
        if (dist > EPSILON && dist < minDist) {
          minDist = dist
          nearest = { point: hit.point, t: hit.t, wall }
        }
      }
    }

    if (!nearest) {
      // Ball escapes the room (shouldn't happen in well-designed levels)
      // Add a point far along the direction and stop
      points.push(add(pos, scale(dir, 300)))
      break
    }

    // Check if ball passes through any target zones on this segment
    for (const target of targets) {
      if (hitTargetSet.has(target.id)) continue
      if (pointNearSegment(target.center, pos, nearest.point, target.radius)) {
        hitTargetSet.add(target.id)
        targetsHit.push(target.id)
      }
    }

    const hitPoint = nearest.point
    points.push(hitPoint)

    // Compute reflection
    const normal = getWallNormal(nearest.wall, dir)
    const reflected = reflect(dir, normal)

    // Compute angles for display
    const incidenceAngle = radToDeg(Math.acos(Math.abs(dot(normalize(scale(dir, -1)), normal))))
    const reflectionAngle = radToDeg(Math.acos(Math.abs(dot(normalize(reflected), normal))))

    bounces.push({
      position: hitPoint,
      incidenceAngle: Math.round(incidenceAngle * 10) / 10,
      reflectionAngle: Math.round(reflectionAngle * 10) / 10,
      normal,
      incoming: normalize(dir),
      outgoing: normalize(reflected),
    })

    // Move slightly away from the wall to prevent re-intersection
    pos = add(hitPoint, scale(normalize(reflected), EPSILON))
    dir = normalize(reflected)
    bounceCount++
  }

  return { points, bounces, targetsHit }
}

/**
 * Check if a point is within `radius` distance of a line segment.
 */
function pointNearSegment(point: Vec2, segStart: Vec2, segEnd: Vec2, radius: number): boolean {
  const seg = sub(segEnd, segStart)
  const segLen = length(seg)
  if (segLen < 1e-10) return distance(point, segStart) <= radius

  const t = Math.max(0, Math.min(1, dot(sub(point, segStart), seg) / (segLen * segLen)))
  const projection = add(segStart, scale(seg, t))
  return distance(point, projection) <= radius
}

/**
 * Compute a prediction path (for aiming visualization).
 * Same as computeBallPath but limited to fewer bounces.
 */
export function computePredictionPath(
  startPos: Vec2,
  angleDeg: number,
  walls: Wall[],
  reflectors: Reflector[],
  maxBounces: number
): Vec2[] {
  const allWalls = [...walls, ...reflectors.map(reflectorToWall)]
  const points: Vec2[] = [startPos]

  let pos = { ...startPos }
  let dir = directionFromAngle(angleDeg)
  let bounceCount = 0
  const MAX_PATH_LENGTH = 5000

  while (bounceCount < maxBounces) {
    const rayEnd = add(pos, scale(dir, MAX_PATH_LENGTH))

    let nearest: { point: Vec2; wall: Wall } | null = null
    let minDist = Infinity

    for (const wall of allWalls) {
      const hit = segmentIntersection(pos, rayEnd, wall.start, wall.end)
      if (hit) {
        const dist = distance(pos, hit.point)
        if (dist > EPSILON && dist < minDist) {
          minDist = dist
          nearest = { point: hit.point, wall }
        }
      }
    }

    if (!nearest) {
      points.push(add(pos, scale(dir, 200)))
      break
    }

    points.push(nearest.point)

    const normal = getWallNormal(nearest.wall, dir)
    const reflected = reflect(dir, normal)
    pos = add(nearest.point, scale(normalize(reflected), EPSILON))
    dir = normalize(reflected)
    bounceCount++
  }

  return points
}

/**
 * Interpolate along a polyline path.
 * Returns the position at a given fraction (0–1) of the total path length.
 */
export function interpolatePath(points: Vec2[], fraction: number): Vec2 {
  if (points.length === 0) return { x: 0, y: 0 }
  if (points.length === 1 || fraction <= 0) return points[0]
  if (fraction >= 1) return points[points.length - 1]

  // Calculate total path length
  let totalLength = 0
  const segmentLengths: number[] = []
  for (let i = 1; i < points.length; i++) {
    const segLen = distance(points[i - 1], points[i])
    segmentLengths.push(segLen)
    totalLength += segLen
  }

  if (totalLength === 0) return points[0]

  const targetDist = fraction * totalLength
  let accumulated = 0

  for (let i = 0; i < segmentLengths.length; i++) {
    const segLen = segmentLengths[i]
    if (accumulated + segLen >= targetDist) {
      const segFraction = (targetDist - accumulated) / segLen
      return {
        x: points[i].x + (points[i + 1].x - points[i].x) * segFraction,
        y: points[i].y + (points[i + 1].y - points[i].y) * segFraction,
      }
    }
    accumulated += segLen
  }

  return points[points.length - 1]
}

/**
 * Get the total length of a polyline path.
 */
export function pathLength(points: Vec2[]): number {
  let total = 0
  for (let i = 1; i < points.length; i++) {
    total += distance(points[i - 1], points[i])
  }
  return total
}
