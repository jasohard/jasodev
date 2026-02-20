/**
 * Surfer — The surfer character riding the curve.
 * The board IS the tangent line, rotating to match the slope.
 */

import { memo, useMemo } from 'react'
import { tangentLine, classifySpeed, speedColor } from '../engine'

interface SurferProps {
  curveFunc: (x: number) => number
  x: number
  speed: number
  derivative: number
  isRiding: boolean
  boardFlash: boolean
}

function SurferComponent({ curveFunc, x, speed, derivative, isRiding, boardFlash }: SurferProps) {
  const { start, end, angle } = useMemo(
    () => tangentLine(curveFunc, x, 16),
    [curveFunc, x]
  )

  const y = curveFunc(x)
  const angleDeg = angle * (180 / Math.PI)
  const cls = classifySpeed(Math.abs(derivative))
  const sColor = speedColor(cls)

  // Board flash effect
  const boardStroke = boardFlash ? '#ffd700' : '#ffffff'
  const boardWidth = boardFlash ? 3.5 : 2.5

  return (
    <g style={{ pointerEvents: 'none' }}>
      {/* Tangent line (the board) */}
      <line
        x1={start.x}
        y1={start.y}
        x2={end.x}
        y2={end.y}
        stroke={boardStroke}
        strokeWidth={boardWidth}
        strokeLinecap="round"
        style={{ transition: 'stroke 0.1s ease' }}
      />

      {/* Surfer body — simple geometric figure */}
      <g transform={`translate(${x}, ${y})`}>
        {/* Glow behind surfer when fast */}
        {isRiding && speed > 40 && (
          <circle
            r={8 + speed * 0.05}
            fill={sColor}
            opacity={0.15}
          >
            <animate
              attributeName="opacity"
              values="0.15;0.08;0.15"
              dur="0.5s"
              repeatCount="indefinite"
            />
          </circle>
        )}

        {/* Body (circle) */}
        <circle
          r={5}
          fill="#ffffff"
          stroke={sColor}
          strokeWidth={1.5}
          cy={-10}
          transform={`rotate(${angleDeg})`}
          style={{ transition: 'stroke 0.15s ease' }}
        />

        {/* Legs connecting to board */}
        <line
          x1={0} y1={-5}
          x2={-3} y2={0}
          stroke="#ffffff"
          strokeWidth={1.5}
          strokeLinecap="round"
          transform={`rotate(${angleDeg})`}
        />
        <line
          x1={0} y1={-5}
          x2={3} y2={0}
          stroke="#ffffff"
          strokeWidth={1.5}
          strokeLinecap="round"
          transform={`rotate(${angleDeg})`}
        />
      </g>

      {/* Speed indicator dot */}
      {isRiding && (
        <circle
          cx={x}
          cy={y}
          r={3}
          fill={sColor}
          opacity={0.8}
        />
      )}
    </g>
  )
}

export default memo(SurferComponent)
