import { useCallback, useRef } from 'react'
import type { GameVector, Vec2, GamePhase, TrailParticle, LevelConfig } from '../types'
import {
  BOARD_WIDTH,
  BOARD_HEIGHT,
  resultantEnd as calcResultantEnd,
  totalFuelUsed,
  checkCollisions,
  vectorColor,
  vecSub,
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
  const isPlanning = phase === 'planning'

  // Check for collision during planning to show a warning
  const planCollision = isPlanning && vectors.length > 0
    ? checkCollisions(vectors, level.asteroids)
    : null

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

      {/* Vectors: show during planning, faded during launch */}
      {(isPlanning || phase === 'launching') && (
        <g opacity={isPlanning ? 1 : 0.25}>
          <VectorArrows
            vectors={vectors}
            draggingIdx={draggingIdx}
            showComponents={level.showComponents}
            resultantEnd={rEnd}
            shipStart={level.shipStart}
          />
        </g>
      )}

      {/* Ghost path for result phases so player can see what they drew */}
      {(phase === 'success' || phase === 'collision' || phase === 'missed') &&
        vectors.length > 0 && (
          <g opacity={0.2}>
            {vectors.map((v, i) => (
              <line
                key={`ghost-${v.id}`}
                x1={v.start.x}
                y1={v.start.y}
                x2={v.end.x}
                y2={v.end.y}
                stroke={vectorColor(i)}
                strokeWidth={2}
                strokeLinecap="round"
              />
            ))}
          </g>
        )}

      {/* Collision warning marker during planning */}
      {planCollision && planCollision.hit && (
        <g>
          {/* Pulsing red circle at collision point */}
          <circle
            cx={planCollision.point.x}
            cy={planCollision.point.y}
            r={8}
            fill="none"
            stroke="#f44336"
            strokeWidth={2}
            opacity={0.8}
          >
            <animate
              attributeName="r"
              values="8;14;8"
              dur="1s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values="0.8;0.3;0.8"
              dur="1s"
              repeatCount="indefinite"
            />
          </circle>
          {/* Warning cross */}
          <text
            x={planCollision.point.x}
            y={planCollision.point.y + 1}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={14}
            fontWeight="bold"
            fill="#f44336"
            style={{ pointerEvents: 'none' }}
          >
            &#x2715;
          </text>
          {/* Color the colliding vector segment red from collision point */}
          {(() => {
            const v = vectors[planCollision.vectorIdx]
            if (!v) return null
            const d = vecSub(v.end, v.start)
            const hitX = v.start.x + d.x * planCollision.t
            const hitY = v.start.y + d.y * planCollision.t
            return (
              <line
                x1={hitX}
                y1={hitY}
                x2={v.end.x}
                y2={v.end.y}
                stroke="#f44336"
                strokeWidth={3}
                strokeLinecap="round"
                opacity={0.6}
                strokeDasharray="4 3"
                style={{ pointerEvents: 'none' }}
              />
            )
          })()}
        </g>
      )}

      {/* Engine trail — always show during/after launch */}
      <EngineTrail particles={trail} />

      {/* Ship */}
      <Ship position={shipPos} angle={shipAngle} launching={phase === 'launching'} />

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
          opacity={0.9}
        >
          <animate
            attributeName="r"
            from="2"
            to="12"
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
      {/* Explosion flash */}
      {explosionParticles.length > 0 && (
        <circle
          cx={shipPos.x}
          cy={shipPos.y}
          r={4}
          fill="#ff6b35"
          opacity={1}
        >
          <animate
            attributeName="r"
            from="4"
            to="25"
            dur="0.4s"
            fill="freeze"
          />
          <animate
            attributeName="opacity"
            from="1"
            to="0"
            dur="0.4s"
            fill="freeze"
          />
        </circle>
      )}

      {/* Victory particles — multi-colored */}
      {victoryParticles.map((p, i) => (
        <circle
          key={`vic-${i}`}
          cx={p.x}
          cy={p.y}
          r={2}
          fill={i % 3 === 0 ? '#ffd700' : i % 3 === 1 ? '#ff6b35' : '#4fc3f7'}
          opacity={0.9}
        >
          <animate
            attributeName="r"
            from="2"
            to="12"
            dur="0.7s"
            fill="freeze"
          />
          <animate
            attributeName="opacity"
            from="0.9"
            to="0"
            dur="0.7s"
            fill="freeze"
          />
        </circle>
      ))}
      {/* Victory glow */}
      {victoryParticles.length > 0 && (
        <circle
          cx={level.target.x}
          cy={level.target.y}
          r={level.targetRadius}
          fill="#ffd700"
          opacity={0}
        >
          <animate
            attributeName="opacity"
            values="0;0.4;0.15"
            dur="0.8s"
            fill="freeze"
          />
        </circle>
      )}
    </svg>
  )
}
