/**
 * SpeedOverlay — Background parallax stars and speed lines.
 * Creates a sense of motion at high speeds.
 */

import { memo, useMemo } from 'react'
import { BOARD_WIDTH, BOARD_HEIGHT } from '../engine'

interface SpeedOverlayProps {
  speed: number
  isRiding: boolean
  surferX: number
}

// Generate static star positions once
const STARS = Array.from({ length: 30 }, (_, i) => ({
  x: (i * 47 + 13) % BOARD_WIDTH,
  y: (i * 31 + 7) % (BOARD_HEIGHT * 0.5),
  size: 0.5 + (i % 3) * 0.4,
  opacity: 0.15 + (i % 4) * 0.1,
}))

function SpeedOverlayComponent({ speed, isRiding, surferX }: SpeedOverlayProps) {
  // Parallax offset based on surfer position
  const parallaxOffset = surferX * 0.1

  // Speed lines appear at high speeds
  const speedLines = useMemo(() => {
    if (!isRiding || speed < 50) return null
    const intensity = Math.min(1, (speed - 50) / 100)
    const lineCount = Math.floor(intensity * 8) + 2
    const lines = []
    for (let i = 0; i < lineCount; i++) {
      const y = 20 + (i * 37 + 11) % (BOARD_HEIGHT - 40)
      const len = 20 + intensity * 40
      lines.push({
        x: BOARD_WIDTH * 0.3 + (i * 73) % (BOARD_WIDTH * 0.6),
        y,
        len,
        opacity: 0.1 + intensity * 0.2,
      })
    }
    return lines
  }, [isRiding, speed])

  return (
    <g style={{ pointerEvents: 'none' }}>
      {/* Background stars with parallax */}
      {STARS.map((star, i) => (
        <circle
          key={i}
          cx={((star.x - parallaxOffset) % BOARD_WIDTH + BOARD_WIDTH) % BOARD_WIDTH}
          cy={star.y}
          r={star.size}
          fill="#ffffff"
          opacity={star.opacity}
        />
      ))}

      {/* Speed lines (horizontal streaks) */}
      {speedLines && speedLines.map((line, i) => (
        <line
          key={`sl-${i}`}
          x1={line.x}
          y1={line.y}
          x2={line.x + line.len}
          y2={line.y}
          stroke="#ffffff"
          strokeWidth={1}
          opacity={line.opacity}
          strokeLinecap="round"
        >
          <animate
            attributeName="x1"
            from={line.x}
            to={line.x - 60}
            dur="0.3s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="x2"
            from={line.x + line.len}
            to={line.x + line.len - 60}
            dur="0.3s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="opacity"
            values={`${line.opacity};${line.opacity * 0.3};${line.opacity}`}
            dur="0.4s"
            repeatCount="indefinite"
          />
        </line>
      ))}
    </g>
  )
}

export default memo(SpeedOverlayComponent)
