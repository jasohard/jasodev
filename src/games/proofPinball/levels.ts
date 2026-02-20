import type { LevelConfig } from './types'

/**
 * Level definitions for Proof Pinball.
 *
 * All coordinates are in SVG viewBox space (0,0 to 400,600).
 * The game viewport is designed mobile-first at this aspect ratio.
 *
 * DESIGN PRINCIPLE: Every level physically blocks direct shots.
 * The player MUST bounce the ball to reach the goal zone. Walls/barriers
 * always separate the launcher from the goal.
 *
 * NEW MECHANICS:
 * - GoalZone: circular area the ball must enter (not tiny point target)
 * - Energy: ball loses 20% energy per bounce, stops below 10%
 * - Power: player controls launch power via drag distance
 * - minBounces: ball must bounce N times before goal zone counts
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
  // Goal is behind a vertical barrier — must bounce off top or bottom wall.
  {
    id: 1,
    name: 'Bank Shot',
    subtitle: 'Bounce off the wall to reach the goal',
    walls: [
      ...rectRoom(40, 80, 320, 440, 'room'),
      // Vertical barrier blocking direct line-of-sight (doesn't reach bottom)
      { id: 'barrier-1', start: { x: 200, y: 80 }, end: { x: 200, y: 400 } },
    ],
    goalZone: { center: { x: 310, y: 280 }, radius: 35 },
    reflectors: [],
    launchPoint: { x: 100, y: 280 },
    maxShots: 5,
    parShots: 1,
    predictionBounces: 3,
    hint: 'The barrier blocks a direct shot. Bounce off the top or bottom wall to reach the green goal zone!',
    maxBounces: 30,
    minBounces: 1,
  },

  // ── Level 2: The L-Bend ────────────────────────────────
  // L-shaped room. Goal is in the far arm — must bounce around the corner.
  {
    id: 2,
    name: 'The L-Bend',
    subtitle: 'Navigate the corner',
    walls: [
      // L-shaped room
      { id: 'w-top', start: { x: 40, y: 80 }, end: { x: 240, y: 80 } },
      { id: 'w-right-upper', start: { x: 240, y: 80 }, end: { x: 240, y: 280 } },
      { id: 'w-inner-h', start: { x: 240, y: 280 }, end: { x: 360, y: 280 } },
      { id: 'w-right-lower', start: { x: 360, y: 280 }, end: { x: 360, y: 520 } },
      { id: 'w-bottom', start: { x: 360, y: 520 }, end: { x: 40, y: 520 } },
      { id: 'w-left', start: { x: 40, y: 520 }, end: { x: 40, y: 80 } },
    ],
    goalZone: { center: { x: 300, y: 420 }, radius: 35 },
    reflectors: [],
    launchPoint: { x: 130, y: 180 },
    maxShots: 5,
    parShots: 1,
    predictionBounces: 2,
    hint: 'The goal is around the corner. Bounce off the bottom wall to send the ball into the lower arm.',
    maxBounces: 30,
    minBounces: 1,
  },

  // ── Level 3: Double Bounce ─────────────────────────────
  // Rectangular room with a partial horizontal barrier and partial vertical barrier.
  // Gap between barriers allows multi-bounce paths. Must use 2+ bounces.
  {
    id: 3,
    name: 'Double Bounce',
    subtitle: 'Two bounces minimum',
    walls: [
      ...rectRoom(40, 80, 320, 440, 'room'),
      // Horizontal barrier from left (leaves gap on right)
      { id: 'barrier-h', start: { x: 40, y: 310 }, end: { x: 260, y: 310 } },
      // Vertical barrier from bottom (leaves gap at top junction)
      { id: 'barrier-v', start: { x: 260, y: 350 }, end: { x: 260, y: 520 } },
    ],
    goalZone: { center: { x: 150, y: 430 }, radius: 35 },
    reflectors: [],
    launchPoint: { x: 100, y: 180 },
    maxShots: 5,
    parShots: 1,
    predictionBounces: 2,
    hint: 'Two barriers block simple paths. Bounce off the right wall and find a path through the gap between barriers!',
    maxBounces: 30,
    minBounces: 2,
  },

  // ── Level 4: Triangle Room ─────────────────────────────
  // Equilateral triangle with a shorter barrier inside.
  // Must use the triangle's 60° angles. minBounces = 2.
  {
    id: 4,
    name: 'Triangle Room',
    subtitle: '60° angles everywhere',
    walls: (() => {
      const base = 320
      const height = Math.round(base * Math.sqrt(3) / 2)
      const cx = 200
      const bottomY = 490
      const topY = bottomY - height
      return [
        { id: 'tri-bottom', start: { x: cx - base / 2, y: bottomY }, end: { x: cx + base / 2, y: bottomY } },
        { id: 'tri-right', start: { x: cx + base / 2, y: bottomY }, end: { x: cx, y: topY } },
        { id: 'tri-left', start: { x: cx, y: topY }, end: { x: cx - base / 2, y: bottomY } },
        // Diagonal barrier blocking direct path from launch to goal
        { id: 'tri-barrier', start: { x: 140, y: 350 }, end: { x: 260, y: 430 } },
      ]
    })(),
    goalZone: { center: { x: 130, y: 450 }, radius: 28 },
    reflectors: [],
    launchPoint: { x: 200, y: 290 },
    maxShots: 5,
    parShots: 1,
    predictionBounces: 2,
    hint: 'Inside a triangle, every wall is at 60°. Bounce off the angled walls to get past the barrier!',
    maxBounces: 30,
    minBounces: 2,
  },

  // ── Level 5: The Maze ──────────────────────────────────
  // Room with internal walls creating a maze. Must find right bounce sequence.
  // minBounces = 3.
  {
    id: 5,
    name: 'The Maze',
    subtitle: 'Find the path through',
    walls: [
      ...rectRoom(40, 80, 320, 440, 'room'),
      // Maze internal walls with gaps
      { id: 'maze-h1', start: { x: 40, y: 220 }, end: { x: 250, y: 220 } },
      { id: 'maze-v1', start: { x: 250, y: 220 }, end: { x: 250, y: 370 } },
      { id: 'maze-h2', start: { x: 150, y: 370 }, end: { x: 360, y: 370 } },
    ],
    goalZone: { center: { x: 90, y: 450 }, radius: 35 },
    reflectors: [],
    launchPoint: { x: 100, y: 150 },
    maxShots: 5,
    parShots: 1,
    predictionBounces: 1,
    hint: 'Navigate the maze with bounces! The ball must weave through gaps in the walls. Think 3+ bounces.',
    maxBounces: 30,
    minBounces: 3,
  },

  // ── Level 6: Mirror Puzzle ─────────────────────────────
  // Room with a barrier and a moveable reflector.
  {
    id: 6,
    name: 'Mirror Puzzle',
    subtitle: 'Aim the reflector',
    walls: [
      ...rectRoom(40, 80, 320, 440, 'room'),
      // L-shaped barrier hiding the goal
      { id: 'barrier-top', start: { x: 200, y: 80 }, end: { x: 200, y: 350 } },
      { id: 'barrier-bottom', start: { x: 200, y: 350 }, end: { x: 360, y: 350 } },
    ],
    goalZone: { center: { x: 300, y: 460 }, radius: 35 },
    reflectors: [
      { id: 'ref1', center: { x: 300, y: 200 }, angle: 45, halfLength: 40 },
    ],
    launchPoint: { x: 100, y: 200 },
    maxShots: 4,
    parShots: 1,
    predictionBounces: 2,
    hint: 'Tap the blue reflector to select it, then drag to rotate. Bounce the ball off it to reach the goal!',
    maxBounces: 30,
    minBounces: 2,
  },

  // ── Level 7: Split Chamber ─────────────────────────────
  // Room divided by barriers with a gap. Must thread multi-bounce path through.
  // minBounces = 3.
  {
    id: 7,
    name: 'Split Chamber',
    subtitle: 'Thread through the gaps',
    walls: [
      ...rectRoom(40, 80, 320, 440, 'room'),
      // Horizontal barrier from left with gap on right
      { id: 'split-h', start: { x: 40, y: 300 }, end: { x: 240, y: 300 } },
      // Vertical barrier from top with gap at bottom
      { id: 'split-v', start: { x: 240, y: 80 }, end: { x: 240, y: 260 } },
    ],
    goalZone: { center: { x: 140, y: 420 }, radius: 35 },
    reflectors: [],
    launchPoint: { x: 100, y: 180 },
    maxShots: 4,
    parShots: 1,
    predictionBounces: 1,
    hint: 'The goal is blocked by barriers! Bounce through the gap between the barriers to reach it.',
    maxBounces: 30,
    minBounces: 3,
  },

  // ── Level 8: The Vault ─────────────────────────────────
  // Complex room with barriers and a reflector. Goal deep inside a pocket.
  // Needs 4+ bounces.
  {
    id: 8,
    name: 'The Vault',
    subtitle: 'Deep inside the pocket',
    walls: [
      ...rectRoom(40, 80, 320, 440, 'room'),
      // Vault pocket in bottom-right (entrance from above)
      { id: 'vault-top', start: { x: 240, y: 360 }, end: { x: 360, y: 360 } },
      { id: 'vault-left', start: { x: 240, y: 360 }, end: { x: 240, y: 520 } },
      // Upper barrier from left (wide gap on the right)
      { id: 'upper-barrier', start: { x: 40, y: 250 }, end: { x: 240, y: 250 } },
    ],
    goalZone: { center: { x: 305, y: 445 }, radius: 35 },
    reflectors: [
      { id: 'ref1', center: { x: 320, y: 170 }, angle: -45, halfLength: 35 },
    ],
    launchPoint: { x: 80, y: 160 },
    maxShots: 6,
    parShots: 1,
    predictionBounces: 1,
    hint: 'The goal is locked in the vault. Use the reflector and plan a multi-bounce path to sneak in!',
    maxBounces: 30,
    minBounces: 3,
  },
]
