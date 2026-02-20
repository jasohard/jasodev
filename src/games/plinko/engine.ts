/**
 * Plinko game engine — handles board layout, ball path computation,
 * histogram scoring, and all game logic.
 *
 * The board uses a standard Galton board layout:
 * - Even rows (0, 2, 4...) are "wide" rows with more pegs
 * - Odd rows (1, 3, 5...) are "narrow" rows, offset by half a peg-spacing
 *
 * When a ball hits a peg, it goes LEFT (same column in next row) or RIGHT
 * (column+1 in next row for wide→narrow) / (same or +1 for narrow→wide).
 *
 * The ball's position between pegs is tracked by which "gap" it falls into.
 * After the last row, the gap maps directly to a bin.
 */
import type { Peg, PegPosition, BallPath, LevelConfig } from './types'

// ─── Board geometry ──────────────────────────────────────────────

/** SVG viewBox dimensions */
export const BOARD_WIDTH = 400
export const BOARD_HEIGHT = 520
export const BOARD_PADDING_X = 40
export const BOARD_PADDING_TOP = 50
export const BOARD_PADDING_BOTTOM = 130
export const PEG_RADIUS = 8

/** Get number of pegs in a given row. Even rows are wider. */
export function getRowPegCount(row: number, totalRows: number): number {
  // Wide rows have one more peg than narrow rows.
  // Pattern for N total rows: wide = ceil(N/2)+1, narrow = ceil(N/2)
  // e.g. 3 rows → 3,2,3 (bins=4), 4 rows → 4,3,4,3 (bins=5)
  // 5 rows → 4,3,4,3,4 (bins=5), 6 rows → 5,4,5,4,5,4 (bins=6)
  // 7 rows → 5,4,5,4,5,4,5 (bins=6)
  const widePegs = Math.ceil(totalRows / 2) + 1
  const narrowPegs = widePegs - 1
  return row % 2 === 0 ? widePegs : narrowPegs
}

/** Get the number of bins for a given row count */
export function getBinCount(totalRows: number): number {
  // Bins = wide row peg count + 1
  return getRowPegCount(0, totalRows) + 1
}

/** Compute the (x, y) center of a peg given its row/col and total row count */
export function pegPosition(row: number, col: number, totalRows: number): PegPosition {
  const pegsInRow = getRowPegCount(row, totalRows)
  const maxPegs = getRowPegCount(0, totalRows)

  const usableWidth = BOARD_WIDTH - BOARD_PADDING_X * 2
  const usableHeight = BOARD_HEIGHT - BOARD_PADDING_TOP - BOARD_PADDING_BOTTOM

  // Spacing between pegs in widest row
  const hSpacing = maxPegs > 1 ? usableWidth / (maxPegs - 1) : usableWidth
  const vSpacing = totalRows > 1 ? usableHeight / (totalRows - 1) : usableHeight

  // Offset for rows with fewer pegs (centered)
  const rowOffset = ((maxPegs - pegsInRow) * hSpacing) / 2

  return {
    x: BOARD_PADDING_X + rowOffset + col * hSpacing,
    y: BOARD_PADDING_TOP + row * vSpacing,
  }
}

// ─── Peg initialization ──────────────────────────────────────────

/** Create the initial peg grid for a level */
export function createPegs(level: LevelConfig): Peg[][] {
  const pegs: Peg[][] = []
  for (let row = 0; row < level.rows; row++) {
    const count = getRowPegCount(row, level.rows)
    const rowPegs: Peg[] = []
    for (let col = 0; col < count; col++) {
      rowPegs.push({
        row,
        col,
        leftProb: level.initialProb,
        locked: level.allLocked,
      })
    }
    pegs.push(rowPegs)
  }
  return pegs
}

// ─── Ball path computation ───────────────────────────────────────

/**
 * Pre-compute a ball's path through the Galton board.
 *
 * We model the ball as falling through "gaps" between pegs. The ball
 * enters from the top-center gap, hits a peg, and falls into either
 * the left or right child gap. We track which peg the ball hits at
 * each row, determine left/right based on that peg's probability,
 * and eventually the ball lands in a bin.
 *
 * For a standard Galton board:
 * - Wide row peg at col C, if ball goes left → hits narrow row peg at col C-1 (if exists)
 *   If ball goes right → hits narrow row peg at col C (if exists)
 * - Narrow row peg at col C, if ball goes left → hits wide row peg at col C
 *   If ball goes right → hits wide row peg at col C+1
 *
 * But we simplify: we track the ball's "gap index" — which gap between pegs
 * the ball occupies after bouncing. Then at the next row, the ball hits the
 * peg that's directly below (or to the left/right of) that gap.
 *
 * Actually, let's use the simplest correct model:
 * Track which peg the ball hits at each row. The ball drops from above
 * and hits the center peg of row 0. After left/right decision, it
 * hits the appropriate peg in the next row based on the staggered layout.
 */
export function computeBallPath(pegs: Peg[][], totalRows: number): BallPath {
  const points: { x: number; y: number }[] = []
  const binCount = getBinCount(totalRows)

  // Start position: top-center
  const startX = BOARD_WIDTH / 2 + (Math.random() - 0.5) * 4
  const startY = BOARD_PADDING_TOP - 25
  points.push({ x: startX, y: startY })

  // Track ball position by "column offset from left" using a half-step grid.
  // In the widest row, pegs are at positions 0, 1, 2, ..., (W-1).
  // In the narrow row, pegs are at positions 0.5, 1.5, ..., (W-1.5).
  // We track the ball's position in terms of "widest row column".
  // Ball starts directly above the center peg of row 0.
  const wideCount = getRowPegCount(0, totalRows)
  let ballPos = (wideCount - 1) / 2 // center position

  for (let row = 0; row < totalRows; row++) {
    const isWide = row % 2 === 0
    const pegsInRow = getRowPegCount(row, totalRows)

    // Convert ballPos to the nearest peg in this row
    let pegCol: number
    if (isWide) {
      // Wide row: pegs at integer positions 0, 1, ..., pegsInRow-1
      pegCol = Math.round(ballPos)
    } else {
      // Narrow row: pegs at positions 0.5, 1.5, ..., pegsInRow-0.5
      // These correspond to wide positions shifted by 0.5
      pegCol = Math.round(ballPos - 0.5)
    }
    pegCol = Math.max(0, Math.min(pegsInRow - 1, pegCol))

    const peg = pegs[row][pegCol]
    const pos = pegPosition(row, pegCol, totalRows)

    // Add waypoint with slight randomness for natural look
    const jitterX = (Math.random() - 0.5) * 4
    const jitterY = (Math.random() - 0.5) * 2
    points.push({
      x: pos.x + jitterX,
      y: pos.y + PEG_RADIUS + 2 + jitterY,
    })

    // Determine actual position of this peg in the wide-row coordinate system
    const pegPosInWide = isWide ? pegCol : pegCol + 0.5

    // Ball goes left or right
    const goLeft = Math.random() < peg.leftProb
    if (goLeft) {
      ballPos = pegPosInWide - 0.5
    } else {
      ballPos = pegPosInWide + 0.5
    }
  }

  // After the last row, ballPos is in wide-row coords.
  // Map to bin index. Bins go from -0.5 to wideCount-0.5 in wide coords.
  // Bin 0 = below left of peg 0, Bin 1 = between peg 0 and peg 1, etc.
  let binIndex = Math.round(ballPos)
  binIndex = Math.max(0, Math.min(binCount - 1, binIndex))

  // Final position: center of the bin
  const binWidth = (BOARD_WIDTH - BOARD_PADDING_X * 2) / binCount
  const binCenterX = BOARD_PADDING_X + binIndex * binWidth + binWidth / 2
  const binY = BOARD_HEIGHT - BOARD_PADDING_BOTTOM + 20

  // Add a transition point between last peg and bin
  const lastPeg = points[points.length - 1]
  points.push({
    x: (lastPeg.x + binCenterX) / 2 + (Math.random() - 0.5) * 6,
    y: (lastPeg.y + binY) / 2,
  })
  points.push({ x: binCenterX, y: binY })

  return { points, binIndex }
}

// ─── Scoring ─────────────────────────────────────────────────────

/**
 * Compute match percentage between player's histogram and target distribution.
 * Uses a normalized absolute difference metric (simpler and more intuitive
 * than chi-squared for students).
 *
 * Returns 0-100.
 */
export function computeMatchPercent(bins: number[], target: number[]): number {
  const totalBalls = bins.reduce((a, b) => a + b, 0)
  if (totalBalls === 0) return 0

  // Normalize bins to probabilities
  const actual = bins.map((b) => b / totalBalls)

  // Compute sum of absolute differences
  let diffSum = 0
  for (let i = 0; i < actual.length; i++) {
    diffSum += Math.abs(actual[i] - (target[i] ?? 0))
  }

  // Max possible difference is 2 (all mass in wrong bins)
  // Convert to percentage match
  const match = Math.max(0, 100 * (1 - diffSum / 2))
  return Math.round(match * 10) / 10
}

/**
 * Compute star rating from match percentage.
 */
export function computeStars(
  matchPercent: number,
  level: LevelConfig
): 0 | 1 | 2 | 3 {
  if (matchPercent >= level.star3Threshold) return 3
  if (matchPercent >= level.star2Threshold) return 2
  if (matchPercent >= level.star1Threshold) return 1
  return 0
}

// ─── Statistics ──────────────────────────────────────────────────

export interface BinStats {
  mean: number
  stdDev: number
  total: number
  maxBin: number
  maxBinCount: number
}

export function computeStats(bins: number[]): BinStats {
  const total = bins.reduce((a, b) => a + b, 0)
  if (total === 0) {
    return { mean: 0, stdDev: 0, total: 0, maxBin: 0, maxBinCount: 0 }
  }

  // Mean bin index (weighted)
  let mean = 0
  for (let i = 0; i < bins.length; i++) {
    mean += i * bins[i]
  }
  mean /= total

  // Standard deviation
  let variance = 0
  for (let i = 0; i < bins.length; i++) {
    variance += bins[i] * Math.pow(i - mean, 2)
  }
  variance /= total
  const stdDev = Math.sqrt(variance)

  // Max bin
  let maxBinCount = 0
  let maxBin = 0
  for (let i = 0; i < bins.length; i++) {
    if (bins[i] > maxBinCount) {
      maxBinCount = bins[i]
      maxBin = i
    }
  }

  return {
    mean: Math.round(mean * 100) / 100,
    stdDev: Math.round(stdDev * 100) / 100,
    total,
    maxBin,
    maxBinCount,
  }
}

// ─── Peg color helpers ───────────────────────────────────────────

/** Get the fill color for a peg based on its probability */
export function pegColor(leftProb: number): string {
  if (Math.abs(leftProb - 0.5) < 0.02) return '#888'
  if (leftProb > 0.5) {
    // Blue for left-biased
    const intensity = (leftProb - 0.5) * 2 // 0 to 1
    const hue = 210 + intensity * 30 // 210 to 240
    const sat = 50 + intensity * 40 // 50% to 90%
    const light = 55 + intensity * 10 // 55% to 65%
    return `hsl(${hue}, ${sat}%, ${light}%)`
  } else {
    // Orange for right-biased
    const intensity = (0.5 - leftProb) * 2 // 0 to 1
    const hue = 40 - intensity * 20 // 40 to 20
    const sat = 50 + intensity * 40 // 50% to 90%
    const light = 55 + intensity * 10 // 55% to 65%
    return `hsl(${hue}, ${sat}%, ${light}%)`
  }
}
