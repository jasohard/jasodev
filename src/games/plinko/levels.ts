import type { LevelConfig } from './types'
import { getBinCount } from './engine'

/**
 * Generate a binomial distribution for the given number of bins
 * (approximating C(n,k) * 0.5^n where n = bins - 1).
 */
function binomialDistribution(numBins: number): number[] {
  const n = numBins - 1
  const dist: number[] = []
  let total = 0

  for (let k = 0; k < numBins; k++) {
    const val = comb(n, k) * Math.pow(0.5, n)
    dist.push(val)
    total += val
  }

  return dist.map((v) => v / total)
}

/** Compute n choose k */
function comb(n: number, k: number): number {
  if (k > n) return 0
  if (k === 0 || k === n) return 1
  let result = 1
  for (let i = 0; i < Math.min(k, n - k); i++) {
    result = (result * (n - i)) / (i + 1)
  }
  return result
}

/**
 * Generate a left-skewed distribution (most balls land in left bins).
 */
function leftSkewedDistribution(numBins: number): number[] {
  const dist: number[] = []
  let total = 0
  for (let i = 0; i < numBins; i++) {
    const val = Math.pow(numBins - i, 2.5)
    dist.push(val)
    total += val
  }
  return dist.map((v) => v / total)
}

/**
 * Generate a uniform distribution.
 */
function uniformDistribution(numBins: number): number[] {
  const val = 1 / numBins
  return Array(numBins).fill(val) as number[]
}

/**
 * Generate a bimodal distribution (two peaks).
 */
function bimodalDistribution(numBins: number): number[] {
  const dist: number[] = []
  let total = 0
  const center = (numBins - 1) / 2
  const peak1 = Math.floor(center * 0.3)
  const peak2 = Math.ceil(center + center * 0.7)

  for (let i = 0; i < numBins; i++) {
    const d1 = Math.exp(-Math.pow(i - peak1, 2) / 1.5)
    const d2 = Math.exp(-Math.pow(i - peak2, 2) / 1.5)
    const val = d1 + d2
    dist.push(val)
    total += val
  }
  return dist.map((v) => v / total)
}

/**
 * Generate a right-heavy distribution (most balls in rightmost bins).
 */
function rightHeavyDistribution(numBins: number): number[] {
  const dist: number[] = []
  let total = 0
  for (let i = 0; i < numBins; i++) {
    const val = Math.pow(i + 1, 3)
    dist.push(val)
    total += val
  }
  return dist.map((v) => v / total)
}

/**
 * Generate a sharp center peak distribution.
 */
function sharpPeakDistribution(numBins: number): number[] {
  const dist: number[] = []
  let total = 0
  const center = (numBins - 1) / 2
  for (let i = 0; i < numBins; i++) {
    const val = Math.exp(-Math.pow(i - center, 2) / 0.8)
    dist.push(val)
    total += val
  }
  return dist.map((v) => v / total)
}

/**
 * Level definitions. Each target distribution is generated using the
 * correct bin count from the engine (based on row count).
 */
export const LEVELS: LevelConfig[] = [
  {
    id: 1,
    name: 'Bell Curve Basics',
    subtitle: 'Watch the magic of 50/50 odds',
    rows: 3,
    targetDistribution: binomialDistribution(getBinCount(3)),
    star1Threshold: 30,
    star2Threshold: 50,
    star3Threshold: 70,
    allLocked: true,
    initialProb: 0.5,
    isTutorial: true,
    hint: 'Just drop balls and watch! All pegs are 50/50 — see how a bell curve appears naturally.',
  },
  {
    id: 2,
    name: 'Lean Left',
    subtitle: 'Skew the distribution leftward',
    rows: 4,
    targetDistribution: leftSkewedDistribution(getBinCount(4)),
    star1Threshold: 60,
    star2Threshold: 75,
    star3Threshold: 90,
    allLocked: false,
    initialProb: 0.5,
    isTutorial: false,
    hint: 'Tap pegs to increase their left probability. Top pegs have the biggest effect!',
  },
  {
    id: 3,
    name: 'Uniform Distribution',
    subtitle: 'Make every bin equally likely',
    rows: 5,
    targetDistribution: uniformDistribution(getBinCount(5)),
    star1Threshold: 60,
    star2Threshold: 75,
    star3Threshold: 88,
    allLocked: false,
    initialProb: 0.5,
    isTutorial: false,
    hint: 'Equal bins are surprisingly hard! Try biasing edge pegs outward.',
  },
  {
    id: 4,
    name: 'Bimodal',
    subtitle: 'Create two peaks',
    rows: 5,
    targetDistribution: bimodalDistribution(getBinCount(5)),
    star1Threshold: 55,
    star2Threshold: 70,
    star3Threshold: 85,
    allLocked: false,
    initialProb: 0.5,
    isTutorial: false,
    hint: 'Split the stream! Middle pegs need extreme bias to create two humps.',
  },
  {
    id: 5,
    name: 'Right Pile',
    subtitle: 'Stack everything to the right',
    rows: 6,
    targetDistribution: rightHeavyDistribution(getBinCount(6)),
    star1Threshold: 60,
    star2Threshold: 75,
    star3Threshold: 90,
    allLocked: false,
    initialProb: 0.5,
    isTutorial: false,
    hint: 'Bias pegs rightward — but how much? The top rows matter most.',
  },
  {
    id: 6,
    name: 'Sharp Peak',
    subtitle: 'Concentrate balls in the center',
    rows: 7,
    targetDistribution: sharpPeakDistribution(getBinCount(7)),
    star1Threshold: 55,
    star2Threshold: 70,
    star3Threshold: 85,
    allLocked: false,
    initialProb: 0.5,
    isTutorial: false,
    hint: 'A sharp peak needs strategic balancing. Not all 50/50 pegs are equal!',
  },
]
