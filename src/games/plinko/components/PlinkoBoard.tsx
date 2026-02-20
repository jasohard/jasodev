import { useCallback } from 'react'
import type { Peg, ActiveBall, LevelConfig } from '../types'
import PegGrid from './PegGrid'
import ProbSlider from './ProbSlider'
import Histogram from './Histogram'
import BallAnimation from './BallAnimation'
import MatchBar from './MatchBar'
import {
  BOARD_WIDTH,
  BOARD_HEIGHT,
  BOARD_PADDING_TOP,
} from '../engine'

interface PlinkoBoardProps {
  level: LevelConfig
  pegs: Peg[][]
  bins: number[]
  totalBalls: number
  matchPercent: number
  stars: 0 | 1 | 2 | 3
  activeBalls: ActiveBall[]
  selectedPeg: { row: number; col: number } | null
  onPegTap: (row: number, col: number) => void
  onProbChange: (row: number, col: number, prob: number) => void
  onDeselectPeg: () => void
}

export default function PlinkoBoard({
  level,
  pegs,
  bins,
  totalBalls,
  matchPercent,
  stars,
  activeBalls,
  selectedPeg,
  onPegTap,
  onProbChange,
  onDeselectPeg,
}: PlinkoBoardProps) {
  const handleBoardTap = useCallback(() => {
    if (selectedPeg) {
      onDeselectPeg()
    }
  }, [selectedPeg, onDeselectPeg])

  const selectedPegData =
    selectedPeg ? pegs[selectedPeg.row]?.[selectedPeg.col] : null

  return (
    <svg
      viewBox={`0 0 ${BOARD_WIDTH} ${BOARD_HEIGHT}`}
      style={{
        width: '100%',
        maxWidth: 480,
        height: 'auto',
        touchAction: 'none',
        userSelect: 'none',
      }}
      onPointerDown={handleBoardTap}
    >
      {/* Board background */}
      <defs>
        <linearGradient id="boardBg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1a1a2e" />
          <stop offset="100%" stopColor="#14142a" />
        </linearGradient>
        <filter id="ballGlow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <rect
        x={0}
        y={0}
        width={BOARD_WIDTH}
        height={BOARD_HEIGHT}
        rx={16}
        fill="url(#boardBg)"
        stroke="rgba(255,255,255,0.08)"
        strokeWidth={1}
      />

      {/* Match bar at top */}
      <g transform="translate(0, -5)">
        <MatchBar matchPercent={matchPercent} stars={stars} />
      </g>

      {/* Drop point indicator */}
      <g>
        <circle
          cx={BOARD_WIDTH / 2}
          cy={BOARD_PADDING_TOP - 22}
          r={5}
          fill="#fff"
          opacity={0.7}
        />
        <line
          x1={BOARD_WIDTH / 2}
          y1={BOARD_PADDING_TOP - 17}
          x2={BOARD_WIDTH / 2}
          y2={BOARD_PADDING_TOP - 8}
          stroke="#fff"
          strokeWidth={1.5}
          opacity={0.4}
        />
        <polygon
          points={`${BOARD_WIDTH / 2 - 4},${BOARD_PADDING_TOP - 8} ${BOARD_WIDTH / 2 + 4},${BOARD_PADDING_TOP - 8} ${BOARD_WIDTH / 2},${BOARD_PADDING_TOP - 3}`}
          fill="#fff"
          opacity={0.4}
        />
      </g>

      {/* Peg grid */}
      <PegGrid
        pegs={pegs}
        totalRows={level.rows}
        selectedPeg={selectedPeg}
        onPegTap={onPegTap}
      />

      {/* Ball animations */}
      <BallAnimation balls={activeBalls} />

      {/* Histogram */}
      <Histogram
        bins={bins}
        targetDistribution={level.targetDistribution}
        totalBalls={totalBalls}
      />

      {/* Probability slider (rendered on top of everything) */}
      {selectedPegData && !selectedPegData.locked && selectedPeg && (
        <ProbSlider
          peg={selectedPegData}
          totalRows={level.rows}
          onProbChange={onProbChange}
          onClose={onDeselectPeg}
        />
      )}
    </svg>
  )
}
