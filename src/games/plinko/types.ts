/** Types for Probability Plinko game */

export interface Peg {
  /** Row index (0-based from top) */
  row: number
  /** Column index within the row */
  col: number
  /** Probability of going LEFT (0-1). Right = 1 - leftProb */
  leftProb: number
  /** Whether this peg's probability can be adjusted */
  locked: boolean
}

export interface PegPosition {
  x: number
  y: number
}

export interface BallPath {
  /** Sequence of (x, y) positions the ball visits, from drop to bin */
  points: { x: number; y: number }[]
  /** Which bin the ball lands in (0-based) */
  binIndex: number
}

export interface LevelConfig {
  id: number
  name: string
  subtitle: string
  /** Number of peg rows */
  rows: number
  /** Target distribution (normalized probabilities for each bin) */
  targetDistribution: number[]
  /** Minimum match % to earn 1 star */
  star1Threshold: number
  /** Minimum match % to earn 2 stars */
  star2Threshold: number
  /** Minimum match % to earn 3 stars */
  star3Threshold: number
  /** If true, all pegs are locked (tutorial) */
  allLocked: boolean
  /** Initial left-probability for all pegs (default 0.5) */
  initialProb: number
  /** Whether this is the tutorial level (auto-win) */
  isTutorial: boolean
  /** Hint text shown at level start */
  hint: string
}

export interface GameState {
  /** Current level config */
  level: LevelConfig
  /** 2D array of pegs [row][col] */
  pegs: Peg[][]
  /** Histogram bin counts */
  bins: number[]
  /** Total balls dropped so far */
  totalBalls: number
  /** Currently selected peg (for adjustment), or null */
  selectedPeg: { row: number; col: number } | null
  /** Current match percentage (0-100) */
  matchPercent: number
  /** Stars earned (0-3) */
  stars: number
  /** Balls currently animating */
  activeBalls: ActiveBall[]
  /** Animation speed multiplier */
  speed: 1 | 3 | 10
  /** How many balls to drop at once */
  dropCount: 1 | 10 | 50
  /** Whether the game is currently dropping balls */
  isDropping: boolean
}

export interface ActiveBall {
  id: number
  path: BallPath
  /** Current animation progress (0 = start, 1 = in bin) */
  progress: number
  /** Color hue for this ball */
  hue: number
}
