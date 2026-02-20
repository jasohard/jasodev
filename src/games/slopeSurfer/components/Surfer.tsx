/**
 * Surfer — The surfer character riding the curve.
 * The board IS the tangent line, rotating to match the slope.
 * The surfer body sits above the board along the curve normal.
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
  const tl = useMemo(
    () => tangentLine(curveFunc, x, 18),
    [curveFunc, x]
  )

  const y = curveFunc(x)
  const cls = classifySpeed(Math.abs(derivative))
  const sColor = speedColor(cls)

  // Board flash effect
  const boardStroke = boardFlash ? '#ffd700' : '#ffffff'
  const boardWidth = boardFlash ? 4 : 2.5

  // Normal direction (perpendicular up from the curve)
  // For a slope angle θ, the upward normal is (-sin(θ), -cos(θ))
  // We want the surfer to always be "above" the board visually
  const nx = -Math.sin(tl.angle)
  const ny = -Math.cos(tl.angle)
  // Ensure the normal always points roughly upward
  const sign = ny < 0 ? 1 : -1

  // Body points relative to (x, y) along normal
  const feetY = y + sign * ny * 2
  const feetX = x + sign * nx * 2
  const hipY = y + sign * ny * 8
  const hipX = x + sign * nx * 8
  const headY = y + sign * ny * 16
  const headX = x + sign * nx * 16
  const armY = y + sign * ny * 11
  const armX = x + sign * nx * 11

  // Arm spread along tangent direction
  const armSpread = 7
  const tx = Math.cos(tl.angle)
  const ty = Math.sin(tl.angle)

  return (
    <g style={{ pointerEvents: 'none' }}>
      {/* Speed glow */}
      {isRiding && speed > 40 && (
        <circle
          cx={x}
          cy={y}
          r={6 + speed * 0.04}
          fill={sColor}
          opacity={0.1}
        >
          <animate
            attributeName="opacity"
            values="0.1;0.05;0.1"
            dur="0.5s"
            repeatCount="indefinite"
          />
        </circle>
      )}

      {/* Tangent line (the board) */}
      <line
        x1={tl.start.x}
        y1={tl.start.y}
        x2={tl.end.x}
        y2={tl.end.y}
        stroke={boardStroke}
        strokeWidth={boardWidth}
        strokeLinecap="round"
        style={{ transition: 'stroke 0.1s ease' }}
      />

      {/* Board accent line */}
      <line
        x1={tl.start.x}
        y1={tl.start.y}
        x2={tl.end.x}
        y2={tl.end.y}
        stroke={sColor}
        strokeWidth={1}
        strokeLinecap="round"
        opacity={0.35}
      />

      {/* Surfer body */}
      <g>
        {/* Legs */}
        <line
          x1={feetX - tx * 3} y1={feetY - ty * 3}
          x2={hipX} y2={hipY}
          stroke="#ffffff"
          strokeWidth={1.8}
          strokeLinecap="round"
        />
        <line
          x1={feetX + tx * 3} y1={feetY + ty * 3}
          x2={hipX} y2={hipY}
          stroke="#ffffff"
          strokeWidth={1.8}
          strokeLinecap="round"
        />

        {/* Torso */}
        <line
          x1={hipX} y1={hipY}
          x2={headX} y2={headY}
          stroke="#ffffff"
          strokeWidth={2}
          strokeLinecap="round"
        />

        {/* Arms */}
        <line
          x1={armX - tx * armSpread} y1={armY - ty * armSpread}
          x2={armX + tx * armSpread} y2={armY + ty * armSpread}
          stroke="#ffffff"
          strokeWidth={1.5}
          strokeLinecap="round"
        />

        {/* Head */}
        <circle
          cx={headX}
          cy={headY}
          r={3.5}
          fill="#ffffff"
          stroke={sColor}
          strokeWidth={1}
          style={{ transition: 'stroke 0.15s ease' }}
        />
      </g>

      {/* Contact point */}
      {isRiding && (
        <circle
          cx={x}
          cy={y}
          r={2}
          fill={sColor}
          opacity={0.6}
        />
      )}
    </g>
  )
}

export default memo(SurferComponent)
