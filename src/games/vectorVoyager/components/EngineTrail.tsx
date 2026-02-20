import { memo } from 'react'
import type { TrailParticle } from '../types'

interface EngineTrailProps {
  particles: TrailParticle[]
}

function EngineTrailComponent({ particles }: EngineTrailProps) {
  return (
    <g>
      {particles.map((p) => (
        <circle
          key={p.id}
          cx={p.x}
          cy={p.y}
          r={2.5 * p.opacity}
          fill="#4fc3f7"
          opacity={p.opacity * 0.7}
        />
      ))}
    </g>
  )
}

export default memo(EngineTrailComponent)
