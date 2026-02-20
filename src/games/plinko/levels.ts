/**
 * Level definitions for Physics Plinko.
 *
 * Each level has fixed pegs (gray, immovable) and moveable pegs (cyan, draggable).
 * The player arranges moveable pegs to match a target distribution.
 *
 * Board coordinates: 400 wide x 600 tall
 * Peg zone: x ~35-365, y ~60-490
 * Bins at y ~510
 */
import type { LevelConfig } from './types'

// Helper: generate a standard Galton-like peg layout
function galtonPegs(
  rows: number,
  startY: number,
  spacingY: number,
  spacingX: number,
  centerX: number
): Array<{ x: number; y: number }> {
  const pegs: Array<{ x: number; y: number }> = []
  for (let r = 0; r < rows; r++) {
    const count = r + 1
    const y = startY + r * spacingY
    const rowWidth = (count - 1) * spacingX
    const startX = centerX - rowWidth / 2
    for (let c = 0; c < count; c++) {
      pegs.push({ x: startX + c * spacingX, y })
    }
  }
  return pegs
}

// Helper: normalize an array to sum to 1
function normalize(arr: number[]): number[] {
  const total = arr.reduce((a, b) => a + b, 0)
  if (total === 0) return arr.map(() => 1 / arr.length)
  return arr.map((v) => v / total)
}

// Helper: bell curve distribution
function bellCurve(bins: number): number[] {
  const center = (bins - 1) / 2
  const sigma = bins / 4
  return normalize(
    Array.from({ length: bins }, (_, i) =>
      Math.exp(-Math.pow(i - center, 2) / (2 * sigma * sigma))
    )
  )
}

// Helper: left-skewed
function leftSkewed(bins: number): number[] {
  return normalize(
    Array.from({ length: bins }, (_, i) => Math.pow(bins - i, 2.5))
  )
}

// Helper: bimodal
function bimodal(bins: number): number[] {
  const center = (bins - 1) / 2
  const p1 = Math.floor(center * 0.25)
  const p2 = Math.ceil(center + center * 0.75)
  return normalize(
    Array.from({ length: bins }, (_, i) => {
      const d1 = Math.exp(-Math.pow(i - p1, 2) / 1.2)
      const d2 = Math.exp(-Math.pow(i - p2, 2) / 1.2)
      return d1 + d2
    })
  )
}

// Helper: sharp center peak
function sharpPeak(bins: number, center?: number): number[] {
  const c = center ?? Math.floor(bins / 2)
  return normalize(
    Array.from({ length: bins }, (_, i) =>
      Math.exp(-Math.pow(i - c, 2) / 0.6)
    )
  )
}

// Helper: uniform
function uniform(bins: number): number[] {
  return Array(bins).fill(1 / bins) as number[]
}

// Helper: right-heavy
function rightHeavy(bins: number): number[] {
  return normalize(
    Array.from({ length: bins }, (_, i) => Math.pow(i + 1, 2.5))
  )
}

export const LEVELS: LevelConfig[] = [
  // ─── Level 1: The Basics ──────────────────────────────────────
  {
    id: 1,
    name: 'The Basics',
    subtitle: 'Learn to move pegs and drop balls',
    fixedPegs: galtonPegs(5, 100, 70, 55, 200),
    moveablePegs: [
      { x: 120, y: 200 },
      { x: 280, y: 200 },
      { x: 200, y: 350 },
    ],
    binCount: 7,
    targetDistribution: bellCurve(7),
    minBallsForScore: 50,
    star1: 60,
    star2: 78,
    star3: 90,
    hint: 'Drag the cyan pegs to guide balls into a bell curve. Tap DROP to release balls!',
  },

  // ─── Level 2: Lean Left ───────────────────────────────────────
  {
    id: 2,
    name: 'Lean Left',
    subtitle: 'Funnel balls to the left side',
    fixedPegs: [
      // Sparse fixed pegs on right side
      { x: 300, y: 120 },
      { x: 340, y: 200 },
      { x: 320, y: 280 },
      { x: 350, y: 360 },
      { x: 300, y: 440 },
      // A few center pegs
      { x: 200, y: 100 },
      { x: 200, y: 300 },
    ],
    moveablePegs: [
      { x: 150, y: 150 },
      { x: 100, y: 250 },
      { x: 160, y: 350 },
      { x: 130, y: 450 },
    ],
    binCount: 7,
    targetDistribution: leftSkewed(7),
    minBallsForScore: 50,
    star1: 58,
    star2: 74,
    star3: 88,
    hint: 'Arrange moveable pegs to deflect balls leftward. Use them as a funnel!',
  },

  // ─── Level 3: Split the Stream ────────────────────────────────
  {
    id: 3,
    name: 'Split the Stream',
    subtitle: 'Create two peaks — bimodal!',
    fixedPegs: [
      // Top row - central divider
      { x: 200, y: 90 },
      // Supporting pegs
      { x: 120, y: 160 },
      { x: 280, y: 160 },
      { x: 80, y: 300 },
      { x: 320, y: 300 },
      { x: 100, y: 430 },
      { x: 300, y: 430 },
    ],
    moveablePegs: [
      { x: 160, y: 180 },
      { x: 240, y: 180 },
      { x: 200, y: 260 },
      { x: 200, y: 380 },
    ],
    binCount: 7,
    targetDistribution: bimodal(7),
    minBallsForScore: 50,
    star1: 55,
    star2: 72,
    star3: 86,
    hint: 'Place a divider in the middle to split balls into two streams!',
  },

  // ─── Level 4: The Funnel ──────────────────────────────────────
  {
    id: 4,
    name: 'The Funnel',
    subtitle: 'Concentrate balls into one bin',
    fixedPegs: [
      // Outer walls of pegs
      { x: 60, y: 120 },
      { x: 340, y: 120 },
      { x: 50, y: 220 },
      { x: 350, y: 220 },
      { x: 60, y: 320 },
      { x: 340, y: 320 },
      { x: 70, y: 420 },
      { x: 330, y: 420 },
      // Some scatter pegs
      { x: 150, y: 100 },
      { x: 250, y: 100 },
    ],
    moveablePegs: [
      { x: 130, y: 200 },
      { x: 270, y: 200 },
      { x: 150, y: 310 },
      { x: 250, y: 310 },
      { x: 180, y: 420 },
    ],
    binCount: 7,
    targetDistribution: sharpPeak(7),
    minBallsForScore: 50,
    star1: 55,
    star2: 72,
    star3: 88,
    hint: 'Create a funnel shape that narrows toward the center bin!',
  },

  // ─── Level 5: Uniform Spread ──────────────────────────────────
  {
    id: 5,
    name: 'Uniform Spread',
    subtitle: 'Distribute balls equally across all bins',
    fixedPegs: [
      // Top center
      { x: 200, y: 90 },
      // Minimal structure
      { x: 100, y: 180 },
      { x: 300, y: 180 },
      { x: 200, y: 270 },
      { x: 100, y: 370 },
      { x: 300, y: 370 },
    ],
    moveablePegs: [
      { x: 150, y: 140 },
      { x: 250, y: 140 },
      { x: 120, y: 270 },
      { x: 280, y: 270 },
      { x: 170, y: 400 },
      { x: 230, y: 400 },
    ],
    binCount: 7,
    targetDistribution: uniform(7),
    minBallsForScore: 50,
    star1: 55,
    star2: 70,
    star3: 84,
    hint: 'The hardest challenge! Scatter pegs to spread balls evenly across all bins.',
  },

  // ─── Level 6: Zigzag ──────────────────────────────────────────
  {
    id: 6,
    name: 'Zigzag',
    subtitle: 'Alternating high-low pattern',
    fixedPegs: [
      // Zigzag guides
      { x: 140, y: 110 },
      { x: 260, y: 110 },
      { x: 80, y: 200 },
      { x: 200, y: 200 },
      { x: 320, y: 200 },
      { x: 140, y: 300 },
      { x: 260, y: 300 },
      { x: 80, y: 400 },
      { x: 200, y: 400 },
      { x: 320, y: 400 },
    ],
    moveablePegs: [
      { x: 110, y: 150 },
      { x: 200, y: 150 },
      { x: 290, y: 150 },
      { x: 110, y: 350 },
      { x: 200, y: 350 },
      { x: 290, y: 350 },
    ],
    binCount: 7,
    targetDistribution: normalize([3, 1, 3, 1, 3, 1, 3]),
    minBallsForScore: 50,
    star1: 50,
    star2: 65,
    star3: 80,
    hint: 'Create channels that alternate — skip every other bin. Creative peg placement needed!',
  },

  // ─── Level 7: The Wall ────────────────────────────────────────
  {
    id: 7,
    name: 'The Wall',
    subtitle: 'Break through the wall',
    fixedPegs: [
      // Dense wall of pegs in the middle
      { x: 70, y: 250 },
      { x: 110, y: 250 },
      { x: 150, y: 250 },
      { x: 190, y: 250 },
      { x: 230, y: 250 },
      { x: 270, y: 250 },
      { x: 310, y: 250 },
      { x: 350, y: 250 },
      // Second wall row
      { x: 90, y: 280 },
      { x: 130, y: 280 },
      { x: 170, y: 280 },
      { x: 210, y: 280 },
      { x: 250, y: 280 },
      { x: 290, y: 280 },
      { x: 330, y: 280 },
      // Top scatter
      { x: 200, y: 100 },
      { x: 130, y: 150 },
      { x: 270, y: 150 },
    ],
    moveablePegs: [
      { x: 200, y: 180 },
      { x: 150, y: 380 },
      { x: 250, y: 380 },
      { x: 200, y: 440 },
    ],
    binCount: 7,
    targetDistribution: rightHeavy(7),
    minBallsForScore: 50,
    star1: 50,
    star2: 66,
    star3: 82,
    hint: 'The wall scatters balls randomly. Use moveable pegs below it to funnel balls right!',
  },

  // ─── Level 8: Free Play ───────────────────────────────────────
  {
    id: 8,
    name: 'Free Play',
    subtitle: 'Experiment freely — no target!',
    fixedPegs: [],
    moveablePegs: [
      { x: 100, y: 120 },
      { x: 200, y: 120 },
      { x: 300, y: 120 },
      { x: 80, y: 220 },
      { x: 160, y: 220 },
      { x: 240, y: 220 },
      { x: 320, y: 220 },
      { x: 120, y: 320 },
      { x: 200, y: 320 },
      { x: 280, y: 320 },
      { x: 100, y: 420 },
      { x: 200, y: 420 },
      { x: 300, y: 420 },
    ],
    bumperPegs: [
      { x: 150, y: 170 },
      { x: 250, y: 170 },
    ],
    binCount: 7,
    targetDistribution: uniform(7),
    minBallsForScore: 0,
    star1: 200, // unreachable — no scoring in free play
    star2: 200,
    star3: 200,
    hint: 'All pegs are moveable! Experiment with different layouts and watch the physics.',
    freePlay: true,
  },
]
