import { memo } from 'react'
import type { Asteroid } from '../types'

interface AsteroidsProps {
  asteroids: Asteroid[]
}

function AsteroidsComponent({ asteroids }: AsteroidsProps) {
  return (
    <g>
      {asteroids.map((ast, i) => (
        <g key={i}>
          {/* Subtle shadow */}
          <circle
            cx={ast.cx + 2}
            cy={ast.cy + 2}
            r={ast.r}
            fill="rgba(0,0,0,0.3)"
          />
          {/* Asteroid body */}
          <circle
            cx={ast.cx}
            cy={ast.cy}
            r={ast.r}
            fill="#3a3a4a"
            stroke="#666"
            strokeWidth={1.5}
          />
          {/* Surface detail — craters */}
          <circle
            cx={ast.cx - ast.r * 0.25}
            cy={ast.cy - ast.r * 0.15}
            r={ast.r * 0.2}
            fill="none"
            stroke="#555"
            strokeWidth={0.8}
            opacity={0.5}
          />
          <circle
            cx={ast.cx + ast.r * 0.3}
            cy={ast.cy + ast.r * 0.25}
            r={ast.r * 0.15}
            fill="none"
            stroke="#555"
            strokeWidth={0.8}
            opacity={0.4}
          />
        </g>
      ))}
    </g>
  )
}

export default memo(AsteroidsComponent)
