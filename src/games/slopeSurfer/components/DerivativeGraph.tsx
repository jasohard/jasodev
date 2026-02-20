/**
 * DerivativeGraph — Shows f'(x) as a curve below the main terrain.
 * Real-time trace follows the surfer's position.
 */

import { memo, useMemo } from 'react'
import { numericalDerivative, BOARD_WIDTH } from '../engine'

interface DerivativeGraphProps {
  curveFunc: (x: number) => number
  xStart: number
  xEnd: number
  surferX: number
  isRiding: boolean
  /** Y offset for the graph within the SVG */
  yOffset: number
  graphHeight: number
}

function DerivativeGraphComponent({
  curveFunc,
  xStart,
  xEnd,
  surferX,
  isRiding,
  yOffset,
  graphHeight,
}: DerivativeGraphProps) {
  // Sample derivative values
  const { pathData, zeroY, maxAbsD } = useMemo(() => {
    const samples = 100
    const dx = (xEnd - xStart) / samples
    const derivs: { x: number; d: number }[] = []
    let maxAbs = 0

    for (let i = 0; i <= samples; i++) {
      const x = xStart + i * dx
      const d = numericalDerivative(curveFunc, x)
      derivs.push({ x, d })
      maxAbs = Math.max(maxAbs, Math.abs(d))
    }

    // Scale to fit graph height
    const scale = maxAbs > 0 ? (graphHeight * 0.4) / maxAbs : 1
    const zeroLine = yOffset + graphHeight / 2

    let path = ''
    for (let i = 0; i <= samples; i++) {
      const sx = derivs[i].x
      const sy = zeroLine - derivs[i].d * scale
      path += i === 0 ? `M${sx},${sy}` : ` L${sx},${sy}`
    }

    return { pathData: path, zeroY: zeroLine, maxAbsD: maxAbs }
  }, [curveFunc, xStart, xEnd, yOffset, graphHeight])

  // Current derivative value at surfer position
  const currentDeriv = isRiding
    ? numericalDerivative(curveFunc, surferX)
    : 0
  const scale = maxAbsD > 0 ? (graphHeight * 0.4) / maxAbsD : 1
  const dotY = zeroY - currentDeriv * scale

  return (
    <g style={{ pointerEvents: 'none' }}>
      {/* Background */}
      <rect
        x={0}
        y={yOffset}
        width={BOARD_WIDTH}
        height={graphHeight}
        fill="rgba(11, 15, 26, 0.8)"
        rx={4}
      />

      {/* Zero line */}
      <line
        x1={xStart}
        y1={zeroY}
        x2={xEnd}
        y2={zeroY}
        stroke="rgba(255,255,255,0.15)"
        strokeWidth={1}
        strokeDasharray="4 4"
      />

      {/* f'(x) = 0 label */}
      <text
        x={xStart - 2}
        y={zeroY - 3}
        fill="rgba(255,255,255,0.3)"
        fontSize={7}
        fontFamily="var(--font-mono, monospace)"
        textAnchor="end"
      >
        0
      </text>

      {/* Derivative curve */}
      <path
        d={pathData}
        fill="none"
        stroke="#76ff03"
        strokeWidth={1.5}
        opacity={0.7}
      />

      {/* Label */}
      <text
        x={xStart + 5}
        y={yOffset + 12}
        fill="#76ff03"
        fontSize={9}
        fontFamily="var(--font-mono, monospace)"
        opacity={0.6}
      >
        f&apos;(x)
      </text>

      {/* Current position indicator */}
      {isRiding && surferX >= xStart && surferX <= xEnd && (
        <>
          <line
            x1={surferX}
            y1={yOffset}
            x2={surferX}
            y2={yOffset + graphHeight}
            stroke="#76ff03"
            strokeWidth={1}
            opacity={0.3}
          />
          <circle
            cx={surferX}
            cy={dotY}
            r={3}
            fill="#76ff03"
            opacity={0.9}
          />
          <text
            x={surferX + 6}
            y={dotY - 5}
            fill="#76ff03"
            fontSize={8}
            fontFamily="var(--font-mono, monospace)"
            opacity={0.7}
          >
            {currentDeriv.toFixed(2)}
          </text>
        </>
      )}
    </g>
  )
}

export default memo(DerivativeGraphComponent)
