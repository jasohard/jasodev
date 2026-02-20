import { memo } from 'react'
import type { Vec2 } from '../types'

interface ShipProps {
  position: Vec2
  /** Angle in radians the ship should face (0 = right) */
  angle: number
}

function ShipComponent({ position, angle }: ShipProps) {
  // Ship triangle: points right by default (15px long, 12px wide)
  const deg = (angle * 180) / Math.PI
  return (
    <g transform={`translate(${position.x}, ${position.y}) rotate(${-deg})`}>
      {/* Engine glow */}
      <circle cx={-6} cy={0} r={5} fill="#4fc3f7" opacity={0.2} />
      {/* Ship body */}
      <polygon
        points="12,0 -8,-7 -4,0 -8,7"
        fill="#e0f7fa"
        stroke="#4fc3f7"
        strokeWidth={1}
        strokeLinejoin="round"
      />
    </g>
  )
}

export default memo(ShipComponent)
