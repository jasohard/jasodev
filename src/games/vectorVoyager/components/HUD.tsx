import { memo } from 'react'

interface HUDProps {
  stars: 0 | 1 | 2 | 3
  vectorCount: number
  par: number
}

function HUDComponent({ stars, vectorCount, par }: HUDProps) {
  return (
    <g>
      {/* Stars */}
      {[1, 2, 3].map((n) => (
        <text
          key={n}
          x={10 + (n - 1) * 20}
          y={22}
          fontSize={16}
          fill={n <= stars ? '#ffd700' : 'rgba(255,255,255,0.2)'}
          style={{ transition: 'fill 0.3s ease' }}
        >
          {n <= stars ? '\u2605' : '\u2606'}
        </text>
      ))}

      {/* Vector count / par */}
      <text
        x={80}
        y={22}
        fill="rgba(255,255,255,0.6)"
        fontSize={10}
        fontFamily="monospace"
      >
        Vectors: {vectorCount} / Par: {par}
      </text>
    </g>
  )
}

export default memo(HUDComponent)
