import { memo } from 'react'
import type { ActiveBall } from '../types'

interface BallAnimationProps {
  balls: ActiveBall[]
}

function BallAnimationComponent({ balls }: BallAnimationProps) {
  return (
    <g>
      {balls.map((ball) => {
        const { path, progress } = ball
        const pts = path.points

        if (pts.length < 2) return null

        // Calculate current position along the path
        const totalSegments = pts.length - 1
        const rawIndex = progress * totalSegments
        const segIndex = Math.min(Math.floor(rawIndex), totalSegments - 1)
        const segProgress = rawIndex - segIndex

        const p1 = pts[segIndex]
        const p2 = pts[Math.min(segIndex + 1, pts.length - 1)]

        const cx = p1.x + (p2.x - p1.x) * segProgress
        const cy = p1.y + (p2.y - p1.y) * segProgress

        return (
          <g key={ball.id}>
            {/* Glow */}
            <circle
              cx={cx}
              cy={cy}
              r={8}
              fill={`hsla(${ball.hue}, 80%, 70%, 0.25)`}
            />
            {/* Ball */}
            <circle
              cx={cx}
              cy={cy}
              r={4.5}
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
