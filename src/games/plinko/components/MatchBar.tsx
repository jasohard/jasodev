import { memo } from 'react'

interface MatchBarProps {
  matchPercent: number
  stars: 0 | 1 | 2 | 3
}

function MatchBarComponent({ matchPercent, stars }: MatchBarProps) {
  // Color gradient: red (0) → yellow (50) → green (100)
  let barColor: string
  if (matchPercent < 40) {
    barColor = '#f44336'
  } else if (matchPercent < 70) {
    barColor = '#ff9800'
  } else if (matchPercent < 85) {
    barColor = '#ffc107'
  } else {
    barColor = '#4caf50'
  }

  const starDisplay = [1, 2, 3].map((n) => (
    <text
      key={n}
      x={270 + n * 22}
      y={18}
      fontSize={16}
      textAnchor="middle"
      dominantBaseline="middle"
      fill={n <= stars ? '#ffd32a' : 'rgba(255,255,255,0.2)'}
      style={{ transition: 'fill 0.3s ease' }}
    >
      {n <= stars ? '\u2605' : '\u2606'}
    </text>
  ))

  return (
    <g>
      {/* Match % label */}
      <text
        x={12}
        y={18}
        fill="#e8e8f0"
        fontSize={12}
        fontWeight="bold"
        dominantBaseline="middle"
      >
        Match
      </text>

      {/* Bar background */}
      <rect
        x={56}
        y={10}
        width={200}
        height={16}
        rx={8}
        fill="rgba(255,255,255,0.1)"
      />

      {/* Bar fill */}
      <rect
        x={56}
        y={10}
        width={Math.max(0, (matchPercent / 100) * 200)}
        height={16}
        rx={8}
        fill={barColor}
        opacity={0.85}
        style={{ transition: 'width 0.3s ease-out, fill 0.3s ease' }}
      />

      {/* Percentage text */}
      <text
        x={156}
        y={18}
        fill="#fff"
        fontSize={10}
        fontWeight="bold"
        textAnchor="middle"
        dominantBaseline="middle"
        fontFamily="monospace"
      >
        {matchPercent.toFixed(1)}%
      </text>

      {/* Stars */}
      {starDisplay}
    </g>
  )
}

export default memo(MatchBarComponent)
