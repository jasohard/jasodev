import { memo } from 'react'
import { BOARD_WIDTH, BOARD_HEIGHT } from '../engine'

const GRID_STEP = 40

function GridOverlayComponent() {
  const lines: JSX.Element[] = []
  // Vertical lines
  for (let x = GRID_STEP; x < BOARD_WIDTH; x += GRID_STEP) {
    lines.push(
      <line
        key={`v${x}`}
        x1={x} y1={0} x2={x} y2={BOARD_HEIGHT}
        stroke="rgba(255,255,255,0.04)"
        strokeWidth={0.5}
      />
    )
  }
  // Horizontal lines
  for (let y = GRID_STEP; y < BOARD_HEIGHT; y += GRID_STEP) {
    lines.push(
      <line
        key={`h${y}`}
        x1={0} y1={y} x2={BOARD_WIDTH} y2={y}
        stroke="rgba(255,255,255,0.04)"
        strokeWidth={0.5}
      />
    )
  }
  return <g>{lines}</g>
}

export default memo(GridOverlayComponent)
