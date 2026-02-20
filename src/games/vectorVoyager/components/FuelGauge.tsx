import { memo } from 'react'
import { BOARD_WIDTH } from '../engine'

interface WellCounterProps {
  wellCount: number
  wellPar: number
  maxWells: number
}

const COUNTER_X = BOARD_WIDTH - 120
const COUNTER_Y = 12

/** SVG overlay showing gravity well count and star thresholds */
function WellCounterComponent({ wellCount, wellPar, maxWells }: WellCounterProps) {
  const atMax = wellCount >= maxWells

  // Color based on star rating at current count
  let color: string
  if (wellCount <= wellPar) color = '#ffd700' // 3-star zone (gold)
  else if (wellCount <= wellPar + 1) color = '#4caf50' // 2-star zone (green)
  else if (wellCount <= wellPar + 2) color = '#ff9800' // 1-star zone (orange)
  else color = '#f44336' // over max

  return (
    <g>
      {/* Well icon */}
      <circle
        cx={COUNTER_X}
        cy={COUNTER_Y + 5}
        r={5}
        fill="none"
        stroke="#ce93d8"
        strokeWidth={1.2}
        opacity={0.7}
      />
      <circle
        cx={COUNTER_X}
        cy={COUNTER_Y + 5}
        r={2}
        fill="#ce93d8"
        opacity={0.7}
      />

      {/* Count */}
      <text
        x={COUNTER_X + 12}
        y={COUNTER_Y + 9}
        fill={color}
        fontSize={11}
        fontWeight="bold"
        fontFamily="monospace"
      >
        {wellCount}/{maxWells}
      </text>

      {/* Par label */}
      <text
        x={COUNTER_X + 50}
        y={COUNTER_Y + 9}
        fill="rgba(255,255,255,0.45)"
        fontSize={9}
        fontFamily="monospace"
      >
        par {wellPar}
      </text>

      {/* Max wells warning */}
      {atMax && (
        <text
          x={COUNTER_X + 12}
          y={COUNTER_Y + 22}
          fill="#f44336"
          fontSize={8}
          fontFamily="monospace"
          opacity={0.8}
        >
          MAX
        </text>
      )}
    </g>
  )
}

export default memo(WellCounterComponent)
