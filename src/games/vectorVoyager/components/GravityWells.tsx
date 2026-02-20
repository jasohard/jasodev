import { memo } from 'react'
import type { GravityWell } from '../types'

interface GravityWellsProps {
  wells: GravityWell[]
  selectedWellId: number | null
  onSelectWell: (id: number) => void
}

/** Purple/violet concentric rings for gravity wells */
function GravityWellsComponent({ wells, selectedWellId, onSelectWell }: GravityWellsProps) {
  return (
    <g>
      {wells.map((well) => {
        const isSelected = well.id === selectedWellId
        const ringCount = Math.min(well.strength + 1, 5)
        const maxR = 10 + well.strength * 6

        return (
          <g key={well.id}>
            {/* Outer glow */}
            <circle
              cx={well.x}
              cy={well.y}
              r={maxR + 8}
              fill={`rgba(156, 39, 176, ${0.04 * well.strength})`}
            />

            {/* Concentric rings — whirlpool effect */}
            {Array.from({ length: ringCount }, (_, i) => {
              const r = maxR * ((i + 1) / ringCount)
              const opacity = 0.15 + (i / ringCount) * 0.45
              return (
                <circle
                  key={i}
                  cx={well.x}
                  cy={well.y}
                  r={r}
                  fill="none"
                  stroke={isSelected ? '#e040fb' : '#9c27b0'}
                  strokeWidth={isSelected ? 1.8 : 1.2}
                  opacity={opacity}
                  strokeDasharray={i === ringCount - 1 ? 'none' : `${3 + i * 2} ${2 + i}`}
                >
                  <animate
                    attributeName="stroke-dashoffset"
                    values={`0;${(i % 2 === 0 ? 1 : -1) * (12 + i * 4)}`}
                    dur={`${2 + i * 0.5}s`}
                    repeatCount="indefinite"
                  />
                </circle>
              )
            })}

            {/* Center dot */}
            <circle
              cx={well.x}
              cy={well.y}
              r={3.5}
              fill={isSelected ? '#e040fb' : '#ce93d8'}
            />

            {/* Strength label */}
            <text
              x={well.x}
              y={well.y - maxR - 6}
              textAnchor="middle"
              fontSize={9}
              fontFamily="monospace"
              fill="#ce93d8"
              opacity={0.7}
              style={{ pointerEvents: 'none' }}
            >
              {well.strength}x
            </text>

            {/* Selection highlight ring */}
            {isSelected && (
              <circle
                cx={well.x}
                cy={well.y}
                r={maxR + 4}
                fill="none"
                stroke="#e040fb"
                strokeWidth={1.5}
                strokeDasharray="4 3"
                opacity={0.6}
              >
                <animate
                  attributeName="stroke-dashoffset"
                  values="0;14"
                  dur="0.8s"
                  repeatCount="indefinite"
                />
              </circle>
            )}

            {/* Invisible tap target — 44px minimum */}
            <circle
              cx={well.x}
              cy={well.y}
              r={Math.max(22, maxR)}
              fill="transparent"
              style={{ cursor: 'pointer' }}
              onPointerDown={(e) => {
                e.stopPropagation()
                onSelectWell(well.id)
              }}
            />
          </g>
        )
      })}
    </g>
  )
}

export default memo(GravityWellsComponent)
