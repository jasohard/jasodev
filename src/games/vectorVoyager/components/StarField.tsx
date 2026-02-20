import { memo, useMemo } from 'react'
import { generateStarField } from '../engine'

function StarFieldComponent() {
  const stars = useMemo(() => generateStarField(50), [])

  return (
    <g>
      {stars.map((s, i) => (
        <circle
          key={i}
          cx={s.x}
          cy={s.y}
          r={s.r}
          fill="#fff"
          opacity={s.opacity}
        />
      ))}
    </g>
  )
}

export default memo(StarFieldComponent)
