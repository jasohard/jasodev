import { memo } from 'react'
import type { ActiveBall } from '../types'

interface BallAnimationProps {
  balls: ActiveBall[]
}

/** Ease-in-out for smoother bounce feel */
function easeInOut(t: number): number {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2
}

function BallAnimationComponent({ balls }: BallAnimationProps) {
  return (
    <g>
      {balls.map((ball) => {
        const { path, progress } = ball
        const pts = path.points

        if (pts.length < 2 || progress <= 0) return null

        // Calculate current position along the path with easing per segment
        const totalSegments = pts.length - 1
        const rawIndex = progress * totalSegments
        const segIndex = Math.min(Math.floor(rawIndex), totalSegments - 1)
        const segProgress = easeInOut(rawIndex - segIndex)

        const p1 = pts[segIndex]
        const p2 = pts[Math.min(segIndex + 1, pts.length - 1)]

        const cx = p1.x + (p2.x - p1.x) * segProgress
        const cy = p1.y + (p2.y - p1.y) * segProgress

        // Scale effect when near a peg (bounce feel)
        const nearPeg = segProgress < 0.15 || segProgress > 0.85
        const scale = nearPeg ? 1.2 : 1

        return (
          <g key={ball.id}>
            {/* Glow */}
            <circle
              cx={cx}
              cy={cy}
              r={9 * scale}
              fill={`hsla(${ball.hue}, 80%, 70%, 0.2)`}
            />
            {/* Ball shadow */}
            <circle
              cx={cx + 1}
              cy={cy + 1}
              r={4.5 * scale}
              fill="rgba(0,0,0,0.3)"
            />
            {/* Ball */}
            <circle
              cx={cx}
              cy={cy}
              r={4.5 * scale}
              fill="#fff"
              stroke={`hsl(${ball.hue}, 80%, 70%)`}
              strokeWidth={1.5}
            />
          </g>
        )
      })}
    </g>
  )
}

export default memo(BallAnimationComponent)
