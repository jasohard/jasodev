import { memo } from 'react'
import type { LaunchVector, Vec2 } from '../types'
import { vecSub, vecLen, vecAngleDeg } from '../engine'

interface LaunchVectorProps {
  launch: LaunchVector | null
  isDragging: boolean
}

/** Renders the single launch vector arrow from the ship */
function LaunchVectorComponent({ launch, isDragging }: LaunchVectorProps) {
  if (!launch) return null

  const d = vecSub(launch.end, launch.start)
  const len = vecLen(d)
  if (len < 4) return null

  const angleDeg = vecAngleDeg(d)
  const angle = Math.atan2(d.y, d.x)
  const midX = (launch.start.x + launch.end.x) / 2
  const midY = (launch.start.y + launch.end.y) / 2

  // Arrowhead
  const headLen = 10
  const headWidth = 6
  const tip = launch.end
  const left: Vec2 = {
    x: tip.x - headLen * Math.cos(angle) + headWidth * Math.sin(angle),
    y: tip.y - headLen * Math.sin(angle) - headWidth * Math.cos(angle),
  }
  const right: Vec2 = {
    x: tip.x - headLen * Math.cos(angle) - headWidth * Math.sin(angle),
    y: tip.y - headLen * Math.sin(angle) + headWidth * Math.cos(angle),
  }

  return (
    <g>
      {/* Component lines while dragging */}
      {isDragging && len > 15 && (
        <>
          <line
            x1={launch.start.x} y1={launch.start.y}
            x2={launch.end.x} y2={launch.start.y}
            stroke="#4fc3f7" strokeWidth={1}
            strokeDasharray="4 3" opacity={0.3}
          />
          <line
            x1={launch.end.x} y1={launch.start.y}
            x2={launch.end.x} y2={launch.end.y}
            stroke="#4fc3f7" strokeWidth={1}
            strokeDasharray="4 3" opacity={0.3}
          />
        </>
      )}

      {/* Arrow shaft */}
      <line
        x1={launch.start.x} y1={launch.start.y}
        x2={launch.end.x} y2={launch.end.y}
        stroke="#4fc3f7"
        strokeWidth={isDragging ? 4 : 3}
        strokeLinecap="round"
        opacity={0.9}
      />

      {/* Arrowhead */}
      {len > 8 && (
        <polygon
          points={`${tip.x},${tip.y} ${left.x},${left.y} ${right.x},${right.y}`}
          fill="#4fc3f7"
          opacity={0.9}
        />
      )}

      {/* Invisible touch target on arrowhead for re-drag */}
      <circle
        cx={launch.end.x} cy={launch.end.y}
        r={24} fill="transparent"
        style={{ cursor: 'grab' }}
        data-launch-handle="true"
      />

      {/* Magnitude & angle label */}
      {len > 20 && (
        <text
          x={midX} y={midY - 10}
          fill="#4fc3f7"
          fontSize={10} fontFamily="monospace"
          textAnchor="middle" opacity={0.8}
          style={{ pointerEvents: 'none' }}
        >
          {len.toFixed(0)}px {angleDeg >= 0 ? '+' : ''}{angleDeg.toFixed(0)}°
        </text>
      )}
    </g>
  )
}

export default memo(LaunchVectorComponent)
