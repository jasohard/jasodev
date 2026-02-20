import type { LevelConfig } from './types'

/**
 * Level definitions for Proof Pinball.
 *
 * All coordinates are in SVG viewBox space (0,0 to 400,600).
 * The game viewport is designed mobile-first at this aspect ratio.
 */

// Helper to create a rectangular room
function rectRoom(
  x: number,
  y: number,
  w: number,
  h: number,
  prefix: string
): LevelConfig['walls'] {
  return [
    { id: `${prefix}-top`, start: { x, y }, end: { x: x + w, y } },
    { id: `${prefix}-right`, start: { x: x + w, y }, end: { x: x + w, y: y + h } },
    { id: `${prefix}-bottom`, start: { x: x + w, y: y + h }, end: { x, y: y + h } },
    { id: `${prefix}-left`, start: { x, y: y + h }, end: { x, y } },
  ]
}

export const LEVELS: LevelConfig[] = [
  // ── Level 1: Straight Shot (Tutorial) ──────────────────
  {
    id: 1,
    name: 'Straight Shot',
    subtitle: 'Learn to aim and fire',
    walls: rectRoom(40, 80, 320, 440, 'room'),
    targets: [
      { id: 't1', center: { x: 320, y: 300 }, radius: 24, hit: false },
    ],
    reflectors: [],
    launchPoint: { x: 80, y: 300 },
    maxShots: 5,
    parShots: 1,
    predictionBounces: 3,
    hint: 'Drag around the ball to aim, then release to fire. Hit the gold target!',
    maxBounces: 15,
  },

  // ── Level 2: First Bounce ──────────────────────────────
  {
    id: 2,
    name: 'First Bounce',
    subtitle: 'Angle in = angle out',
    walls: rectRoom(40, 80, 320, 440, 'room'),
    targets: [
      { id: 't1', center: { x: 300, y: 140 }, radius: 24, hit: false },
    ],
    reflectors: [],
    launchPoint: { x: 80, y: 460 },
    maxShots: 5,
    parShots: 1,
    predictionBounces: 2,
    hint: 'The target is above you. Bounce off the right wall to reach it! Watch the angle display.',
    maxBounces: 15,
  },

  // ── Level 3: Corner Pocket ─────────────────────────────
  {
    id: 3,
    name: 'Corner Pocket',
    subtitle: 'Bank shot to the corner',
    walls: rectRoom(40, 80, 320, 440, 'room'),
    targets: [
      { id: 't1', center: { x: 325, y: 115 }, radius: 22, hit: false },
    ],
    reflectors: [],
    launchPoint: { x: 80, y: 480 },
    maxShots: 4,
    parShots: 1,
    predictionBounces: 1,
    hint: 'Reach the far corner with a single bank shot. Multiple bounce paths work too!',
    maxBounces: 15,
  },

  // ── Level 4: Triangle Room ─────────────────────────────
  {
    id: 4,
    name: 'Triangle Room',
    subtitle: '60-degree angles everywhere',
    walls: [
      // Equilateral triangle (approximately)
      { id: 'tri-bottom', start: { x: 60, y: 460 }, end: { x: 340, y: 460 } },
      { id: 'tri-right', start: { x: 340, y: 460 }, end: { x: 200, y: 120 } },
      { id: 'tri-left', start: { x: 200, y: 120 }, end: { x: 60, y: 460 } },
    ],
    targets: [
      { id: 't1', center: { x: 310, y: 400 }, radius: 20, hit: false },
    ],
    reflectors: [],
    launchPoint: { x: 100, y: 430 },
    maxShots: 5,
    parShots: 1,
    predictionBounces: 1,
    hint: 'Inside a triangle, 60-degree walls create interesting bounce patterns.',
    maxBounces: 15,
  },

  // ── Level 5: Two Targets ───────────────────────────────
  {
    id: 5,
    name: 'Two Targets',
    subtitle: 'Hit both in one shot',
    walls: rectRoom(40, 80, 320, 440, 'room'),
    targets: [
      { id: 't1', center: { x: 300, y: 200 }, radius: 22, hit: false },
      { id: 't2', center: { x: 140, y: 140 }, radius: 22, hit: false },
    ],
    reflectors: [],
    launchPoint: { x: 80, y: 460 },
    maxShots: 3,
    parShots: 1,
    predictionBounces: 1,
    hint: 'Plan your angle so the ball passes through both targets on a single multi-bounce path.',
    maxBounces: 20,
  },

  // ── Level 6: Mirror Master ─────────────────────────────
  {
    id: 6,
    name: 'Mirror Master',
    subtitle: 'Place and aim',
    walls: [
      // L-shaped room
      { id: 'w-top', start: { x: 40, y: 80 }, end: { x: 240, y: 80 } },
      { id: 'w-right-upper', start: { x: 240, y: 80 }, end: { x: 240, y: 280 } },
      { id: 'w-inner-h', start: { x: 240, y: 280 }, end: { x: 360, y: 280 } },
      { id: 'w-right-lower', start: { x: 360, y: 280 }, end: { x: 360, y: 520 } },
      { id: 'w-bottom', start: { x: 360, y: 520 }, end: { x: 40, y: 520 } },
      { id: 'w-left', start: { x: 40, y: 520 }, end: { x: 40, y: 80 } },
    ],
    targets: [
      { id: 't1', center: { x: 310, y: 460 }, radius: 22, hit: false },
    ],
    reflectors: [
      { id: 'ref1', center: { x: 200, y: 340 }, angle: 45, halfLength: 40 },
    ],
    launchPoint: { x: 80, y: 160 },
    maxShots: 4,
    parShots: 1,
    predictionBounces: 1,
    hint: 'Tap the blue reflector to select it, then drag to rotate. Aim the ball to bounce off it!',
    maxBounces: 20,
  },

  // ── Level 7: The Pentagon ──────────────────────────────
  {
    id: 7,
    name: 'The Pentagon',
    subtitle: 'Three targets, five walls',
    walls: (() => {
      // Regular pentagon centered at (200, 300), radius 160
      const cx = 200, cy = 300, r = 160
      const verts = []
      for (let i = 0; i < 5; i++) {
        const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2
        verts.push({ x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) })
      }
      const walls: LevelConfig['walls'] = []
      for (let i = 0; i < 5; i++) {
        walls.push({
          id: `pent-${i}`,
          start: verts[i],
          end: verts[(i + 1) % 5],
        })
      }
      return walls
    })(),
    targets: [
      { id: 't1', center: { x: 265, y: 190 }, radius: 18, hit: false },
      { id: 't2', center: { x: 310, y: 380 }, radius: 18, hit: false },
      { id: 't3', center: { x: 90, y: 380 }, radius: 18, hit: false },
    ],
    reflectors: [
      { id: 'ref1', center: { x: 200, y: 300 }, angle: 0, halfLength: 35 },
    ],
    launchPoint: { x: 140, y: 190 },
    maxShots: 3,
    parShots: 2,
    predictionBounces: 0,
    hint: 'No prediction line! Reason about angles to hit all three targets. Use the reflector wisely.',
    maxBounces: 20,
  },
]
