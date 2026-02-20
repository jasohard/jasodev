/**
 * ScorePopup — Animated score text that pops up and fades when gems are collected.
 */

import { memo, useState, useEffect, useCallback } from 'react'

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
        <PopupText key={item.id} item={item} />
      ))}
    </g>
  )
}

function PopupText({ item }: { item: ScorePopupItem }) {
  const [offset, setOffset] = useState(0)
  const [opacity, setOpacity] = useState(1)

  const animate = useCallback(() => {
    let start: number | null = null
    const duration = 800

    const step = (timestamp: number) => {
      if (start === null) start = timestamp
      const elapsed = timestamp - start
      const progress = Math.min(elapsed / duration, 1)

      setOffset(-30 * progress)
      setOpacity(1 - progress * progress)

      if (progress < 1) {
        requestAnimationFrame(step)
      }
    }

    requestAnimationFrame(step)
  }, [])

  useEffect(() => {
    animate()
  }, [animate])

  return (
    <text
      x={item.x}
      y={item.y + offset}
      textAnchor="middle"
      fill={item.color}
      fontSize={12}
      fontWeight="bold"
      fontFamily="var(--font-mono, monospace)"
      opacity={opacity}
    >
      {item.text}
    </text>
  )
}

export default memo(ScorePopupComponent)

export type { ScorePopupItem }
