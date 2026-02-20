/**
 * Plinko game engine — handles board layout, ball path computation,
 * histogram scoring, and all game logic.
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

/** Compute the (x, y) center of a peg given its row/col and total row count */
export function pegPosition(row: number, col: number, totalRows: number): PegPosition {
  const pegsInRow = row % 2 === 0 ? Math.ceil((totalRows + 1) / 2) + (totalRows % 2 === 0 ? 1 : 0) : Math.floor((totalRows + 1) / 2) + (totalRows % 2 === 0 ? 0 : 0)

  // Simpler: for a triangular Plinko layout
  // Even rows have (totalRows/2 + 1) pegs, odd rows have (totalRows/2) pegs
  // But the spec says alternating rows: 5 pegs, 4 pegs, 5 pegs, 4 pegs...
  // Let's use a simpler approach: first row has N pegs, second has N-1, alternating
  const maxPegsInRow = getRowPegCount(row, totalRows)
  const maxPegsAnyRow = getRowPegCount(0, totalRows)

  const usableWidth = BOARD_WIDTH - BOARD_PADDING_X * 2
  const usableHeight = BOARD_HEIGHT - BOARD_PADDING_TOP - BOARD_PADDING_BOTTOM

  // Spacing between pegs in widest row
  const hSpacing = usableWidth / (maxPegsAnyRow - 1 || 1)
  const vSpacing = usableHeight / (totalRows - 1 || 1)

  // Offset for rows with fewer pegs (centered)
  const rowOffset = ((maxPegsAnyRow - maxPegsInRow) * hSpacing) / 2

  return {
    x: BOARD_PADDING_X + rowOffset + col * hSpacing,
    y: BOARD_PADDING_TOP + row * vSpacing,
  }
}

/** Get number of pegs in a given row. Even rows wider, odd rows narrower. */
export function getRowPegCount(row: number, totalRows: number): number {
  // Use a simple pattern: base count derived from total rows
  // For 3 rows: 3, 2, 3 → bins = 4
  // For 4 rows: 4, 3, 4, 3 → bins = 5
  // For 5 rows: 4, 3, 4, 3, 4 → bins = 5
  // For 6 rows: 5, 4, 5, 4, 5, 4 → bins = 6
  // For 7 rows: 5, 4, 5, 4, 5, 4, 5 → bins = 6
  const widePegs = Math.ceil(totalRows / 2) + 1
  const narrowPegs = widePegs - 1
  return row % 2 === 0 ? widePegs : narrowPegs
}

/** Get the number of bins for a given row count */
export function getBinCount(totalRows: number): number {
  return getRowPegCount(0, totalRows) + 1
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
 * Pre-compute a ball's path from top to bottom.
 * At each peg, the ball goes left or right based on that peg's probability.
 * Returns the path as a series of points and the final bin index.
 */
export function computeBallPath(pegs: Peg[][], totalRows: number): BallPath {
  const points: { x: number; y: number }[] = []
  const binCount = getBinCount(totalRows)

  // Start position: top-center with slight randomness
  const startX = BOARD_WIDTH / 2 + (Math.random() - 0.5) * 4
  const startY = BOARD_PADDING_TOP - 30
  points.push({ x: startX, y: startY })

  // Track the ball's horizontal position conceptually
  // We use a "slot" system: the ball starts in the center and drifts left/right
  let currentSlot = 0 // represents cumulative drift: negative = left, positive = right

  for (let row = 0; row < totalRows; row++) {
    const pegCount = getRowPegCount(row, totalRows)

    // Determine which peg the ball interacts with
    // For even rows (wide): peg index = center + drift
    // For odd rows (narrow): peg index = center + drift (adjusted)
    let pegCol: number

    if (row === 0) {
      // First row: ball hits the center peg
      pegCol = Math.floor(pegCount / 2)
    } else {
      // Subsequent rows: based on accumulated drift
      const prevRowWide = (row - 1) % 2 === 0
      const thisRowWide = row % 2 === 0

      if (prevRowWide && !thisRowWide) {
        // Going from wide to narrow: col stays same or adjusts
        pegCol = Math.floor(pegCount / 2) + currentSlot
      } else if (!prevRowWide && thisRowWide) {
        // Going from narrow to wide
        pegCol = Math.floor(pegCount / 2) + currentSlot
      } else {
        pegCol = Math.floor(pegCount / 2) + currentSlot
      }
    }

    // Clamp to valid range
    pegCol = Math.max(0, Math.min(pegCount - 1, pegCol))

    const peg = pegs[row][pegCol]
    const pos = pegPosition(row, pegCol, totalRows)

    // Add point at peg (with slight offset for visual interest)
    points.push({
      x: pos.x + (Math.random() - 0.5) * 3,
      y: pos.y + PEG_RADIUS + 2,
    })

    // Decide left or right
    const goLeft = Math.random() < peg.leftProb
    if (goLeft) {
      currentSlot--
    } else {
      currentSlot++
    }
  }

  // Calculate bin index from final drift
  const centerBin = Math.floor(binCount / 2)
  let binIndex = centerBin + currentSlot
  binIndex = Math.max(0, Math.min(binCount - 1, binIndex))

  // Final position: center of the bin
  const binWidth = (BOARD_WIDTH - BOARD_PADDING_X * 2) / binCount
  const binCenterX = BOARD_PADDING_X + binIndex * binWidth + binWidth / 2
  const binY = BOARD_HEIGHT - BOARD_PADDING_BOTTOM + 20

  points.push({ x: binCenterX, y: binY })

  return { points, binIndex }
}

// ─── Scoring ─────────────────────────────────────────────────────

/**
 * Compute match percentage between player's histogram and target distribution.
 * Uses a normalized absolute difference metric (more intuitive than chi-squared
 * for students).
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
