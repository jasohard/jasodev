/**
 * TargetZone — The landing zone the surfer must reach.
 * Shows a flag and highlighted area.
 */

import { memo } from 'react'
import type { TargetZone as TargetZoneType } from '../types'

interface TargetZoneProps {
  target: TargetZoneType
  reached: boolean
}

function TargetZoneComponent({ target, reached }: TargetZoneProps) {
  const centerX = (target.xStart + target.xEnd) / 2
  const width = target.xEnd - target.xStart

  return (
    <g>
      {/* Landing zone rectangle */}
      <rect
        x={target.xStart}
        y={target.yCenter - target.tolerance}
        width={width}
        height={target.tolerance * 2}
        fill={reached ? '#4caf50' : '#4caf50'}
        opacity={reached ? 0.3 : 0.12}
        rx={3}
        style={{ transition: 'opacity 0.3s ease' }}
      />

      {/* Zone border */}
      <rect
        x={target.xStart}
        y={target.yCenter - target.tolerance}
        width={width}
        height={target.tolerance * 2}
        fill="none"
        stroke={reached ? '#81c784' : '#4caf50'}
        strokeWidth={1.5}
        strokeDasharray={reached ? 'none' : '4 3'}
        opacity={reached ? 0.8 : 0.5}
        rx={3}
      />

      {/* Flag pole */}
      <line
        x1={centerX}
        y1={target.yCenter - target.tolerance - 25}
        x2={centerX}
        y2={target.yCenter - target.tolerance}
        stroke={reached ? '#81c784' : '#4caf50'}
        strokeWidth={2}
        strokeLinecap="round"
      />

      {/* Flag */}
      <polygon
        points={`${centerX},${target.yCenter - target.tolerance - 25} ${centerX + 14},${target.yCenter - target.tolerance - 18} ${centerX},${target.yCenter - target.tolerance - 11}`}
        fill={reached ? '#ffd700' : '#4caf50'}
        opacity={reached ? 1 : 0.7}
        style={{ transition: 'fill 0.3s ease, opacity 0.3s ease' }}
      >
        {/* Wave animation */}
        {!reached && (
          <animateTransform
            attributeName="transform"
            type="scale"
            values="1,1; 1.05,0.95; 1,1"
            dur="2s"
            repeatCount="indefinite"
            additive="sum"
          />
        )}
      </polygon>

      {/* Success ring */}
      {reached && (
        <circle
          cx={centerX}
          cy={target.yCenter}
          r={5}
          fill="none"
          stroke="#ffd700"
          strokeWidth={2}
          opacity={0}
        >
          <animate attributeName="r" from="5" to="30" dur="0.6s" fill="freeze" />
          <animate attributeName="opacity" from="0.8" to="0" dur="0.6s" fill="freeze" />
        </circle>
      )}

      {/* Label */}
      <text
        x={centerX}
        y={target.yCenter + target.tolerance + 12}
        textAnchor="middle"
        fill={reached ? '#81c784' : '#4caf50'}
        fontSize={8}
        fontFamily="var(--font-mono, monospace)"
        opacity={0.7}
        style={{ pointerEvents: 'none' }}
      >
        TARGET
      </text>
    </g>
  )
}

export default memo(TargetZoneComponent)
