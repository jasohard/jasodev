import { memo } from 'react'
import { BOARD_WIDTH } from '../engine'

interface FuelGaugeProps {
  fuelUsed: number
  fuelBudget: number
}

const GAUGE_WIDTH = 140
const GAUGE_HEIGHT = 12
const GAUGE_X = BOARD_WIDTH - GAUGE_WIDTH - 16
const GAUGE_Y = 14

function FuelGaugeComponent({ fuelUsed, fuelBudget }: FuelGaugeProps) {
  if (fuelBudget <= 0) return null

  const pct = Math.min(1, fuelUsed / fuelBudget)
  const remaining = 1 - pct
  const isOver = pct > 1
  const isLow = pct > 0.75

  let fillColor: string
  if (isOver) fillColor = '#f44336'
  else if (isLow) fillColor = '#ff9800'
  else fillColor = '#4caf50'

  return (
    <g>
      {/* Label */}
      <text
        x={GAUGE_X - 4}
        y={GAUGE_Y + GAUGE_HEIGHT / 2 + 1}
        fill="rgba(255,255,255,0.6)"
        fontSize={9}
        fontFamily="monospace"
        textAnchor="end"
        dominantBaseline="middle"
      >
        Fuel
      </text>

      {/* Background */}
      <rect
        x={GAUGE_X}
        y={GAUGE_Y}
        width={GAUGE_WIDTH}
        height={GAUGE_HEIGHT}
        rx={6}
        fill="rgba(255,255,255,0.08)"
      />

      {/* Fill */}
      <rect
        x={GAUGE_X}
        y={GAUGE_Y}
        width={Math.max(0, remaining * GAUGE_WIDTH)}
        height={GAUGE_HEIGHT}
        rx={6}
        fill={fillColor}
        opacity={0.7}
        style={{ transition: 'width 0.15s ease, fill 0.3s ease' }}
      />

      {/* Percentage text */}
      <text
        x={GAUGE_X + GAUGE_WIDTH / 2}
        y={GAUGE_Y + GAUGE_HEIGHT / 2 + 1}
        fill="#fff"
        fontSize={8}
        fontWeight="bold"
        fontFamily="monospace"
        textAnchor="middle"
        dominantBaseline="middle"
      >
        {Math.round(fuelUsed)}/{fuelBudget}
      </text>
    </g>
  )
}

export default memo(FuelGaugeComponent)
