import { memo } from 'react'
import type { GameVector, Vec2 } from '../types'
import { vectorColor, vecSub, vecLen, vecAngleDeg } from '../engine'

interface VectorArrowsProps {
  vectors: GameVector[]
  /** Index of vector currently being dragged, or -1 */
  draggingIdx: number
  showComponents: boolean
  /** The resultant end point (last endpoint in the chain) */
  resultantEnd: Vec2 | null
  /** Ship starting position */
  shipStart: Vec2
}

function VectorArrowsComponent({
  vectors,
  draggingIdx,
  showComponents,
  resultantEnd,
  shipStart,
}: VectorArrowsProps) {
  return (
    <g>
      {/* Path preview — dashed polyline connecting all points */}
      {vectors.length > 0 && (
        <polyline
          points={[shipStart, ...vectors.map((v) => v.end)]
            .map((p) => `${p.x},${p.y}`)
            .join(' ')}
          fill="none"
          stroke="rgba(255,255,255,0.15)"
          strokeWidth={1.5}
          strokeDasharray="6 4"
        />
      )}

      {/* Each vector arrow */}
      {vectors.map((v, i) => {
        const color = vectorColor(i)
        const d = vecSub(v.end, v.start)
        const len = vecLen(d)
        const angleDeg = vecAngleDeg(d)
        const midX = (v.start.x + v.end.x) / 2
        const midY = (v.start.y + v.end.y) / 2
        const isDragging = i === draggingIdx

        // Arrowhead triangle
        const angle = Math.atan2(d.y, d.x)
        const headLen = 10
        const headWidth = 6
        const tip = v.end
        const left = {
          x: tip.x - headLen * Math.cos(angle) + headWidth * Math.sin(angle),
          y: tip.y - headLen * Math.sin(angle) - headWidth * Math.cos(angle),
        }
        const right = {
          x: tip.x - headLen * Math.cos(angle) - headWidth * Math.sin(angle),
          y: tip.y - headLen * Math.sin(angle) + headWidth * Math.cos(angle),
        }

        return (
          <g key={v.id}>
            {/* Component lines (x and y dashed) — show while dragging or if showComponents */}
            {(isDragging || showComponents) && len > 15 && (
              <>
                <line
                  x1={v.start.x}
                  y1={v.start.y}
                  x2={v.end.x}
                  y2={v.start.y}
                  stroke={color}
                  strokeWidth={1}
                  strokeDasharray="4 3"
                  opacity={0.35}
                />
                <line
                  x1={v.end.x}
                  y1={v.start.y}
                  x2={v.end.x}
                  y2={v.end.y}
                  stroke={color}
                  strokeWidth={1}
                  strokeDasharray="4 3"
                  opacity={0.35}
                />
              </>
            )}

            {/* Shaft */}
            <line
              x1={v.start.x}
              y1={v.start.y}
              x2={v.end.x}
              y2={v.end.y}
              stroke={color}
              strokeWidth={isDragging ? 4 : 3}
              strokeLinecap="round"
              opacity={0.9}
            />

            {/* Arrowhead */}
            {len > 8 && (
              <polygon
                points={`${tip.x},${tip.y} ${left.x},${left.y} ${right.x},${right.y}`}
                fill={color}
                opacity={0.9}
              />
            )}

            {/* Invisible fat touch target on arrowhead */}
            <circle
              cx={v.end.x}
              cy={v.end.y}
              r={24}
              fill="transparent"
              style={{ cursor: 'grab' }}
              data-vector-handle={i}
            />

            {/* Label: magnitude & angle */}
            {len > 20 && (
              <text
                x={midX}
                y={midY - 10}
                fill={color}
                fontSize={10}
                fontFamily="monospace"
                textAnchor="middle"
                opacity={0.8}
                style={{ pointerEvents: 'none' }}
              >
                {len.toFixed(0)}px {angleDeg >= 0 ? '+' : ''}{angleDeg.toFixed(0)}°
              </text>
            )}
          </g>
        )
      })}

      {/* Resultant vector (white dashed, from shipStart to final end) */}
      {resultantEnd && vectors.length >= 2 && (
        <>
          <line
            x1={shipStart.x}
            y1={shipStart.y}
            x2={resultantEnd.x}
            y2={resultantEnd.y}
            stroke="#fff"
            strokeWidth={2}
            strokeDasharray="8 5"
            opacity={0.45}
          />
          {/* Small arrowhead on resultant */}
          {(() => {
            const rd = vecSub(resultantEnd, shipStart)
            const rLen = vecLen(rd)
            if (rLen < 15) return null
            const rAngle = Math.atan2(rd.y, rd.x)
            const tip = resultantEnd
            const hl = 8
            const hw = 4
            return (
              <polygon
                points={`${tip.x},${tip.y} ${tip.x - hl * Math.cos(rAngle) + hw * Math.sin(rAngle)},${tip.y - hl * Math.sin(rAngle) - hw * Math.cos(rAngle)} ${tip.x - hl * Math.cos(rAngle) - hw * Math.sin(rAngle)},${tip.y - hl * Math.sin(rAngle) + hw * Math.cos(rAngle)}`}
                fill="#fff"
                opacity={0.4}
              />
            )
          })()}
        </>
      )}
    </g>
  )
}

export default memo(VectorArrowsComponent)
