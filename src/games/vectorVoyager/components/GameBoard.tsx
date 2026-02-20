import { useCallback, useMemo, useRef } from 'react'
import type { LaunchVector, Vec2, GamePhase, TrailParticle, LevelConfig, GravityWell } from '../types'
import {
  BOARD_WIDTH,
  BOARD_HEIGHT,
  simulateTrajectory,
  maxWells as calcMaxWells,
} from '../engine'
import StarField from './StarField'
import GridOverlay from './GridOverlay'
import Asteroids from './Asteroids'
import TargetZone from './TargetZone'
import Ship from './Ship'
import LaunchVectorArrow from './VectorArrows'
import GravityWellsComponent from './GravityWells'
import WellCounter from './FuelGauge'
import HUD from './HUD'
import EngineTrail from './EngineTrail'

interface GameBoardProps {
  level: LevelConfig
  launch: LaunchVector | null
  wells: GravityWell[]
  phase: GamePhase
  stars: 0 | 1 | 2 | 3
  shipPos: Vec2
  shipAngle: number
  trail: TrailParticle[]
  isDraggingLaunch: boolean
  selectedWellId: number | null
  onPointerDown: (e: React.PointerEvent) => void
  onPointerMove: (e: React.PointerEvent) => void
  onPointerUp: (e: React.PointerEvent) => void
  onSelectWell: (id: number) => void
  explosionParticles: Vec2[]
  victoryParticles: Vec2[]
}

export default function GameBoard({
  level,
  launch,
  wells,
  phase,
  stars,
  shipPos,
  shipAngle,
  trail,
  isDraggingLaunch,
  selectedWellId,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onSelectWell,
  explosionParticles,
  victoryParticles,
}: GameBoardProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const reached = phase === 'success'
  const isPlanning = phase === 'planning'
  const mw = calcMaxWells(level.wellPar)

  // Compute trajectory preview (only during planning with a launch vector)
  const trajectoryPreview = useMemo(() => {
    if (!isPlanning || !launch) return null
    const sim = simulateTrajectory(
      launch, wells, level.asteroids, level.target, level.targetRadius
    )
    return sim
  }, [isPlanning, launch, wells, level.asteroids, level.target, level.targetRadius])

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (phase !== 'planning') return
      onPointerDown(e)
    },
    [phase, onPointerDown]
  )

  // Build trajectory preview polyline points
  const previewPoints = useMemo(() => {
    if (!trajectoryPreview) return ''
    // Sample every few steps for smoother line without too many points
    const step = 2
    return trajectoryPreview.path
      .filter((_, i) => i % step === 0 || i === trajectoryPreview.endIdx)
      .map(p => `${p.x},${p.y}`)
      .join(' ')
  }, [trajectoryPreview])

  // Determine preview color based on outcome
  const previewColor = trajectoryPreview
    ? trajectoryPreview.reachedTarget
      ? '#4caf50'
      : trajectoryPreview.hitAsteroid
        ? '#f44336'
        : '#00e5ff'
    : '#00e5ff'

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
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      {/* Deep space background */}
      <rect width={BOARD_WIDTH} height={BOARD_HEIGHT} rx={12} fill="#0a0a23" />

      <StarField />
      {level.showGrid && <GridOverlay />}

      {/* Gravity wells (rendered below asteroids for layering) */}
      <GravityWellsComponent
        wells={wells}
        selectedWellId={selectedWellId}
        onSelectWell={onSelectWell}
      />

      <Asteroids asteroids={level.asteroids} />
      <TargetZone center={level.target} radius={level.targetRadius} reached={reached} />

      {/* Trajectory preview — dotted cyan line during planning */}
      {isPlanning && previewPoints && (
        <polyline
          points={previewPoints}
          fill="none"
          stroke={previewColor}
          strokeWidth={1.5}
          strokeDasharray="4 4"
          opacity={0.6}
          style={{ pointerEvents: 'none' }}
        />
      )}

      {/* Collision/success marker on preview */}
      {isPlanning && trajectoryPreview && trajectoryPreview.hitAsteroid && (
        <g>
          <circle
            cx={trajectoryPreview.path[trajectoryPreview.endIdx].x}
            cy={trajectoryPreview.path[trajectoryPreview.endIdx].y}
            r={8}
            fill="none" stroke="#f44336" strokeWidth={2} opacity={0.8}
          >
            <animate attributeName="r" values="8;14;8" dur="1s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.8;0.3;0.8" dur="1s" repeatCount="indefinite" />
          </circle>
          <text
            x={trajectoryPreview.path[trajectoryPreview.endIdx].x}
            y={trajectoryPreview.path[trajectoryPreview.endIdx].y + 1}
            textAnchor="middle" dominantBaseline="central"
            fontSize={14} fontWeight="bold" fill="#f44336"
            style={{ pointerEvents: 'none' }}
          >
            &#x2715;
          </text>
        </g>
      )}

      {isPlanning && trajectoryPreview && trajectoryPreview.reachedTarget && (
        <circle
          cx={level.target.x} cy={level.target.y}
          r={level.targetRadius + 4}
          fill="none" stroke="#4caf50" strokeWidth={2}
          opacity={0.5}
        >
          <animate attributeName="opacity" values="0.5;0.2;0.5" dur="1s" repeatCount="indefinite" />
        </circle>
      )}

      {/* Launch vector: show during planning (faded during launch) */}
      {(isPlanning || phase === 'launching') && (
        <g opacity={isPlanning ? 1 : 0.25}>
          <LaunchVectorArrow launch={launch} isDragging={isDraggingLaunch} />
        </g>
      )}

      {/* Ghost launch line for result phases */}
      {(phase === 'success' || phase === 'collision' || phase === 'missed') && launch && (
        <line
          x1={launch.start.x} y1={launch.start.y}
          x2={launch.end.x} y2={launch.end.y}
          stroke="#4fc3f7" strokeWidth={2} strokeLinecap="round" opacity={0.15}
        />
      )}

      {/* Engine trail */}
      <EngineTrail particles={trail} />

      {/* Ship */}
      <Ship position={shipPos} angle={shipAngle} launching={phase === 'launching'} />

      {/* HUD overlay */}
      <HUD stars={stars} wellCount={wells.length} wellPar={level.wellPar} />
      <WellCounter wellCount={wells.length} wellPar={level.wellPar} maxWells={mw} />

      {/* Explosion particles */}
      {explosionParticles.map((p, i) => (
        <circle key={`exp-${i}`} cx={p.x} cy={p.y} r={3} fill="#f44336" opacity={0.9}>
          <animate attributeName="r" from="2" to="12" dur="0.6s" fill="freeze" />
          <animate attributeName="opacity" from="0.9" to="0" dur="0.6s" fill="freeze" />
        </circle>
      ))}
      {explosionParticles.length > 0 && (
        <circle cx={shipPos.x} cy={shipPos.y} r={4} fill="#ff6b35" opacity={1}>
          <animate attributeName="r" from="4" to="25" dur="0.4s" fill="freeze" />
          <animate attributeName="opacity" from="1" to="0" dur="0.4s" fill="freeze" />
        </circle>
      )}

      {/* Victory particles */}
      {victoryParticles.map((p, i) => (
        <circle
          key={`vic-${i}`} cx={p.x} cy={p.y} r={2}
          fill={i % 3 === 0 ? '#ffd700' : i % 3 === 1 ? '#ff6b35' : '#4fc3f7'}
          opacity={0.9}
        >
          <animate attributeName="r" from="2" to="12" dur="0.7s" fill="freeze" />
          <animate attributeName="opacity" from="0.9" to="0" dur="0.7s" fill="freeze" />
        </circle>
      ))}
      {victoryParticles.length > 0 && (
        <circle cx={level.target.x} cy={level.target.y} r={level.targetRadius} fill="#ffd700" opacity={0}>
          <animate attributeName="opacity" values="0;0.4;0.15" dur="0.8s" fill="freeze" />
        </circle>
      )}
    </svg>
  )
}
