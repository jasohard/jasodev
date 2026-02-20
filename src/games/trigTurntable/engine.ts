/**
 * Wave computation engine for Trig Turntable.
 *
 * Handles:
 * - Epicycle position computation (stacked rotating circles)
 * - Wave sampling for matching
 * - Score calculation via sampled-point comparison
 * - Equation string generation
 */

import type { CircleParams } from './types'

/** Circle colors per spec */
export const CIRCLE_COLORS = [
  '#4fc3f7', // Electric blue
  '#f06292', // Hot pink
  '#aed581', // Lime green
  '#ffd54f', // Gold
]

/**
 * Compute the tip position of the epicycle stack at a given time.
 * Each circle's center is at the tip of the previous circle.
 * Returns { x, y } of the final tip.
 */
export function computeEpicycleTip(
  circles: CircleParams[],
  time: number,
  centerX: number,
  centerY: number
): { x: number; y: number; intermediates: { cx: number; cy: number; tipX: number; tipY: number }[] } {
  let cx = centerX
  let cy = centerY
  const intermediates: { cx: number; cy: number; tipX: number; tipY: number }[] = []

  for (const circle of circles) {
    const angle = circle.frequency * time + circle.phase
    const tipX = cx + circle.amplitude * Math.cos(angle)
    const tipY = cy - circle.amplitude * Math.sin(angle) // SVG y is flipped
    intermediates.push({ cx, cy, tipX, tipY })
    cx = tipX
    cy = tipY
  }

  return { x: cx, y: cy, intermediates }
}

/**
 * Compute the Y value of the combined wave at a given time (x position).
 * This is the sum of all sine components: sum(A_i * sin(f_i * t + p_i))
 */
export function computeWaveY(circles: CircleParams[], t: number): number {
  let y = 0
  for (const circle of circles) {
    y += circle.amplitude * Math.sin(circle.frequency * t + circle.phase)
  }
  return y
}

/**
 * Sample a wave at evenly spaced points for comparison.
 * Returns an array of Y values.
 */
export function sampleWave(circles: CircleParams[], numSamples: number, period: number): number[] {
  const samples: number[] = []
  for (let i = 0; i < numSamples; i++) {
    const t = (i / numSamples) * period
    samples.push(computeWaveY(circles, t))
  }
  return samples
}

/**
 * Compute match score between player wave and target wave (0–100).
 * Uses normalized MSE: 100 * (1 - RMSE / maxPossibleRMSE).
 */
export function computeMatchScore(
  playerCircles: CircleParams[],
  targetCircles: CircleParams[],
  numSamples: number = 200
): number {
  // Sample over 2 full periods for better accuracy
  const period = 2 * Math.PI * 2
  const playerSamples = sampleWave(playerCircles, numSamples, period)
  const targetSamples = sampleWave(targetCircles, numSamples, period)

  // Compute max amplitude for normalization
  let maxAmp = 0
  for (const c of targetCircles) maxAmp += Math.abs(c.amplitude)
  if (maxAmp === 0) maxAmp = 1

  // Compute RMSE
  let sumSquaredError = 0
  for (let i = 0; i < numSamples; i++) {
    const diff = playerSamples[i] - targetSamples[i]
    sumSquaredError += diff * diff
  }
  const rmse = Math.sqrt(sumSquaredError / numSamples)

  // Normalize: score is 100 when RMSE is 0, drops toward 0 as RMSE approaches maxAmp * 2
  const normalizedRmse = rmse / (maxAmp * 2)
  const score = Math.max(0, Math.min(100, (1 - normalizedRmse) * 100))

  return Math.round(score * 10) / 10
}

/**
 * Calculate stars based on match score and level thresholds.
 */
export function calculateStars(
  score: number,
  thresholds: [number, number, number]
): number {
  if (score >= thresholds[2]) return 3
  if (score >= thresholds[1]) return 2
  if (score >= thresholds[0]) return 1
  return 0
}

/**
 * Generate the equation string for the current circles.
 * e.g., "y = 1.5·sin(2x + π/4) + 0.8·sin(3x)"
 */
export function generateEquation(circles: CircleParams[]): string {
  if (circles.length === 0) return 'y = 0'

  const terms = circles.map((c) => {
    const amp = Math.abs(c.amplitude) < 0.01 ? '0' : formatNum(c.amplitude)
    const freq = formatNum(c.frequency)
    const phase = formatPhase(c.phase)

    let inner = ''
    if (freq === '1') {
      inner = phase ? `x ${phase}` : 'x'
    } else {
      inner = phase ? `${freq}x ${phase}` : `${freq}x`
    }

    if (amp === '1') return `sin(${inner})`
    if (amp === '0') return null
    return `${amp}·sin(${inner})`
  }).filter(Boolean)

  if (terms.length === 0) return 'y = 0'
  return `y = ${terms.join(' + ')}`
}

function formatNum(n: number): string {
  const rounded = Math.round(n * 100) / 100
  if (rounded === Math.round(rounded)) return String(Math.round(rounded))
  return rounded.toFixed(1)
}

function formatPhase(phase: number): string {
  // Normalize to [-π, π]
  let p = phase
  while (p > Math.PI) p -= 2 * Math.PI
  while (p < -Math.PI) p += 2 * Math.PI

  if (Math.abs(p) < 0.05) return ''

  // Try to express as a fraction of π
  const piRatio = p / Math.PI
  if (Math.abs(piRatio - 0.5) < 0.05) return '+ π/2'
  if (Math.abs(piRatio + 0.5) < 0.05) return '- π/2'
  if (Math.abs(piRatio - 0.25) < 0.05) return '+ π/4'
  if (Math.abs(piRatio + 0.25) < 0.05) return '- π/4'
  if (Math.abs(piRatio - 1) < 0.05) return '+ π'
  if (Math.abs(piRatio + 1) < 0.05) return '- π'
  if (Math.abs(piRatio - 0.333) < 0.05) return '+ π/3'
  if (Math.abs(piRatio + 0.333) < 0.05) return '- π/3'

  // Fallback to decimal
  const sign = p > 0 ? '+' : '-'
  return `${sign} ${formatNum(Math.abs(p))}`
}

/**
 * Create a default circle with the given index.
 */
export function createDefaultCircle(index: number): CircleParams {
  return {
    id: `circle-${Date.now()}-${index}`,
    amplitude: 1,
    frequency: index + 1,
    phase: 0,
    color: CIRCLE_COLORS[index % CIRCLE_COLORS.length],
  }
}
