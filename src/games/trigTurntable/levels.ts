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
    subtitle: 'Phase shifts the wave\'s start',
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

  // ── Level 4: Two Circles ───────────────────────────────
  {
    id: 4,
    name: 'Two Circles',
    subtitle: 'The sum of two waves',
    targetCircles: [
      { id: 'target-1', amplitude: 1.0, frequency: 1, phase: 0, color: CIRCLE_COLORS[0] },
      { id: 'target-2', amplitude: 0.5, frequency: 3, phase: 0, color: CIRCLE_COLORS[1] },
    ],
    initialCircleCount: 1,
    maxCircles: 4,
    lockedParams: [],
    starThresholds: [60, 80, 92],
    hint: 'Tap the + button to add a second circle. The compound wave is the SUM of each circle\'s wave!',
    artMode: false,
  },

  // ── Level 5: Make a Square Wave ────────────────────────
  {
    id: 5,
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

  // ── Level 6: Art Mode ──────────────────────────────────
  {
    id: 6,
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
