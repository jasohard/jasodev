/**
 * ControlPoints — Draggable handles that reshape the terrain curve.
 * Vertical-only drag with visual rails.
 */

import { memo, useCallback, useRef } from 'react'
import type { ControlPoint } from '../types'

interface ControlPointsProps {
  points: ControlPoint[]
  enabled: boolean
  onDrag: (id: number, y: number) => void
  svgRef: React.RefObject<SVGSVGElement | null>
}

function ControlPointsComponent({ points, enabled, onDrag, svgRef }: ControlPointsProps) {
  const draggingId = useRef<number | null>(null)

  const pointerToSVG = useCallback((e: React.PointerEvent): number => {
    const svg = svgRef.current
    if (!svg || !svg.getScreenCTM) return 0
    const ctm = svg.getScreenCTM()
    if (!ctm) return 0
    const inv = ctm.inverse()
    return e.clientX * inv.b + e.clientY * inv.d + inv.f
  }, [svgRef])

  const handlePointerDown = useCallback((e: React.PointerEvent, id: number) => {
    if (!enabled) return
    e.stopPropagation()
    const target = e.currentTarget as Element
    target.setPointerCapture(e.pointerId)
    draggingId.current = id
  }, [enabled])

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (draggingId.current === null) return
    const y = pointerToSVG(e)
    onDrag(draggingId.current, y)
  }, [pointerToSVG, onDrag])

  const handlePointerUp = useCallback(() => {
    draggingId.current = null
  }, [])

  return (
    <g>
      {points.map(cp => {
        if (cp.fixed) return null
        return (
          <g key={cp.id}>
            {/* Vertical rail (drag guide) */}
            <line
              x1={cp.x}
              y1={cp.minY}
              x2={cp.x}
              y2={cp.maxY}
              stroke="#00e5ff"
              strokeWidth={1}
              strokeDasharray="3 3"
              opacity={enabled ? 0.25 : 0.1}
              style={{ pointerEvents: 'none' }}
            />

            {/* Invisible touch target (52px) */}
            <circle
              cx={cp.x}
              cy={cp.y}
              r={26}
              fill="transparent"
              style={{
                cursor: enabled ? 'ns-resize' : 'default',
                touchAction: 'none',
              }}
              onPointerDown={e => handlePointerDown(e, cp.id)}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
            />

            {/* Visible control point */}
            <circle
              cx={cp.x}
              cy={cp.y}
              r={8}
              fill="#0b0f1a"
              stroke="#00e5ff"
              strokeWidth={2}
              opacity={enabled ? 1 : 0.4}
              style={{
                pointerEvents: 'none',
                transition: 'opacity 0.2s ease',
              }}
            />

            {/* Inner glow */}
            <circle
              cx={cp.x}
              cy={cp.y}
              r={4}
              fill="#00e5ff"
              opacity={enabled ? 0.5 : 0.2}
              style={{ pointerEvents: 'none' }}
            />

            {/* Pulse animation when planning */}
            {enabled && (
              <circle
                cx={cp.x}
                cy={cp.y}
                r={8}
                fill="none"
                stroke="#00e5ff"
                strokeWidth={1}
                opacity={0}
              >
                <animate
                  attributeName="r"
                  values="8;16;8"
                  dur="2s"
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="opacity"
                  values="0.4;0;0.4"
                  dur="2s"
                  repeatCount="indefinite"
                />
              </circle>
            )}
          </g>
        )
      })}
    </g>
  )
}

export default memo(ControlPointsComponent)
