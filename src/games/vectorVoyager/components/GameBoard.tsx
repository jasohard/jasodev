import { useCallback, useRef } from 'react'
import type { GameVector, Vec2, GamePhase, TrailParticle, LevelConfig } from '../types'
import {
  BOARD_WIDTH,
  BOARD_HEIGHT,
  resultantEnd as calcResultantEnd,
  totalFuelUsed,
} from '../engine'
import StarField from './StarField'
import GridOverlay from './GridOverlay'
import Asteroids from './Asteroids'
import TargetZone from './TargetZone'
import Ship from './Ship'
import VectorArrows from './VectorArrows'
import FuelGauge from './FuelGauge'
import HUD from './HUD'
import EngineTrail from './EngineTrail'

interface GameBoardProps {
  level: LevelConfig
  vectors: GameVector[]
  phase: GamePhase
  stars: 0 | 1 | 2 | 3
  shipPos: Vec2
  shipAngle: number
  trail: TrailParticle[]
  draggingIdx: number
  onDragStart: (e: React.PointerEvent) => void
  onDragMove: (e: React.PointerEvent) => void
  onDragEnd: (e: React.PointerEvent) => void
  /** Explosion particles for collision effect */
  explosionParticles: Vec2[]
  /** Victory particles */
  victoryParticles: Vec2[]
}

export default function GameBoard({
  level,
  vectors,
  phase,
  stars,
  shipPos,
  shipAngle,
  trail,
  draggingIdx,
  onDragStart,
  onDragMove,
  onDragEnd,
  explosionParticles,
  victoryParticles,
}: GameBoardProps) {
  const svgRef = useRef<SVGSVGElement>(null)

  const rEnd = calcResultantEnd(vectors)
  const fuelUsed = totalFuelUsed(vectors)
  const reached = phase === 'success'

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (phase !== 'planning') return
      onDragStart(e)
    },
    [phase, onDragStart]
  )

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${BOARD_WIDTH} ${BOARD_HEIGHT}`}
      style={{
        width: '100%',
        maxWidth: 500,
        height: 'auto',
        touchAction: 'none',
        userSelect: 'none',
        borderRadius: 12,
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={onDragMove}
      onPointerUp={onDragEnd}
      onPointerCancel={onDragEnd}
    >
      {/* Deep space background */}
      <rect width={BOARD_WIDTH} height={BOARD_HEIGHT} rx={12} fill="#0a0a23" />

      <StarField />
      {level.showGrid && <GridOverlay />}

      <Asteroids asteroids={level.asteroids} />
      <TargetZone center={level.target} radius={level.targetRadius} reached={reached} />

      {/* Vectors (only during planning) */}
      {phase === 'planning' && (
        <VectorArrows
          vectors={vectors}
          draggingIdx={draggingIdx}
          showComponents={level.showComponents}
          resultantEnd={rEnd}
          shipStart={level.shipStart}
        />
      )}

      {/* Engine trail — always show during/after launch */}
      <EngineTrail particles={trail} />

      {/* Ship */}
      <Ship position={shipPos} angle={shipAngle} />

      {/* HUD overlay */}
      <HUD stars={stars} vectorCount={vectors.length} par={level.par} />
      <FuelGauge fuelUsed={fuelUsed} fuelBudget={level.fuelBudget} />

      {/* Explosion particles */}
      {explosionParticles.map((p, i) => (
        <circle
          key={`exp-${i}`}
          cx={p.x}
          cy={p.y}
          r={3}
          fill="#f44336"
          opacity={0.8}
        >
          <animate
            attributeName="r"
            from="3"
            to="8"
            dur="0.5s"
            fill="freeze"
          />
          <animate
            attributeName="opacity"
            from="0.8"
            to="0"
            dur="0.5s"
            fill="freeze"
          />
        </circle>
      ))}

      {/* Victory particles */}
      {victoryParticles.map((p, i) => (
        <circle
          key={`vic-${i}`}
          cx={p.x}
          cy={p.y}
          r={2}
          fill="#ffd700"
          opacity={0.9}
        >
          <animate
            attributeName="r"
            from="2"
            to="10"
            dur="0.6s"
            fill="freeze"
          />
          <animate
            attributeName="opacity"
            from="0.9"
            to="0"
            dur="0.6s"
            fill="freeze"
          />
        </circle>
      ))}
    </svg>
  )
}
