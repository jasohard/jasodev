import { memo } from 'react'
import type { Peg } from '../types'
import { pegPosition, pegColor, PEG_RADIUS } from '../engine'

interface PegGridProps {
  pegs: Peg[][]
  totalRows: number
  selectedPeg: { row: number; col: number } | null
  onPegTap: (row: number, col: number) => void
}

function PegGridComponent({ pegs, totalRows, selectedPeg, onPegTap }: PegGridProps) {
  return (
    <g>
      {pegs.map((row, rowIdx) =>
        row.map((peg, colIdx) => {
          const pos = pegPosition(rowIdx, colIdx, totalRows)
          const isSelected =
            selectedPeg?.row === rowIdx && selectedPeg?.col === colIdx
          const color = pegColor(peg.leftProb)

          return (
            <g key={`${rowIdx}-${colIdx}`}>
              {/* Invisible larger tap target */}
              <circle
                cx={pos.x}
                cy={pos.y}
                r={22}
                fill="transparent"
                style={{ cursor: peg.locked ? 'default' : 'pointer' }}
                onPointerDown={(e) => {
                  if (!peg.locked) {
                    e.stopPropagation()
                    onPegTap(rowIdx, colIdx)
                  }
                }}
              />
              {/* Visible peg */}
              <circle
                cx={pos.x}
                cy={pos.y}
                r={PEG_RADIUS}
                fill={color}
                stroke={isSelected ? '#fff' : 'rgba(255,255,255,0.15)'}
                strokeWidth={isSelected ? 2.5 : 1}
                style={{ transition: 'fill 0.2s ease, stroke 0.2s ease' }}
              />
              {/* Selection pulse animation */}
              {isSelected && (
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={PEG_RADIUS + 4}
                  fill="none"
                  stroke="#fff"
                  strokeWidth={1.5}
                  opacity={0.6}
                >
                  <animate
                    attributeName="r"
                    values={`${PEG_RADIUS + 4};${PEG_RADIUS + 10};${PEG_RADIUS + 4}`}
                    dur="1.5s"
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="opacity"
                    values="0.6;0.1;0.6"
                    dur="1.5s"
                    repeatCount="indefinite"
                  />
                </circle>
              )}
            </g>
          )
        })
      )}
    </g>
  )
}

export default memo(PegGridComponent)
