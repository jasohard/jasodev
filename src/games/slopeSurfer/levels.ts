/**
 * Slope Surfer — 8 level configurations.
 * Levels progressively teach derivative concepts:
 * 1. Fixed curve (tutorial)
 * 2. Single control point (hills/peaks)
 * 3. Two controls (roller coaster)
 * 4. Steep cliff → landing (derivative magnitude)
 * 5. Multi-gem gauntlet (planning f'(x))
 * 6. Inflection/concavity
 * 7. Precision landing (optimization)
 * 8. Freestyle (creative mode)
 */

import type { LevelConfig } from './types'
import { BOARD_WIDTH, BOARD_HEIGHT } from './engine'

const W = BOARD_WIDTH
const H = BOARD_HEIGHT

// Helper: vertical middle area for gameplay
const groundBase = H * 0.65 // ~208 at 320 height

export const LEVELS: LevelConfig[] = [
  // ─── Level 1: First Descent (Tutorial) ──────────────────
  {
    id: 1,
    name: 'First Descent',
    subtitle: 'Tutorial — Watch the surfer ride!',
    hint: 'The surfer\'s speed matches the steepness. Steeper = faster! Press SURF to ride.',
    startPoint: { x: 40, y: groundBase - 80 },
    endPoint: { x: W - 40, y: groundBase + 20 },
    controlPoints: [],
    gems: [
      { id: 1, x: 180, y: groundBase - 50, collected: false },
      { id: 2, x: 320, y: groundBase - 25, collected: false },
      { id: 3, x: 440, y: groundBase + 5, collected: false },
    ],
    target: { xStart: W - 80, xEnd: W - 20, yCenter: groundBase + 20, tolerance: 30 },
    parTime: 8,
    speedMultiplier: 1,
    showDerivToggle: false,
    autoPass: true,
  },

  // ─── Level 2: The Hill ──────────────────────────────────
  {
    id: 2,
    name: 'The Hill',
    subtitle: 'Speed drops to zero at the peak!',
    hint: 'Drag the peak up or down. Notice: speed → 0 at the top where the slope is flat.',
    startPoint: { x: 40, y: groundBase },
    endPoint: { x: W - 40, y: groundBase },
    controlPoints: [
      { id: 1, x: W * 0.45, y: groundBase - 90, minY: groundBase - 150, maxY: groundBase - 30, fixed: false },
    ],
    gems: [
      { id: 1, x: W * 0.25, y: groundBase - 50, collected: false },
      { id: 2, x: W * 0.65, y: groundBase - 50, collected: false },
    ],
    target: { xStart: W - 90, xEnd: W - 30, yCenter: groundBase, tolerance: 25 },
    parTime: 10,
    speedMultiplier: 1,
    showDerivToggle: true,
  },

  // ─── Level 3: Roller Coaster ───────────────────────────
  {
    id: 3,
    name: 'Roller Coaster',
    subtitle: 'Two hills, one valley — manage your momentum!',
    hint: 'Shape the terrain with 2 control points. Steep descents = high speed bursts!',
    startPoint: { x: 30, y: groundBase - 30 },
    endPoint: { x: W - 30, y: groundBase - 10 },
    controlPoints: [
      { id: 1, x: W * 0.28, y: groundBase - 80, minY: groundBase - 140, maxY: groundBase - 20, fixed: false },
      { id: 2, x: W * 0.62, y: groundBase - 70, minY: groundBase - 130, maxY: groundBase - 10, fixed: false },
    ],
    gems: [
      { id: 1, x: W * 0.15, y: groundBase - 55, collected: false },
      { id: 2, x: W * 0.42, y: groundBase - 20, collected: false },
      { id: 3, x: W * 0.55, y: groundBase - 40, collected: false },
      { id: 4, x: W * 0.80, y: groundBase - 30, collected: false },
    ],
    target: { xStart: W - 70, xEnd: W - 20, yCenter: groundBase - 10, tolerance: 25 },
    parTime: 12,
    speedMultiplier: 1,
    showDerivToggle: true,
  },

  // ─── Level 4: The Launch Pad ──────────────────────────
  {
    id: 4,
    name: 'The Launch Pad',
    subtitle: 'Steep cliff → careful landing',
    hint: 'A steep cliff means maximum speed! Shape the transition for a precise landing.',
    startPoint: { x: 30, y: groundBase - 80 },
    endPoint: { x: W - 30, y: groundBase + 30 },
    controlPoints: [
      { id: 1, x: W * 0.35, y: groundBase - 75, minY: groundBase - 120, maxY: groundBase - 20, fixed: false },
      { id: 2, x: W * 0.55, y: groundBase + 15, minY: groundBase - 40, maxY: groundBase + 40, fixed: false },
    ],
    gems: [
      { id: 1, x: W * 0.40, y: groundBase - 40, collected: false },
      { id: 2, x: W * 0.50, y: groundBase - 10, collected: false },
      { id: 3, x: W * 0.70, y: groundBase + 20, collected: false },
    ],
    target: { xStart: W - 75, xEnd: W - 25, yCenter: groundBase + 30, tolerance: 20 },
    parTime: 9,
    speedMultiplier: 1.2,
    showDerivToggle: true,
  },

  // ─── Level 5: Gem Gauntlet ────────────────────────────
  {
    id: 5,
    name: 'Gem Gauntlet',
    subtitle: 'Plan your curves to collect them all!',
    hint: '5 gems spread across the course. Shape your terrain to pass through each one.',
    startPoint: { x: 25, y: groundBase - 40 },
    endPoint: { x: W - 25, y: groundBase - 20 },
    controlPoints: [
      { id: 1, x: W * 0.22, y: groundBase - 80, minY: groundBase - 140, maxY: groundBase, fixed: false },
      { id: 2, x: W * 0.45, y: groundBase + 10, minY: groundBase - 50, maxY: groundBase + 40, fixed: false },
      { id: 3, x: W * 0.72, y: groundBase - 60, minY: groundBase - 120, maxY: groundBase, fixed: false },
    ],
    gems: [
      { id: 1, x: W * 0.15, y: groundBase - 65, collected: false },
      { id: 2, x: W * 0.32, y: groundBase - 40, collected: false },
      { id: 3, x: W * 0.50, y: groundBase + 5, collected: false },
      { id: 4, x: W * 0.65, y: groundBase - 30, collected: false },
      { id: 5, x: W * 0.85, y: groundBase - 30, collected: false },
    ],
    target: { xStart: W - 65, xEnd: W - 15, yCenter: groundBase - 20, tolerance: 25 },
    parTime: 14,
    speedMultiplier: 1,
    showDerivToggle: true,
  },

  // ─── Level 6: Concavity Cruise ────────────────────────
  {
    id: 6,
    name: 'Concavity Cruise',
    subtitle: 'Feel the inflection point',
    hint: 'The curve changes from "cup" to "cap" at the inflection point. Gems cluster there!',
    startPoint: { x: 30, y: groundBase - 60 },
    endPoint: { x: W - 30, y: groundBase - 60 },
    controlPoints: [
      { id: 1, x: W * 0.30, y: groundBase + 20, minY: groundBase - 40, maxY: groundBase + 50, fixed: false },
      { id: 2, x: W * 0.70, y: groundBase - 100, minY: groundBase - 150, maxY: groundBase - 30, fixed: false },
    ],
    gems: [
      { id: 1, x: W * 0.35, y: groundBase - 5, collected: false },
      { id: 2, x: W * 0.45, y: groundBase - 30, collected: false },
      { id: 3, x: W * 0.55, y: groundBase - 55, collected: false },
      { id: 4, x: W * 0.65, y: groundBase - 80, collected: false },
    ],
    target: { xStart: W - 75, xEnd: W - 25, yCenter: groundBase - 60, tolerance: 22 },
    parTime: 13,
    speedMultiplier: 1.1,
    showDerivToggle: true,
  },

  // ─── Level 7: Precision Landing ──────────────────────
  {
    id: 7,
    name: 'Precision Landing',
    subtitle: 'Tiny target, big challenge!',
    hint: 'The landing zone is tiny! Shape the final section to approach it gently.',
    startPoint: { x: 25, y: groundBase - 50 },
    endPoint: { x: W - 25, y: groundBase + 10 },
    controlPoints: [
      { id: 1, x: W * 0.20, y: groundBase - 100, minY: groundBase - 150, maxY: groundBase, fixed: false },
      { id: 2, x: W * 0.50, y: groundBase + 20, minY: groundBase - 30, maxY: groundBase + 50, fixed: false },
      { id: 3, x: W * 0.75, y: groundBase - 40, minY: groundBase - 100, maxY: groundBase + 20, fixed: false },
    ],
    gems: [
      { id: 1, x: W * 0.15, y: groundBase - 80, collected: false },
      { id: 2, x: W * 0.35, y: groundBase - 30, collected: false },
      { id: 3, x: W * 0.48, y: groundBase + 10, collected: false },
      { id: 4, x: W * 0.63, y: groundBase - 15, collected: false },
      { id: 5, x: W * 0.82, y: groundBase - 10, collected: false },
    ],
    target: { xStart: W - 50, xEnd: W - 25, yCenter: groundBase + 10, tolerance: 15 },
    parTime: 15,
    speedMultiplier: 1.1,
    showDerivToggle: true,
  },

  // ─── Level 8: Freestyle Mountain ──────────────────────
  {
    id: 8,
    name: 'Freestyle Mountain',
    subtitle: 'Create your own terrain!',
    hint: '5 control points — build any terrain you want! Collect as many gems as possible.',
    startPoint: { x: 25, y: groundBase - 20 },
    endPoint: { x: W - 25, y: groundBase - 20 },
    controlPoints: [
      { id: 1, x: W * 0.15, y: groundBase - 40, minY: groundBase - 160, maxY: groundBase + 40, fixed: false },
      { id: 2, x: W * 0.30, y: groundBase - 60, minY: groundBase - 160, maxY: groundBase + 40, fixed: false },
      { id: 3, x: W * 0.50, y: groundBase - 80, minY: groundBase - 160, maxY: groundBase + 40, fixed: false },
      { id: 4, x: W * 0.70, y: groundBase - 60, minY: groundBase - 160, maxY: groundBase + 40, fixed: false },
      { id: 5, x: W * 0.85, y: groundBase - 40, minY: groundBase - 160, maxY: groundBase + 40, fixed: false },
    ],
    gems: [
      { id: 1, x: W * 0.12, y: groundBase - 80, collected: false },
      { id: 2, x: W * 0.28, y: groundBase - 110, collected: false },
      { id: 3, x: W * 0.44, y: groundBase - 50, collected: false },
      { id: 4, x: W * 0.60, y: groundBase - 100, collected: false },
      { id: 5, x: W * 0.76, y: groundBase - 70, collected: false },
      { id: 6, x: W * 0.90, y: groundBase - 30, collected: false },
    ],
    target: { xStart: W - 70, xEnd: W - 15, yCenter: groundBase - 20, tolerance: 30 },
    parTime: null,
    speedMultiplier: 1,
    showDerivToggle: true,
    freestyle: true,
  },
]
