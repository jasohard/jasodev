import { memo } from 'react'
import type { Vec2 } from '../types'

interface TargetZoneProps {
  center: Vec2
  radius: number
  reached: boolean
}

function TargetZoneComponent({ center, radius, reached }: TargetZoneProps) {
  return (
    <g>
      {/* Glow behind target */}
      <circle
        cx={center.x}
        cy={center.y}
        r={radius + 6}
        fill="none"
        stroke="#ffd700"
        strokeWidth={2}
        opacity={0.15}
      />
      {/* Main ring */}
      <circle
        cx={center.x}
        cy={center.y}
        r={radius}
        fill={reached ? 'rgba(255, 215, 0, 0.25)' : 'rgba(255, 215, 0, 0.06)'}
        stroke="#ffd700"
        strokeWidth={2.5}
        strokeDasharray={reached ? 'none' : '8 4'}
        style={{
          transition: 'fill 0.4s ease',
        }}
      >
        {!reached && (
          <animate
            attributeName="stroke-dashoffset"
            values="0;24"
            dur="1.5s"
            repeatCount="indefinite"
          />
        )}
      </circle>
      {/* Pulsing outer ring */}
      {!reached && (
        <circle
          cx={center.x}
          cy={center.y}
          r={radius}
          fill="none"
          stroke="#ffd700"
          strokeWidth={1.5}
          opacity={0.4}
        >
          <animate
            attributeName="r"
            values={`${radius};${radius + 8};${radius}`}
            dur="2s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="opacity"
            values="0.4;0.05;0.4"
            dur="2s"
            repeatCount="indefinite"
          />
        </circle>
      )}
      {/* Cross-hair center */}
      <circle
        cx={center.x}
        cy={center.y}
        r={3}
        fill="#ffd700"
        opacity={0.6}
      />
    </g>
  )
}

export default memo(TargetZoneComponent)
