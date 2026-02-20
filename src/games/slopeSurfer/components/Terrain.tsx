/**
 * Terrain — Renders the mountain curve as a filled SVG path with gradient.
 * Also renders speed-colored overlay when enabled.
 */

import { memo, useMemo } from 'react'
import { curveAreaPath, curvePath, BOARD_HEIGHT, classifySpeed, speedColor, numericalDerivative } from '../engine'

interface TerrainProps {
  curveFunc: (x: number) => number
  xStart: number
  xEnd: number
  showSpeedOverlay: boolean
}

function TerrainComponent({ curveFunc, xStart, xEnd, showSpeedOverlay }: TerrainProps) {
  const areaPath = useMemo(
    () => curveAreaPath(curveFunc, xStart, xEnd, BOARD_HEIGHT + 10),
    [curveFunc, xStart, xEnd]
  )

  const linePath = useMemo(
    () => curvePath(curveFunc, xStart, xEnd),
    [curveFunc, xStart, xEnd]
  )

  // Speed segments for overlay
  const speedSegments = useMemo(() => {
    if (!showSpeedOverlay) return null
    const segments: { d: string; color: string }[] = []
    const steps = 100
    const dx = (xEnd - xStart) / steps
    let currentColor = ''
    let currentPath = ''

    for (let i = 0; i <= steps; i++) {
      const x = xStart + i * dx
      const y = curveFunc(x)
      const deriv = numericalDerivative(curveFunc, x)
      const cls = classifySpeed(Math.abs(deriv))
      const color = speedColor(cls)

      if (color !== currentColor) {
        if (currentPath) {
          segments.push({ d: currentPath, color: currentColor })
        }
        currentColor = color
        currentPath = `M${x},${y}`
      } else {
        currentPath += ` L${x},${y}`
      }
    }
    if (currentPath) {
      segments.push({ d: currentPath, color: currentColor })
    }
    return segments
  }, [showSpeedOverlay, curveFunc, xStart, xEnd])

  return (
    <g>
      {/* Gradient defs */}
      <defs>
        <linearGradient id="terrainGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#a8edea" />
          <stop offset="100%" stopColor="#fed6e3" />
        </linearGradient>
        <linearGradient id="terrainFillGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#a8edea" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#0b0f1a" stopOpacity="0.05" />
        </linearGradient>
      </defs>

      {/* Filled terrain area */}
      <path
        d={areaPath}
        fill="url(#terrainFillGrad)"
        style={{ pointerEvents: 'none' }}
      />

      {/* Main curve line */}
      <path
        d={linePath}
        fill="none"
        stroke="url(#terrainGrad)"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ pointerEvents: 'none' }}
      />

      {/* Speed overlay segments */}
      {speedSegments && speedSegments.map((seg, i) => (
        <path
          key={i}
          d={seg.d}
          fill="none"
          stroke={seg.color}
          strokeWidth={3.5}
          strokeLinecap="round"
          opacity={0.6}
          style={{ pointerEvents: 'none' }}
        />
      ))}
    </g>
  )
}

export default memo(TerrainComponent)
