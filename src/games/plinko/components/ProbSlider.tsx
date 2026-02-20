import { useCallback, useRef } from 'react'
import type { Peg } from '../types'
import { pegPosition, BOARD_WIDTH } from '../engine'

interface ProbSliderProps {
  peg: Peg
  totalRows: number
  onProbChange: (row: number, col: number, prob: number) => void
  onClose: () => void
}

const SLIDER_WIDTH = 120
const SLIDER_HEIGHT = 28
const HANDLE_R = 10

export default function ProbSlider({ peg, totalRows, onProbChange, onClose }: ProbSliderProps) {
  const pos = pegPosition(peg.row, peg.col, totalRows)
  const dragging = useRef(false)
  const svgRef = useRef<SVGGElement>(null)

  // Position the slider above the peg
  let sliderX = pos.x - SLIDER_WIDTH / 2
  // Clamp within board
  sliderX = Math.max(8, Math.min(BOARD_WIDTH - SLIDER_WIDTH - 8, sliderX))
  const sliderY = pos.y - 40

  const handlePos = sliderX + peg.leftProb * SLIDER_WIDTH

  const getProbFromPointer = useCallback(
    (clientX: number) => {
      const svg = svgRef.current?.closest('svg')
      if (!svg) return peg.leftProb

      const pt = svg.createSVGPoint()
      pt.x = clientX
      pt.y = 0
      const ctm = svg.getScreenCTM()
      if (!ctm) return peg.leftProb
      const svgPt = pt.matrixTransform(ctm.inverse())
      const rawProb = (svgPt.x - sliderX) / SLIDER_WIDTH
      // Snap to nearest 5%
      const snapped = Math.round(rawProb * 20) / 20
      return Math.max(0, Math.min(1, snapped))
    },
    [sliderX, peg.leftProb]
  )

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.stopPropagation()
      e.preventDefault()
      dragging.current = true
      ;(e.target as SVGElement).setPointerCapture(e.pointerId)
      const prob = getProbFromPointer(e.clientX)
      onProbChange(peg.row, peg.col, prob)
    },
    [getProbFromPointer, onProbChange, peg.row, peg.col]
  )

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging.current) return
      e.stopPropagation()
      const prob = getProbFromPointer(e.clientX)
      onProbChange(peg.row, peg.col, prob)
    },
    [getProbFromPointer, onProbChange, peg.row, peg.col]
  )

  const onPointerUp = useCallback((e: React.PointerEvent) => {
    e.stopPropagation()
    dragging.current = false
  }, [])

  return (
    <g ref={svgRef}>
      {/* Background dismiss area */}
      <rect
        x={0}
        y={0}
        width={BOARD_WIDTH}
        height={600}
        fill="transparent"
        onPointerDown={(e) => {
          e.stopPropagation()
          onClose()
        }}
      />

      {/* Slider background panel */}
      <rect
        x={sliderX - 12}
        y={sliderY - 10}
        width={SLIDER_WIDTH + 24}
        height={SLIDER_HEIGHT + 20}
        rx={8}
        fill="rgba(20, 20, 40, 0.95)"
        stroke="rgba(255,255,255,0.2)"
        strokeWidth={1}
      />

      {/* L label */}
      <text
        x={sliderX - 6}
        y={sliderY + SLIDER_HEIGHT / 2 + 1}
        fill="#4fc3f7"
        fontSize={10}
        fontWeight="bold"
        textAnchor="middle"
        dominantBaseline="middle"
      >
        L
      </text>

      {/* R label */}
      <text
        x={sliderX + SLIDER_WIDTH + 6}
        y={sliderY + SLIDER_HEIGHT / 2 + 1}
        fill="#ffb74d"
        fontSize={10}
        fontWeight="bold"
        textAnchor="middle"
        dominantBaseline="middle"
      >
        R
      </text>

      {/* Track background */}
      <rect
        x={sliderX}
        y={sliderY + SLIDER_HEIGHT / 2 - 3}
        width={SLIDER_WIDTH}
        height={6}
        rx={3}
        fill="rgba(255,255,255,0.15)"
      />

      {/* Left fill (blue) */}
      <rect
        x={sliderX}
        y={sliderY + SLIDER_HEIGHT / 2 - 3}
        width={peg.leftProb * SLIDER_WIDTH}
        height={6}
        rx={3}
        fill="#4fc3f7"
        opacity={0.6}
      />

      {/* Probability label */}
      <text
        x={sliderX + SLIDER_WIDTH / 2}
        y={sliderY - 2}
        fill="#e8e8f0"
        fontSize={9}
        textAnchor="middle"
        fontFamily="monospace"
      >
        {Math.round(peg.leftProb * 100)}% L / {Math.round((1 - peg.leftProb) * 100)}% R
      </text>

      {/* Draggable handle */}
      <circle
        cx={handlePos}
        cy={sliderY + SLIDER_HEIGHT / 2}
        r={HANDLE_R}
        fill="#fff"
        stroke="#7c5cbf"
        strokeWidth={2.5}
        style={{ cursor: 'grab', touchAction: 'none' }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      />
    </g>
  )
}
