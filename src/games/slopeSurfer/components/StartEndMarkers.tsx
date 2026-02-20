/**
 * StartEndMarkers — Visual indicators for the start and end points of the curve.
 */

import { memo } from 'react'
import type { Vec2 } from '../types'

interface StartEndMarkersProps {
  startPoint: Vec2
  endPoint: Vec2
  curveFunc: (x: number) => number
}

function StartEndMarkersComponent({ startPoint, endPoint, curveFunc }: StartEndMarkersProps) {
  const startY = curveFunc(startPoint.x)
  const endY = curveFunc(endPoint.x)

  return (
    <g style={{ pointerEvents: 'none' }}>
      {/* Start marker */}
      <g>
        {/* Start circle */}
        <circle
          cx={startPoint.x}
          cy={startY}
          r={5}
          fill="none"
          stroke="#00e5ff"
          strokeWidth={1.5}
          opacity={0.6}
        />
        <circle
          cx={startPoint.x}
          cy={startY}
          r={2}
          fill="#00e5ff"
          opacity={0.8}
        />
        {/* START label */}
        <text
          x={startPoint.x}
          y={startY - 10}
          textAnchor="middle"
          fill="#00e5ff"
          fontSize={7}
          fontFamily="var(--font-mono, monospace)"
          opacity={0.5}
        >
          START
        </text>
      </g>

      {/* End marker */}
      <g>
        <circle
          cx={endPoint.x}
          cy={endY}
          r={4}
          fill="none"
          stroke="#4caf50"
          strokeWidth={1.5}
          opacity={0.5}
        />
        <circle
          cx={endPoint.x}
          cy={endY}
          r={1.5}
          fill="#4caf50"
          opacity={0.6}
        />
      </g>
    </g>
  )
}

export default memo(StartEndMarkersComponent)
