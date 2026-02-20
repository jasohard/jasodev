import { memo } from 'react'
import { BOARD_WIDTH, BOARD_PADDING_X, BOARD_HEIGHT, BOARD_PADDING_BOTTOM } from '../engine'

interface HistogramProps {
  bins: number[]
  targetDistribution: number[]
  totalBalls: number
}

const BIN_AREA_TOP = BOARD_HEIGHT - BOARD_PADDING_BOTTOM + 10
const BIN_AREA_HEIGHT = BOARD_PADDING_BOTTOM - 30
const BIN_AREA_LEFT = BOARD_PADDING_X
const BIN_AREA_WIDTH = BOARD_WIDTH - BOARD_PADDING_X * 2

function HistogramComponent({ bins, targetDistribution, totalBalls }: HistogramProps) {
  const binCount = bins.length
  const binWidth = BIN_AREA_WIDTH / binCount
  const gap = 3

  // Determine max height scaling
  const maxCount = Math.max(...bins, 1)
  const maxTargetProportion = Math.max(...targetDistribution)
  const maxProportion = totalBalls > 0
    ? Math.max(maxCount / totalBalls, maxTargetProportion)
    : maxTargetProportion

  const scaleY = maxProportion > 0 ? (BIN_AREA_HEIGHT - 10) / maxProportion : 1

  // Target distribution outline points
  const targetPoints = targetDistribution.map((t, i) => {
    const cx = BIN_AREA_LEFT + i * binWidth + binWidth / 2
    const h = t * scaleY
    const cy = BIN_AREA_TOP + BIN_AREA_HEIGHT - h
    return `${cx},${cy}`
  })
  const targetPath = targetPoints.join(' ')

  return (
    <g>
      {/* Bin separators */}
      {Array.from({ length: binCount + 1 }).map((_, i) => (
        <line
          key={`sep-${i}`}
          x1={BIN_AREA_LEFT + i * binWidth}
          y1={BIN_AREA_TOP}
          x2={BIN_AREA_LEFT + i * binWidth}
          y2={BIN_AREA_TOP + BIN_AREA_HEIGHT}
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={1}
        />
      ))}

      {/* Bottom line */}
      <line
        x1={BIN_AREA_LEFT}
        y1={BIN_AREA_TOP + BIN_AREA_HEIGHT}
        x2={BIN_AREA_LEFT + BIN_AREA_WIDTH}
        y2={BIN_AREA_TOP + BIN_AREA_HEIGHT}
        stroke="rgba(255,255,255,0.2)"
        strokeWidth={1}
      />

      {/* Actual histogram bars */}
      {bins.map((count, i) => {
        if (totalBalls === 0) return null
        const proportion = count / totalBalls
        const barH = proportion * scaleY
        const barX = BIN_AREA_LEFT + i * binWidth + gap
        const barW = binWidth - gap * 2
        const barY = BIN_AREA_TOP + BIN_AREA_HEIGHT - barH

        // Check if this bin exceeds the target (overshoot)
        const targetProp = targetDistribution[i] ?? 0
        const isOver = proportion > targetProp * 1.3

        return (
          <g key={`bar-${i}`}>
            <rect
              x={barX}
              y={barY}
              width={Math.max(0, barW)}
              height={Math.max(0, barH)}
              rx={2}
              fill={isOver ? 'rgba(244, 67, 54, 0.7)' : 'rgba(108, 92, 231, 0.7)'}
              style={{
                transition: 'height 0.15s ease-out, y 0.15s ease-out, fill 0.3s ease',
              }}
            />
            {/* Count label */}
            {count > 0 && (
              <text
                x={BIN_AREA_LEFT + i * binWidth + binWidth / 2}
                y={barY - 4}
                fill="#e8e8f0"
                fontSize={9}
                textAnchor="middle"
                fontFamily="monospace"
              >
                {count}
              </text>
            )}
          </g>
        )
      })}

      {/* Target distribution overlay line */}
      <polyline
        points={targetPath}
        fill="none"
        stroke="#00d2d3"
        strokeWidth={2}
        strokeDasharray="6 3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Target dots */}
      {targetDistribution.map((t, i) => {
        const cx = BIN_AREA_LEFT + i * binWidth + binWidth / 2
        const h = t * scaleY
        const cy = BIN_AREA_TOP + BIN_AREA_HEIGHT - h
        return (
          <circle
            key={`tdot-${i}`}
            cx={cx}
            cy={cy}
            r={3}
            fill="#00d2d3"
          />
        )
      })}

      {/* Bin labels */}
      {bins.map((_, i) => (
        <text
          key={`label-${i}`}
          x={BIN_AREA_LEFT + i * binWidth + binWidth / 2}
          y={BIN_AREA_TOP + BIN_AREA_HEIGHT + 14}
          fill="rgba(255,255,255,0.5)"
          fontSize={9}
          textAnchor="middle"
          fontFamily="monospace"
        >
          {i + 1}
        </text>
      ))}
    </g>
  )
}

export default memo(HistogramComponent)
