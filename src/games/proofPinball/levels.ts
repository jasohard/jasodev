import type { LevelConfig } from './types'

/**
 * Level definitions for Proof Pinball.
 *
 * All coordinates are in SVG viewBox space (0,0 to 400,600).
 * The game viewport is designed mobile-first at this aspect ratio.
 *
 * DESIGN PRINCIPLE: Every level physically blocks direct shots.
 * The player MUST bounce the ball to hit targets. Walls/barriers
 * always separate the launcher from the target(s).
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
  // ── Level 1: Bank Shot ─────────────────────────────────
  // Rectangular room with a wall blocking direct path.
  // Target is behind a wall — must bounce off the right wall.
  {
    id: 1,
    name: 'Bank Shot',
    subtitle: 'Bounce off the wall to score',
    walls: [
      ...rectRoom(40, 80, 320, 440, 'room'),
      // Vertical barrier blocking direct line-of-sight
      { id: 'barrier-1', start: { x: 200, y: 80 }, end: { x: 200, y: 380 } },
    ],
    targets: [
      { id: 't1', center: { x: 310, y: 280 }, radius: 24, hit: false },
    ],
    reflectors: [],
    launchPoint: { x: 100, y: 280 },
    maxShots: 5,
    parShots: 1,
    predictionBounces: 3,
    hint: 'The barrier blocks a direct shot. Bounce off the top or bottom wall to reach the target!',
    maxBounces: 15,
    minBounces: 1,
  },

  // ── Level 2: The L-Bend ────────────────────────────────
  // L-shaped room. Target is in the far arm — must bounce off
  // the inner corner wall.
  {
    id: 2,
    name: 'The L-Bend',
    subtitle: 'Navigate the corner',
    walls: [
      // L-shaped room
      { id: 'w-top', start: { x: 40, y: 80 }, end: { x: 220, y: 80 } },
      { id: 'w-right-upper', start: { x: 220, y: 80 }, end: { x: 220, y: 300 } },
      { id: 'w-inner-h', start: { x: 220, y: 300 }, end: { x: 360, y: 300 } },
      { id: 'w-right-lower', start: { x: 360, y: 300 }, end: { x: 360, y: 520 } },
      { id: 'w-bottom', start: { x: 360, y: 520 }, end: { x: 40, y: 520 } },
      { id: 'w-left', start: { x: 40, y: 520 }, end: { x: 40, y: 80 } },
    ],
    targets: [
      { id: 't1', center: { x: 300, y: 420 }, radius: 24, hit: false },
    ],
    reflectors: [],
    launchPoint: { x: 130, y: 180 },
    maxShots: 5,
    parShots: 1,
    predictionBounces: 2,
    hint: 'The target is around the corner. Bounce off the bottom wall to send the ball into the lower arm.',
    maxBounces: 15,
    minBounces: 1,
  },

  // ── Level 3: Double Bounce ─────────────────────────────
  // Rectangular room with TWO barriers. No 1-bounce path exists.
  // Must use exactly 2 bounces.
  {
    id: 3,
    name: 'Double Bounce',
    subtitle: 'Two bounces minimum',
    walls: [
      ...rectRoom(40, 80, 320, 440, 'room'),
      // Horizontal barrier across the middle
      { id: 'barrier-h', start: { x: 40, y: 310 }, end: { x: 280, y: 310 } },
      // Vertical barrier on the right
      { id: 'barrier-v', start: { x: 280, y: 310 }, end: { x: 280, y: 520 } },
    ],
    targets: [
      { id: 't1', center: { x: 160, y: 420 }, radius: 22, hit: false },
    ],
    reflectors: [],
    launchPoint: { x: 100, y: 180 },
    maxShots: 5,
    parShots: 1,
    predictionBounces: 2,
    hint: 'Two barriers block simple paths. You need at least 2 bounces to reach the target below!',
    maxBounces: 15,
    minBounces: 2,
  },

  // ── Level 4: Triangle Room ─────────────────────────────
  // Equilateral triangle with a barrier inside.
  // Must use the triangle's 60° angles. minBounces = 2.
  {
    id: 4,
    name: 'Triangle Room',
    subtitle: '60° angles everywhere',
    walls: (() => {
      // True equilateral triangle: base = 300, height = 300 * √3/2 ≈ 260
      const base = 300
      const height = Math.round(base * Math.sqrt(3) / 2)
      const cx = 200
      const bottomY = 480
      const topY = bottomY - height
      return [
        { id: 'tri-bottom', start: { x: cx - base / 2, y: bottomY }, end: { x: cx + base / 2, y: bottomY } },
        { id: 'tri-right', start: { x: cx + base / 2, y: bottomY }, end: { x: cx, y: topY } },
        { id: 'tri-left', start: { x: cx, y: topY }, end: { x: cx - base / 2, y: bottomY } },
        // Internal barrier: blocks direct shot from launch to target
        { id: 'tri-barrier', start: { x: 140, y: 380 }, end: { x: 260, y: 380 } },
      ]
    })(),
    targets: [
      { id: 't1', center: { x: 200, y: 440 }, radius: 20, hit: false },
    ],
    reflectors: [],
    launchPoint: { x: 140, y: 310 },
    maxShots: 5,
    parShots: 1,
    predictionBounces: 1,
    hint: 'Inside a triangle, every wall is at 60°. Bounce off the angled walls to get past the barrier and hit the target below!',
    maxBounces: 15,
    minBounces: 2,
  },

  // ── Level 5: The Maze ──────────────────────────────────
  // Room with multiple internal walls creating a maze-like structure.
  // Must find the right sequence of bounces. minBounces = 3.
  {
    id: 5,
    name: 'The Maze',
    subtitle: 'Find the right path',
    walls: [
      ...rectRoom(40, 80, 320, 440, 'room'),
      // Maze internal walls
      // Horizontal wall from left
      { id: 'maze-h1', start: { x: 40, y: 220 }, end: { x: 240, y: 220 } },
      // Vertical wall from that junction downward
      { id: 'maze-v1', start: { x: 240, y: 220 }, end: { x: 240, y: 370 } },
      // Horizontal wall from right
      { id: 'maze-h2', start: { x: 160, y: 370 }, end: { x: 360, y: 370 } },
    ],
    targets: [
      { id: 't1', center: { x: 100, y: 450 }, radius: 20, hit: false },
    ],
    reflectors: [],
    launchPoint: { x: 100, y: 150 },
    maxShots: 5,
    parShots: 1,
    predictionBounces: 1,
    hint: 'Navigate the maze with bounces! The ball must weave through gaps in the walls. Think 3+ bounces.',
    maxBounces: 20,
    minBounces: 3,
  },

  // ── Level 6: Mirror Puzzle ─────────────────────────────
  // Room with a barrier and a moveable reflector.
  // Position the reflector to create a valid multi-bounce path.
  {
    id: 6,
    name: 'Mirror Puzzle',
    subtitle: 'Aim the reflector',
    walls: [
      ...rectRoom(40, 80, 320, 440, 'room'),
      // L-shaped barrier hiding the target
      { id: 'barrier-top', start: { x: 200, y: 80 }, end: { x: 200, y: 350 } },
      { id: 'barrier-bottom', start: { x: 200, y: 350 }, end: { x: 360, y: 350 } },
    ],
    targets: [
      { id: 't1', center: { x: 300, y: 460 }, radius: 22, hit: false },
    ],
    reflectors: [
      { id: 'ref1', center: { x: 300, y: 200 }, angle: 45, halfLength: 40 },
    ],
    launchPoint: { x: 100, y: 200 },
    maxShots: 4,
    parShots: 1,
    predictionBounces: 2,
    hint: 'Tap the blue reflector to select it, drag to rotate. Aim the ball to bounce off the reflector around the barrier!',
    maxBounces: 20,
    minBounces: 2,
  },

  // ── Level 7: Two Targets ───────────────────────────────
  // Must hit both targets in one shot. One behind a wall,
  // one around a corner. minBounces = 3.
  {
    id: 7,
    name: 'Two Targets',
    subtitle: 'Hit both in one shot',
    walls: [
      ...rectRoom(40, 80, 320, 440, 'room'),
      // Horizontal barrier splitting room in half
      { id: 'split-h', start: { x: 40, y: 300 }, end: { x: 260, y: 300 } },
      // Vertical barrier on right side
      { id: 'split-v', start: { x: 260, y: 80 }, end: { x: 260, y: 300 } },
    ],
    targets: [
      { id: 't1', center: { x: 320, y: 180 }, radius: 20, hit: false },
      { id: 't2', center: { x: 140, y: 420 }, radius: 20, hit: false },
    ],
    reflectors: [],
    launchPoint: { x: 100, y: 180 },
    maxShots: 3,
    parShots: 1,
    predictionBounces: 1,
    hint: 'Both targets are blocked! Plan a path that bounces through both sections of the room.',
    maxBounces: 20,
    minBounces: 3,
  },

  // ── Level 8: The Vault ─────────────────────────────────
  // Complex room with multiple barriers. Target deep inside a pocket.
  // Need 4+ bounces and a reflector to reach it.
  {
    id: 8,
    name: 'The Vault',
    subtitle: 'Deep inside the pocket',
    walls: [
      ...rectRoom(40, 80, 320, 440, 'room'),
      // Create a pocket/vault in the bottom-right corner
      // Top wall of vault
      { id: 'vault-top', start: { x: 230, y: 350 }, end: { x: 360, y: 350 } },
      // Left wall of vault with a small opening
      { id: 'vault-left', start: { x: 230, y: 350 }, end: { x: 230, y: 520 } },
      // Upper barrier blocking direct approach
      { id: 'upper-barrier', start: { x: 40, y: 250 }, end: { x: 280, y: 250 } },
      // Mid barrier
      { id: 'mid-barrier', start: { x: 140, y: 250 }, end: { x: 140, y: 400 } },
    ],
    targets: [
      { id: 't1', center: { x: 300, y: 440 }, radius: 20, hit: false },
    ],
    reflectors: [
      { id: 'ref1', center: { x: 310, y: 170 }, angle: -45, halfLength: 35 },
    ],
    launchPoint: { x: 80, y: 160 },
    maxShots: 6,
    parShots: 1,
    predictionBounces: 1,
    hint: 'The target is locked in the vault. Use the reflector and plan a multi-bounce path through the gaps!',
    maxBounces: 25,
    minBounces: 4,
  },
]
