import type { LevelConfig } from './types'
import { CIRCLE_COLORS } from './engine'

export const LEVELS: LevelConfig[] = [
  // ── Level 1: Meet the Sine Wave (Tutorial) ─────────────
  {
    id: 1,
    name: 'Meet the Sine Wave',
    subtitle: 'Discover what amplitude means',
    targetCircles: [
      { id: 'target-1', amplitude: 1.5, frequency: 1, phase: 0, color: CIRCLE_COLORS[0] },
    ],
    initialCircleCount: 1,
    maxCircles: 1,
    lockedParams: ['frequency', 'phase'],
    starThresholds: [60, 80, 95],
    hint: 'Drag the dot on the circle rim to change the amplitude (radius). Match the white ghost wave!',
    artMode: false,
  },

  // ── Level 2: Speed It Up ───────────────────────────────
  {
    id: 2,
    name: 'Speed It Up',
    subtitle: 'Learn about frequency',
    targetCircles: [
      { id: 'target-1', amplitude: 1.2, frequency: 2, phase: 0, color: CIRCLE_COLORS[0] },
    ],
    initialCircleCount: 1,
    maxCircles: 1,
    lockedParams: ['phase'],
    starThresholds: [60, 80, 95],
    hint: 'Use the frequency slider to make the circle spin faster or slower. Higher frequency = more wave cycles.',
    artMode: false,
  },

  // ── Level 3: Shift It ──────────────────────────────────
  {
    id: 3,
    name: 'Shift It',
    subtitle: "Phase shifts the wave's start",
    targetCircles: [
      { id: 'target-1', amplitude: 1.3, frequency: 1, phase: Math.PI / 3, color: CIRCLE_COLORS[0] },
    ],
    initialCircleCount: 1,
    maxCircles: 1,
    lockedParams: [],
    starThresholds: [60, 80, 95],
    hint: 'Drag the dot around the circle to change the starting angle (phase). Match all three parameters!',
    artMode: false,
  },

  // ── Level 4: Wave Cocktail (NEW — Observation Level) ───
  {
    id: 4,
    name: 'Wave Cocktail',
    subtitle: 'Watch two waves become one',
    targetCircles: [
      { id: 'target-1', amplitude: 1.0, frequency: 1, phase: 0, color: CIRCLE_COLORS[0] },
      { id: 'target-2', amplitude: 0.5, frequency: 3, phase: 0, color: CIRCLE_COLORS[1] },
    ],
    initialCircleCount: 2,
    maxCircles: 2,
    lockedParams: ['amplitude', 'frequency', 'phase'],
    starThresholds: [0, 0, 0],
    hint: 'Watch how two waves combine! The bright wave is the SUM of the blue and pink waves at every point.',
    artMode: false,
    observationMode: true,
  },

  // ── Level 5: Wobble Match (NEW — One Circle Locked) ────
  {
    id: 5,
    name: 'Wobble Match',
    subtitle: 'One circle is set — match the other',
    targetCircles: [
      { id: 'target-1', amplitude: 1.2, frequency: 1, phase: Math.PI / 4, color: CIRCLE_COLORS[0] },
      { id: 'target-2', amplitude: 0.6, frequency: 2, phase: 0, color: CIRCLE_COLORS[1] },
    ],
    initialCircleCount: 2,
    maxCircles: 2,
    lockedParams: [],
    starThresholds: [60, 80, 95],
    hint: 'Circle 2 (pink) is already perfect! Just adjust circle 1 (blue) — tweak its amplitude and phase to match the target.',
    artMode: false,
    lockedCircleIndices: [1],
  },

  // ── Level 6: Build the Wobble (NEW — Guided) ──────────
  {
    id: 6,
    name: 'Build the Wobble',
    subtitle: 'This wave needs TWO circles',
    targetCircles: [
      { id: 'target-1', amplitude: 1.3, frequency: 1, phase: 0, color: CIRCLE_COLORS[0] },
      { id: 'target-2', amplitude: 0.4, frequency: 4, phase: 0, color: CIRCLE_COLORS[1] },
    ],
    initialCircleCount: 1,
    maxCircles: 2,
    lockedParams: [],
    starThresholds: [55, 75, 90],
    hint: "This wave is bumpy — one circle can't make those bumps! Tap + to add a second circle.",
    artMode: false,
    secondaryHint: 'Nice! Circle 2 controls the small ripples. Try amplitude \u2248 0.4, frequency \u2248 4. Then fine-tune circle 1 for the big shape.',
  },

  // ── Level 7: Two Circles (formerly Level 4) ────────────
  {
    id: 7,
    name: 'Two Circles',
    subtitle: 'The full challenge',
    targetCircles: [
      { id: 'target-1', amplitude: 1.0, frequency: 1, phase: 0, color: CIRCLE_COLORS[0] },
      { id: 'target-2', amplitude: 0.5, frequency: 3, phase: Math.PI / 6, color: CIRCLE_COLORS[1] },
    ],
    initialCircleCount: 1,
    maxCircles: 4,
    lockedParams: [],
    starThresholds: [60, 80, 92],
    hint: 'Combine two waves to match the target. Look for the big shape (circle 1) and the small ripples (circle 2).',
    artMode: false,
  },

  // ── Level 8: Make a Square Wave (formerly Level 5) ─────
  {
    id: 8,
    name: 'Make a Square Wave',
    subtitle: 'Fourier series in action!',
    targetCircles: [
      // Square wave approximation: sum of odd harmonics
      // 4/π * [sin(x) + sin(3x)/3 + sin(5x)/5 + sin(7x)/7]
      { id: 'target-1', amplitude: 4 / Math.PI * 1, frequency: 1, phase: 0, color: CIRCLE_COLORS[0] },
      { id: 'target-2', amplitude: 4 / Math.PI * (1 / 3), frequency: 3, phase: 0, color: CIRCLE_COLORS[1] },
      { id: 'target-3', amplitude: 4 / Math.PI * (1 / 5), frequency: 5, phase: 0, color: CIRCLE_COLORS[2] },
      { id: 'target-4', amplitude: 4 / Math.PI * (1 / 7), frequency: 7, phase: 0, color: CIRCLE_COLORS[3] },
    ],
    initialCircleCount: 1,
    maxCircles: 4,
    lockedParams: [],
    starThresholds: [50, 65, 80],
    hint: 'A square wave is made of odd harmonics (1, 3, 5, 7...) with decreasing amplitude. This is Fourier series!',
    artMode: false,
  },

  // ── Level 9: Art Mode (formerly Level 6) ───────────────
  {
    id: 9,
    name: 'Art Mode',
    subtitle: 'No score, just beauty',
    targetCircles: [],
    initialCircleCount: 1,
    maxCircles: 4,
    lockedParams: [],
    starThresholds: [0, 0, 0],
    hint: 'Free creation! Add circles, adjust parameters, and create beautiful wave patterns. No scoring — just explore.',
    artMode: true,
  },
]
