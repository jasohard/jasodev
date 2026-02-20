/**
 * HUD — Heads-up display overlay inside the SVG.
 * Shows speed readout, gem counter, timer, combo, and stars.
 */

import { memo } from 'react'
import { classifySpeed, speedColor, comboColor } from '../engine'

interface HUDProps {
  speed: number
  derivative: number
  gemsCollected: number
  totalGems: number
  rideTime: number
  comboCount: number
  stars: 0 | 1 | 2 | 3
  phase: string
  score: number
}

function HUDComponent({
  speed,
  derivative,
  gemsCollected,
  totalGems,
  rideTime,
  comboCount,
  stars,
  phase,
  score,
}: HUDProps) {
  const cls = classifySpeed(Math.abs(derivative))
  const sColor = speedColor(cls)
  const isRiding = phase === 'riding'
  const timeStr = rideTime.toFixed(1)

  return (
    <g style={{ pointerEvents: 'none' }}>
      {/* Stars (top-left) */}
      {[1, 2, 3].map((n) => (
        <text
          key={n}
          x={8 + (n - 1) * 18}
          y={18}
          fontSize={14}
          fill={n <= stars ? '#ffd32a' : 'rgba(255,255,255,0.2)'}
          style={{ transition: 'fill 0.3s ease' }}
        >
          {n <= stars ? '\u2605' : '\u2606'}
        </text>
      ))}

      {/* Gems counter (top-right area) */}
      <text
        x={580}
        y={18}
        textAnchor="end"
        fill="#ffd700"
        fontSize={11}
        fontFamily="var(--font-mono, monospace)"
      >
        💎 {gemsCollected}/{totalGems}
      </text>

      {/* Timer */}
      {isRiding && (
        <text
          x={580}
          y={34}
          textAnchor="end"
          fill="rgba(255,255,255,0.6)"
          fontSize={10}
          fontFamily="var(--font-mono, monospace)"
        >
          {timeStr}s
        </text>
      )}

      {/* Speed readout */}
      {isRiding && (
        <g>
          <text
            x={8}
            y={36}
            fill={sColor}
            fontSize={10}
            fontFamily="var(--font-mono, monospace)"
            style={{ transition: 'fill 0.15s ease' }}
          >
            {Math.round(speed)} px/s
          </text>
          {/* Slope label */}
          <text
            x={8}
            y={48}
            fill="rgba(255,255,255,0.4)"
            fontSize={8}
            fontFamily="var(--font-mono, monospace)"
          >
            f&apos;(x) = {derivative.toFixed(2)}
          </text>
        </g>
      )}

      {/* Combo indicator */}
      {comboCount > 1 && isRiding && (
        <text
          x={300}
          y={24}
          textAnchor="middle"
          fill={comboColor(comboCount)}
          fontSize={14 + comboCount * 2}
          fontWeight="bold"
          fontFamily="var(--font-sans, sans-serif)"
          opacity={0.9}
        >
          {comboCount}× COMBO!
        </text>
      )}

      {/* Score (shown during success) */}
      {phase === 'success' && (
        <text
          x={300}
          y={18}
          textAnchor="middle"
          fill="#ffd700"
          fontSize={12}
          fontWeight="bold"
          fontFamily="var(--font-mono, monospace)"
        >
          Score: {score}
        </text>
      )}
    </g>
  )
}

export default memo(HUDComponent)
