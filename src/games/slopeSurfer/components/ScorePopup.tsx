/**
 * ScorePopup — Animated score text that pops up and fades when gems are collected.
 * Uses SVG animate elements for performance (no React state updates).
 */

import { memo } from 'react'

interface ScorePopupItem {
  id: number
  x: number
  y: number
  text: string
  color: string
}

interface ScorePopupProps {
  items: ScorePopupItem[]
}

function ScorePopupComponent({ items }: ScorePopupProps) {
  return (
    <g style={{ pointerEvents: 'none' }}>
      {items.map(item => (
        <text
          key={item.id}
          x={item.x}
          y={item.y}
          textAnchor="middle"
          fill={item.color}
          fontSize={13}
          fontWeight="bold"
          fontFamily="var(--font-mono, monospace)"
        >
          {item.text}
          {/* Rise up animation */}
          <animate
            attributeName="y"
            from={item.y}
            to={item.y - 30}
            dur="0.8s"
            fill="freeze"
          />
          {/* Fade out */}
          <animate
            attributeName="opacity"
            from="1"
            to="0"
            dur="0.8s"
            fill="freeze"
          />
          {/* Scale up then shrink */}
          <animate
            attributeName="font-size"
            values="13;16;12"
            dur="0.4s"
            fill="freeze"
          />
        </text>
      ))}
    </g>
  )
}

export default memo(ScorePopupComponent)

export type { ScorePopupItem }
