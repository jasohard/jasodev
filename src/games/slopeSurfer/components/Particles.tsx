/**
 * Particles — Renders active particles (gem bursts, landing explosions, speed trails).
 */

import { memo } from 'react'
import type { Particle } from '../types'

interface ParticlesProps {
  particles: Particle[]
}

function ParticlesComponent({ particles }: ParticlesProps) {
  return (
    <g style={{ pointerEvents: 'none' }}>
      {particles.map(p => {
        const opacity = Math.max(0, p.life / p.maxLife)
        return (
          <circle
            key={p.id}
            cx={p.x}
            cy={p.y}
            r={p.size * opacity}
            fill={p.color}
            opacity={opacity * 0.9}
          />
        )
      })}
    </g>
  )
}

export default memo(ParticlesComponent)
