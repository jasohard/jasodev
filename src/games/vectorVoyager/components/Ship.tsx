import { memo } from 'react'
import type { Vec2 } from '../types'

interface ShipProps {
  position: Vec2
  /** Angle in radians the ship should face (0 = right) */
  angle: number
  /** Whether the ship is currently animating along vectors */
  launching?: boolean
}

function ShipComponent({ position, angle, launching = false }: ShipProps) {
  // Ship triangle: points right by default (15px long, 12px wide)
  const deg = (angle * 180) / Math.PI
  return (
    <g transform={`translate(${position.x}, ${position.y}) rotate(${-deg})`}>
      {/* Engine glow — bigger and brighter when launching */}
      <circle
        cx={-6}
        cy={0}
        r={launching ? 10 : 5}
        fill="#4fc3f7"
        opacity={launching ? 0.35 : 0.2}
      />
      {launching && (
        <circle
          cx={-10}
          cy={0}
          r={6}
          fill="#ff9800"
          opacity={0.25}
        >
          <animate
            attributeName="r"
            values="4;8;4"
            dur="0.3s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="opacity"
            values="0.25;0.12;0.25"
            dur="0.3s"
            repeatCount="indefinite"
          />
        </circle>
      )}
      {/* Ship body */}
      <polygon
        points="12,0 -8,-7 -4,0 -8,7"
        fill={launching ? '#fff' : '#e0f7fa'}
        stroke="#4fc3f7"
        strokeWidth={1}
        strokeLinejoin="round"
      />
    </g>
  )
}

export default memo(ShipComponent)
