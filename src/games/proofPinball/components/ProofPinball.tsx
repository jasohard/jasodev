/**
 * Proof Pinball — Main Game Component
 *
 * Geometry meets billiards. Aim and launch a ball through geometric rooms,
 * bouncing off walls with angle-of-reflection physics.
 *
 * Features:
 * - Adjustable launch power (drag distance = power)
 * - Energy-based ball physics (energy depletes per bounce)
 * - Goal zones (circular areas the ball must enter)
 * - Minimum bounce requirements per level
 */

import { useReducer, useCallback, useRef, useEffect, useState, useMemo } from 'react'
import { gameReducer, initializeLevel } from '../gameState'
import {
  computeBallPath,
  computePredictionPath,
  interpolatePath,
  pathLength,
  getEnergyAtFraction,
  directionFromAngle,
  radToDeg,
  powerToSpeed,
  distance,
} from '../physics'
import { LEVELS } from '../levels'
import type { Vec2 } from '../types'
import styles from './ProofPinball.module.css'

const VIEWBOX_W = 400
const VIEWBOX_H = 600
const BALL_RADIUS = 7
const BALL_GLOW_ID = 'ball-glow'
const GOAL_GLOW_ID = 'goal-glow'

/** Max drag distance for full power */
const MAX_DRAG_DISTANCE = 120
/** Min drag distance to register power */
const MIN_DRAG_DISTANCE = 15

export default function ProofPinball() {
  const [state, dispatch] = useReducer(
    gameReducer,
    { levelId: 1, levelStars: {} },
    (init) => initializeLevel(init.levelId, init.levelStars)
  )
  const [showHint, setShowHint] = useState(true)
  const svgRef = useRef<SVGSVGElement>(null)
  const animFrameRef = useRef<number>(0)
  const animStartRef = useRef<number>(0)
  const goalAnnouncedRef = useRef(false)
  const dragStartRef = useRef<Vec2 | null>(null)

  const { level, phase, aimAngle, launchPower, reflectors, currentPath, animationProgress, currentEnergy, shotsTaken, goalReached, stars, levelStars, selectedReflectorId, isAiming } = state

  // ── SVG coordinate conversion ────────────────────────
  const svgPoint = useCallback(
    (clientX: number, clientY: number): Vec2 | null => {
      const svg = svgRef.current
      if (!svg) return null
      const rect = svg.getBoundingClientRect()
      const x = ((clientX - rect.left) / rect.width) * VIEWBOX_W
      const y = ((clientY - rect.top) / rect.height) * VIEWBOX_H
      return { x, y }
    },
    []
  )

  // ── Aiming logic ─────────────────────────────────────
  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (phase !== 'aiming') return

      const pt = svgPoint(e.clientX, e.clientY)
      if (!pt) return

      const lp = level.launchPoint

      // Check if clicking on a reflector
      for (const ref of reflectors) {
        const rdx = pt.x - ref.center.x
        const rdy = pt.y - ref.center.y
        if (Math.sqrt(rdx * rdx + rdy * rdy) < ref.halfLength + 20) {
          dispatch({ type: 'SELECT_REFLECTOR', id: ref.id })
          return
        }
      }

      // Deselect reflector if clicking elsewhere
      if (selectedReflectorId) {
        dispatch({ type: 'SELECT_REFLECTOR', id: null })
      }

      // Start aiming if near launch point
      const dx = pt.x - lp.x
      const dy = pt.y - lp.y
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist < MAX_DRAG_DISTANCE + 30) {
        dragStartRef.current = pt
        dispatch({ type: 'START_AIM' })
        svgRef.current?.setPointerCapture(e.pointerId)
      }
    },
    [phase, level.launchPoint, svgPoint, reflectors, selectedReflectorId]
  )

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      const pt = svgPoint(e.clientX, e.clientY)
      if (!pt) return

      if (isAiming && phase === 'aiming') {
        const lp = level.launchPoint
        const dx = pt.x - lp.x
        const dy = pt.y - lp.y
        // Angle: 0 = right, positive = CCW (math convention), but SVG y is flipped
        const angle = radToDeg(Math.atan2(-dy, dx))
        dispatch({ type: 'SET_AIM_ANGLE', angle })

        // Power = drag distance from launch point, clamped
        const dragDist = Math.sqrt(dx * dx + dy * dy)
        const power = Math.max(0, Math.min(1, (dragDist - MIN_DRAG_DISTANCE) / (MAX_DRAG_DISTANCE - MIN_DRAG_DISTANCE)))
        dispatch({ type: 'SET_LAUNCH_POWER', power })
      } else if (selectedReflectorId) {
        const ref = reflectors.find((r) => r.id === selectedReflectorId)
        if (ref) {
          const dx = pt.x - ref.center.x
          const dy = pt.y - ref.center.y
          const angle = radToDeg(Math.atan2(dy, dx))
          dispatch({ type: 'ROTATE_REFLECTOR', id: selectedReflectorId, angle })
        }
      }
    },
    [isAiming, phase, level.launchPoint, svgPoint, selectedReflectorId, reflectors]
  )

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      svgRef.current?.releasePointerCapture(e.pointerId)

      if (isAiming && phase === 'aiming') {
        // Fire the shot
        const path = computeBallPath(
          level.launchPoint,
          aimAngle,
          level.walls,
          reflectors,
          level.goalZone,
          level.maxBounces,
          level.minBounces,
          launchPower
        )
        goalAnnouncedRef.current = false
        dispatch({ type: 'FIRE_SHOT', path })
        dragStartRef.current = null
      }
    },
    [isAiming, phase, aimAngle, launchPower, level, reflectors]
  )

  // ── Ball animation ───────────────────────────────────
  useEffect(() => {
    if (phase !== 'animating' || !currentPath) return

    const totalLen = pathLength(currentPath.points)
    // Speed varies with power: higher power = faster ball
    const speed = powerToSpeed(launchPower)
    const duration = (totalLen / speed) * 1000 // ms

    animStartRef.current = performance.now()

    const animate = (now: number) => {
      const elapsed = now - animStartRef.current
      const progress = Math.min(elapsed / duration, 1)
      const energy = getEnergyAtFraction(currentPath.energyAtPoints, currentPath.points, progress)

      dispatch({ type: 'UPDATE_ANIMATION', progress, energy })

      // Check if ball has reached goal zone
      if (currentPath.goalReached && !goalAnnouncedRef.current) {
        // Check if animation progress has reached the goal point
        const goalFraction = getGoalFraction(currentPath)
        if (progress >= goalFraction) {
          goalAnnouncedRef.current = true
          dispatch({ type: 'GOAL_REACHED' })
        }
      }

      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(animate)
      } else {
        dispatch({ type: 'SHOT_COMPLETE' })
      }
    }

    animFrameRef.current = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(animFrameRef.current)
    }
  }, [phase, currentPath, launchPower])

  // Reset hint when level changes
  useEffect(() => {
    setShowHint(true)
  }, [level.id])

  // ── Memoized wall vertices ────────────────────────────
  const wallVertices = useMemo(() => {
    const vertices = new Map<string, Vec2>()
    for (const wall of level.walls) {
      const sk = `${Math.round(wall.start.x)},${Math.round(wall.start.y)}`
      const ek = `${Math.round(wall.end.x)},${Math.round(wall.end.y)}`
      vertices.set(sk, wall.start)
      vertices.set(ek, wall.end)
    }
    return Array.from(vertices.entries())
  }, [level.walls])

  // ── Prediction path ──────────────────────────────────
  const predictionPath =
    phase === 'aiming' && level.predictionBounces > 0
      ? computePredictionPath(
          level.launchPoint,
          aimAngle,
          level.walls,
          reflectors,
          level.predictionBounces
        )
      : []

  // ── Ball position during animation ───────────────────
  const ballPos =
    phase === 'animating' && currentPath
      ? interpolatePath(currentPath.points, animationProgress)
      : null

  // ── Compute visible bounces (only those the ball has passed) ──
  const visibleBounces =
    phase === 'animating' && currentPath
      ? currentPath.bounces.filter((_, i) => {
          const totalLen = pathLength(currentPath.points)
          if (totalLen === 0) return false
          let accumulated = 0
          for (let j = 1; j <= i + 1 && j < currentPath.points.length; j++) {
            const dx = currentPath.points[j].x - currentPath.points[j - 1].x
            const dy = currentPath.points[j].y - currentPath.points[j - 1].y
            accumulated += Math.sqrt(dx * dx + dy * dy)
          }
          return animationProgress >= accumulated / totalLen
        })
      : currentPath?.bounces ?? []

  // ── Trail path (only up to current ball position) ────
  const trailPathD =
    phase === 'animating' && currentPath && currentPath.points.length > 0
      ? (() => {
          const totalLen = pathLength(currentPath.points)
          const targetDist = animationProgress * totalLen
          let accumulated = 0
          const trailPoints: Vec2[] = [currentPath.points[0]]

          for (let i = 1; i < currentPath.points.length; i++) {
            const dx = currentPath.points[i].x - currentPath.points[i - 1].x
            const dy = currentPath.points[i].y - currentPath.points[i - 1].y
            const segLen = Math.sqrt(dx * dx + dy * dy)

            if (accumulated + segLen >= targetDist) {
              const frac = segLen > 0 ? (targetDist - accumulated) / segLen : 0
              trailPoints.push({
                x: currentPath.points[i - 1].x + dx * frac,
                y: currentPath.points[i - 1].y + dy * frac,
              })
              break
            }
            trailPoints.push(currentPath.points[i])
            accumulated += segLen
          }

          if (trailPoints.length < 2) return ''
          return (
            `M ${trailPoints[0].x} ${trailPoints[0].y} ` +
            trailPoints
              .slice(1)
              .map((p) => `L ${p.x} ${p.y}`)
              .join(' ')
          )
        })()
      : ''

  // ── Completed trail (after shot) ─────────────────────
  const completedTrailD =
    phase === 'aiming' && currentPath && currentPath.points.length > 1
      ? `M ${currentPath.points[0].x} ${currentPath.points[0].y} ` +
        currentPath.points
          .slice(1)
          .map((p) => `L ${p.x} ${p.y}`)
          .join(' ')
      : ''

  // ── Power bar color ────────────────────────────────────
  const powerColor = launchPower < 0.3 ? '#4caf50' : launchPower < 0.7 ? '#ffc107' : '#ff5722'

  // ── Energy bar color ──────────────────────────────────
  const energyColor = currentEnergy > 0.5 ? '#4caf50' : currentEnergy > 0.2 ? '#ffc107' : '#ff5722'
  const energyPercent = Math.round(currentEnergy * 100)

  // ── Render ───────────────────────────────────────────

  if (phase === 'levelSelect') {
    return (
      <div className={styles.container}>
        <div className={styles.levelSelect}>
          <h2 className={styles.levelSelectTitle}>Proof Pinball</h2>
          <div className={styles.levelGrid}>
            {LEVELS.map((lvl) => {
              const s = levelStars[lvl.id] ?? 0
              return (
                <button
                  key={lvl.id}
                  className={styles.levelButton}
                  onClick={() => dispatch({ type: 'SELECT_LEVEL', levelId: lvl.id })}
                >
                  <span className={styles.levelNumber}>{lvl.id}</span>
                  <span className={styles.levelName}>{lvl.name}</span>
                  <span className={styles.levelStars}>
                    {'★'.repeat(s)}
                    {'☆'.repeat(3 - s)}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  const nextLevelId = level.id < LEVELS.length ? level.id + 1 : null

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.levelInfo}>
          <span className={styles.levelTitle}>
            Level {level.id}: {level.name}
          </span>
          <span className={styles.levelSubtitle}>{level.subtitle}</span>
        </div>
        <div className={styles.headerRight}>
          {level.minBounces > 0 && (
            <span className={styles.bounceRequirement}>
              {level.minBounces}+ bounces
            </span>
          )}
          <div className={styles.shotInfo}>
            <span className={styles.shotCount}>
              {shotsTaken}/{level.maxShots}
            </span>
            <span className={styles.starDisplay}>
              {'★'.repeat(Math.max(0, stars))}
              {'☆'.repeat(3 - Math.max(0, stars))}
            </span>
          </div>
        </div>
      </div>

      {/* Game SVG */}
      <div className={styles.gameArea}>
        <svg
          ref={svgRef}
          className={styles.gameSvg}
          viewBox={`0 0 ${VIEWBOX_W} ${VIEWBOX_H}`}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          style={{ touchAction: 'none' }}
        >
          <defs>
            {/* Ball glow */}
            <filter id={BALL_GLOW_ID} x="-100%" y="-100%" width="300%" height="300%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            {/* Goal glow */}
            <filter id={GOAL_GLOW_ID} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            {/* Trail gradient */}
            <linearGradient id="trail-grad" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#00bcd4" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#00bcd4" stopOpacity="0.7" />
            </linearGradient>
            {/* Goal radial gradient */}
            <radialGradient id="goal-fill">
              <stop offset="0%" stopColor="#4caf50" stopOpacity="0.15" />
              <stop offset="60%" stopColor="#4caf50" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#4caf50" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="goal-fill-reached">
              <stop offset="0%" stopColor="#ffd700" stopOpacity="0.3" />
              <stop offset="60%" stopColor="#ffd700" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#ffd700" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Background */}
          <rect width={VIEWBOX_W} height={VIEWBOX_H} fill="#0d1117" />

          {/* Subtle grid */}
          <g opacity="0.06">
            {Array.from({ length: 20 }, (_, i) => (
              <line
                key={`gv${i}`}
                x1={i * 20}
                y1={0}
                x2={i * 20}
                y2={VIEWBOX_H}
                stroke="#fff"
                strokeWidth="0.5"
              />
            ))}
            {Array.from({ length: 30 }, (_, i) => (
              <line
                key={`gh${i}`}
                x1={0}
                y1={i * 20}
                x2={VIEWBOX_W}
                y2={i * 20}
                stroke="#fff"
                strokeWidth="0.5"
              />
            ))}
          </g>

          {/* Room walls */}
          {level.walls.map((wall) => (
            <line
              key={wall.id}
              x1={wall.start.x}
              y1={wall.start.y}
              x2={wall.end.x}
              y2={wall.end.y}
              stroke="#ffffff"
              strokeWidth="3"
              strokeLinecap="round"
              opacity="0.9"
            />
          ))}
          {/* Wall corner vertices */}
          {wallVertices.map(([key, v]) => (
            <circle key={`v-${key}`} cx={v.x} cy={v.y} r={3} fill="#fff" opacity="0.6" />
          ))}

          {/* Reflectors */}
          {reflectors.map((ref) => {
            const rad = (ref.angle * Math.PI) / 180
            const dx = Math.cos(rad) * ref.halfLength
            const dy = Math.sin(rad) * ref.halfLength
            const isSelected = ref.id === selectedReflectorId
            return (
              <g key={ref.id}>
                <line
                  x1={ref.center.x - dx}
                  y1={ref.center.y - dy}
                  x2={ref.center.x + dx}
                  y2={ref.center.y + dy}
                  stroke={isSelected ? '#4fc3f7' : '#2196f3'}
                  strokeWidth={isSelected ? 5 : 4}
                  strokeLinecap="round"
                />
                <circle
                  cx={ref.center.x + dx}
                  cy={ref.center.y + dy}
                  r={isSelected ? 10 : 8}
                  fill={isSelected ? '#4fc3f7' : '#2196f3'}
                  opacity={0.8}
                />
                <circle
                  cx={ref.center.x}
                  cy={ref.center.y}
                  r={4}
                  fill="#2196f3"
                  opacity={0.5}
                />
                <circle
                  cx={ref.center.x}
                  cy={ref.center.y}
                  r={ref.halfLength + 15}
                  fill="transparent"
                  style={{ cursor: 'grab' }}
                />
              </g>
            )
          })}

          {/* Goal Zone */}
          <GoalZoneRenderer
            center={level.goalZone.center}
            radius={level.goalZone.radius}
            reached={goalReached}
            locked={level.minBounces > 0 && phase === 'aiming'}
            isAnimating={phase === 'animating'}
            bouncesReached={visibleBounces.length}
            minBounces={level.minBounces}
          />

          {/* Completed trail (from previous shot) */}
          {completedTrailD && (
            <path
              d={completedTrailD}
              fill="none"
              stroke="#00bcd4"
              strokeWidth="1.5"
              opacity="0.2"
              strokeDasharray="4 4"
            />
          )}

          {/* Prediction line */}
          {phase === 'aiming' && predictionPath.length > 1 && (
            <polyline
              points={predictionPath.map((p) => `${p.x},${p.y}`).join(' ')}
              fill="none"
              stroke="#ffffff"
              strokeWidth="1.5"
              strokeDasharray="6 4"
              opacity="0.35"
            />
          )}

          {/* Active trail */}
          {trailPathD && (
            <path
              d={trailPathD}
              fill="none"
              stroke="#00bcd4"
              strokeWidth="2"
              opacity="0.6"
              strokeLinecap="round"
            />
          )}

          {/* Bounce angle displays */}
          {visibleBounces.map((bounce, i) => (
            <BounceAngleDisplay key={i} bounce={bounce} />
          ))}

          {/* Launch point */}
          <g>
            {phase === 'aiming' && !isAiming && (
              <circle
                cx={level.launchPoint.x}
                cy={level.launchPoint.y}
                r={16}
                fill="none"
                stroke="#4caf50"
                strokeWidth="1.5"
                opacity="0"
              >
                <animate attributeName="r" from="16" to="30" dur="1.5s" repeatCount="indefinite" />
                <animate attributeName="opacity" from="0.5" to="0" dur="1.5s" repeatCount="indefinite" />
              </circle>
            )}
            <circle
              cx={level.launchPoint.x}
              cy={level.launchPoint.y}
              r={16}
              fill="none"
              stroke="#4caf50"
              strokeWidth="1.5"
              opacity={phase === 'aiming' ? 0.6 : 0.3}
            />
            <circle
              cx={level.launchPoint.x}
              cy={level.launchPoint.y}
              r={BALL_RADIUS}
              fill={phase === 'aiming' ? '#4caf50' : '#2e7d32'}
              filter={phase === 'aiming' ? `url(#${BALL_GLOW_ID})` : undefined}
            />
            {phase === 'aiming' && (
              <circle
                cx={level.launchPoint.x}
                cy={level.launchPoint.y}
                r={50}
                fill="transparent"
                style={{ cursor: 'crosshair' }}
              />
            )}
          </g>

          {/* Power indicator (shown while aiming/dragging) */}
          {phase === 'aiming' && isAiming && (
            <PowerIndicator
              center={level.launchPoint}
              power={launchPower}
              angle={aimAngle}
            />
          )}

          {/* Protractor arc (when aiming) */}
          {phase === 'aiming' && isAiming && (
            <ProtractorArc
              center={level.launchPoint}
              angle={aimAngle}
              radius={60}
            />
          )}

          {/* Aim direction line */}
          {phase === 'aiming' && (
            <g>
              {(() => {
                const dir = directionFromAngle(aimAngle)
                const len = 30 + launchPower * 20
                return (
                  <line
                    x1={level.launchPoint.x}
                    y1={level.launchPoint.y}
                    x2={level.launchPoint.x + dir.x * len}
                    y2={level.launchPoint.y + dir.y * len}
                    stroke={powerColor}
                    strokeWidth={2 + launchPower * 2}
                    opacity="0.8"
                    strokeLinecap="round"
                  />
                )
              })()}
              {(() => {
                const dir = directionFromAngle(aimAngle)
                const len = 30 + launchPower * 20
                const tipX = level.launchPoint.x + dir.x * len
                const tipY = level.launchPoint.y + dir.y * len
                const perpX = -dir.y * (4 + launchPower * 3)
                const perpY = dir.x * (4 + launchPower * 3)
                return (
                  <polygon
                    points={`${tipX + dir.x * 8},${tipY + dir.y * 8} ${tipX + perpX},${tipY + perpY} ${tipX - perpX},${tipY - perpY}`}
                    fill={powerColor}
                    opacity="0.8"
                  />
                )
              })()}
            </g>
          )}

          {/* Animated ball */}
          {phase === 'animating' && ballPos && (
            <g>
              <circle
                cx={ballPos.x}
                cy={ballPos.y}
                r={BALL_RADIUS + (1 - currentEnergy) * -2}
                fill="#ffffff"
                filter={`url(#${BALL_GLOW_ID})`}
                opacity={0.5 + currentEnergy * 0.5}
              />
              <circle
                cx={ballPos.x}
                cy={ballPos.y}
                r={BALL_RADIUS * 0.5}
                fill="#e0f7fa"
                opacity={0.5 + currentEnergy * 0.5}
              />
            </g>
          )}

          {/* Goal reached particles */}
          {goalReached && <GoalReachedParticles center={level.goalZone.center} />}

          {/* Bounce counter during animation */}
          {phase === 'animating' && (
            <g>
              {(() => {
                const bouncesMet = visibleBounces.length >= level.minBounces
                const counterColor = level.minBounces > 0
                  ? (bouncesMet ? '#4caf50' : '#ff6b6b')
                  : '#80deea'
                const bgColor = level.minBounces > 0
                  ? (bouncesMet ? 'rgba(76,175,80,0.25)' : 'rgba(255,107,107,0.25)')
                  : 'rgba(0,0,0,0.5)'
                const label = level.minBounces > 0
                  ? `${visibleBounces.length}/${level.minBounces} bounces`
                  : `${visibleBounces.length} ${visibleBounces.length === 1 ? 'bounce' : 'bounces'}`
                return (
                  <>
                    <rect x={VIEWBOX_W - 90} y={8} width={80} height={24} rx={6} fill={bgColor} stroke={counterColor} strokeWidth="1" strokeOpacity="0.5" />
                    <text
                      x={VIEWBOX_W - 50}
                      y={24}
                      textAnchor="middle"
                      fontSize="11"
                      fontFamily="monospace"
                      fill={counterColor}
                      fontWeight={bouncesMet ? '700' : '400'}
                    >
                      {label}
                    </text>
                  </>
                )
              })()}
            </g>
          )}

          {/* Energy bar during animation */}
          {phase === 'animating' && (
            <g>
              <rect x={8} y={8} width={80} height={24} rx={6} fill="rgba(0,0,0,0.5)" />
              <rect x={12} y={14} width={72 * currentEnergy} height={12} rx={4} fill={energyColor} opacity="0.8" />
              <text
                x={48}
                y={23}
                textAnchor="middle"
                fontSize="9"
                fontFamily="monospace"
                fill="#fff"
                fontWeight="600"
              >
                {energyPercent}% energy
              </text>
            </g>
          )}

          {/* Min bounces requirement badge (shown when aiming) */}
          {phase === 'aiming' && level.minBounces > 0 && (
            <g>
              <rect x={VIEWBOX_W - 120} y={8} width={110} height={26} rx={6} fill="rgba(255,107,107,0.15)" stroke="rgba(255,107,107,0.4)" strokeWidth="1" />
              <text
                x={VIEWBOX_W - 65}
                y={25}
                textAnchor="middle"
                fontSize="11"
                fontFamily="monospace"
                fill="#ff6b6b"
                fontWeight="600"
              >
                {level.minBounces}+ bounces
              </text>
            </g>
          )}
        </svg>

        {/* Completion overlay */}
        {phase === 'complete' && (
          <div className={styles.completionOverlay}>
            <div className={styles.completionTitle}>Level Complete!</div>
            <div className={styles.completionStars}>
              {'★'.repeat(stars)}
              {'☆'.repeat(3 - stars)}
            </div>
            <div className={styles.completionMessage}>
              {stars === 3
                ? 'Perfect! Maximum stars!'
                : stars === 2
                  ? 'Great shot! Can you do it in fewer?'
                  : 'Level cleared! Try for more stars.'}
              <br />
              Shots used: {shotsTaken} (Par: {level.parShots})
            </div>
            <div className={styles.completionActions}>
              <button
                className={styles.retryButton}
                onClick={() => dispatch({ type: 'RESET_LEVEL' })}
              >
                Retry
              </button>
              {nextLevelId && (
                <button
                  className={styles.nextButton}
                  onClick={() => dispatch({ type: 'SELECT_LEVEL', levelId: nextLevelId })}
                >
                  Next Level
                </button>
              )}
              <button
                className={styles.retryButton}
                onClick={() => dispatch({ type: 'GO_TO_LEVEL_SELECT' })}
              >
                Levels
              </button>
            </div>
          </div>
        )}

        {/* Failed overlay */}
        {phase === 'failed' && (
          <div className={styles.completionOverlay}>
            <div className={styles.failedTitle}>Out of Shots!</div>
            <div className={styles.completionMessage}>
              You used all {level.maxShots} shots without reaching the goal.
            </div>
            <div className={styles.completionActions}>
              <button
                className={styles.nextButton}
                onClick={() => dispatch({ type: 'RESET_LEVEL' })}
              >
                Try Again
              </button>
              <button
                className={styles.retryButton}
                onClick={() => dispatch({ type: 'GO_TO_LEVEL_SELECT' })}
              >
                Levels
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Hint banner */}
      {showHint && level.hint && phase === 'aiming' && shotsTaken === 0 && (
        <div className={styles.hintBanner}>
          {level.hint}
          <button
            className={styles.hintDismiss}
            onClick={() => setShowHint(false)}
            aria-label="Dismiss hint"
          >
            ✕
          </button>
        </div>
      )}

      {/* Bottom controls */}
      <div className={styles.controls}>
        <button
          className={`${styles.controlButton} ${styles.levelsButton}`}
          onClick={() => dispatch({ type: 'GO_TO_LEVEL_SELECT' })}
        >
          Levels
        </button>
        <div className={styles.controlsCenter}>
          <span className={styles.angleDisplay}>
            {Math.round(aimAngle)}°
          </span>
          {phase === 'aiming' && (
            <span className={styles.powerDisplay} style={{ color: powerColor }}>
              {Math.round(launchPower * 100)}%
            </span>
          )}
          {phase === 'animating' && (
            <span className={styles.energyDisplay} style={{ color: energyColor }}>
              {energyPercent}%
            </span>
          )}
        </div>
        <button
          className={`${styles.controlButton} ${styles.resetButton}`}
          onClick={() => dispatch({ type: 'RESET_LEVEL' })}
        >
          Reset
        </button>
      </div>
    </div>
  )
}

// ── Helper functions ─────────────────────────────────────

/**
 * Calculate the fraction (0-1) along the path where the goal zone is first entered.
 * goalReachedAtPoint is the index of the bounce point at the END of the segment
 * that crosses the goal zone (set before push, so it equals the post-push index).
 * We accumulate distance to that point to find when to trigger the goal event.
 */
function getGoalFraction(path: { points: Vec2[]; goalReachedAtPoint: number }): number {
  if (path.goalReachedAtPoint < 0) return 2 // Never reached
  const totalLen = pathLength(path.points)
  if (totalLen === 0) return 0

  // Sum segment lengths up to and including the goalReachedAtPoint index
  let accumulated = 0
  const endIdx = Math.min(path.goalReachedAtPoint, path.points.length - 1)
  for (let i = 1; i <= endIdx; i++) {
    accumulated += distance(path.points[i - 1], path.points[i])
  }
  return accumulated / totalLen
}

// ── Sub-components ──────────────────────────────────────

/** Goal Zone visual - concentric rings with pulse animation */
function GoalZoneRenderer({
  center,
  radius,
  reached,
  locked,
  isAnimating,
  bouncesReached,
  minBounces,
}: {
  center: Vec2
  radius: number
  reached: boolean
  locked: boolean
  isAnimating: boolean
  bouncesReached: number
  minBounces: number
}) {
  const isGoalLocked = isAnimating && minBounces > 0 && bouncesReached < minBounces
  const goalColor = reached ? '#ffd700' : (locked || isGoalLocked) ? '#555' : '#4caf50'
  const fillId = reached ? 'url(#goal-fill-reached)' : 'url(#goal-fill)'

  return (
    <g>
      {/* Background fill */}
      <circle
        cx={center.x}
        cy={center.y}
        r={radius}
        fill={fillId}
        filter={(!locked && !isGoalLocked) ? `url(#${GOAL_GLOW_ID})` : undefined}
      />
      {/* Outer ring */}
      <circle
        cx={center.x}
        cy={center.y}
        r={radius}
        fill="none"
        stroke={goalColor}
        strokeWidth="2.5"
        opacity={reached ? 1 : 0.7}
        strokeDasharray={reached ? 'none' : '8 4'}
      >
        {!reached && (
          <animateTransform
            attributeName="transform"
            type="rotate"
            from={`0 ${center.x} ${center.y}`}
            to={`360 ${center.x} ${center.y}`}
            dur="12s"
            repeatCount="indefinite"
          />
        )}
      </circle>
      {/* Middle ring */}
      <circle
        cx={center.x}
        cy={center.y}
        r={radius * 0.65}
        fill="none"
        stroke={goalColor}
        strokeWidth="1.5"
        opacity={0.4}
        strokeDasharray="4 4"
      >
        {!reached && (
          <animateTransform
            attributeName="transform"
            type="rotate"
            from={`360 ${center.x} ${center.y}`}
            to={`0 ${center.x} ${center.y}`}
            dur="8s"
            repeatCount="indefinite"
          />
        )}
      </circle>
      {/* Inner ring */}
      <circle
        cx={center.x}
        cy={center.y}
        r={radius * 0.35}
        fill="none"
        stroke={goalColor}
        strokeWidth="1"
        opacity={0.3}
      />
      {/* Center dot */}
      <circle
        cx={center.x}
        cy={center.y}
        r={3}
        fill={goalColor}
        opacity={0.6}
      />
      {/* Pulse ring animation */}
      {!reached && !locked && !isGoalLocked && (
        <circle
          cx={center.x}
          cy={center.y}
          r={radius}
          fill="none"
          stroke={goalColor}
          strokeWidth="1"
          opacity="0"
        >
          <animate attributeName="r" from={`${radius}`} to={`${radius + 12}`} dur="2s" repeatCount="indefinite" />
          <animate attributeName="opacity" from="0.4" to="0" dur="2s" repeatCount="indefinite" />
        </circle>
      )}
      {/* Lock icon when min bounces not met */}
      {(locked || isGoalLocked) && !reached && (
        <text
          x={center.x}
          y={center.y + 6}
          textAnchor="middle"
          fontSize="18"
          fill="#888"
          opacity="0.7"
          pointerEvents="none"
        >
          {minBounces}+
        </text>
      )}
      {/* Check mark when reached */}
      {reached && (
        <text
          x={center.x}
          y={center.y + 7}
          textAnchor="middle"
          fontSize="22"
          fill="#fff"
          fontWeight="bold"
          pointerEvents="none"
        >
          ✓
        </text>
      )}
    </g>
  )
}

/** Power indicator showing launch strength */
function PowerIndicator({
  center,
  power,
  angle,
}: {
  center: Vec2
  power: number
  angle: number
}) {
  const barWidth = 50
  const barHeight = 8
  const x = center.x - barWidth / 2
  const y = center.y + 35
  const fillWidth = power * barWidth

  const color = power < 0.3 ? '#4caf50' : power < 0.7 ? '#ffc107' : '#ff5722'
  const speedLabel = `${Math.round(powerToSpeed(power))} px/s`

  return (
    <g opacity="0.8">
      {/* Background bar */}
      <rect x={x} y={y} width={barWidth} height={barHeight} rx={4} fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" />
      {/* Fill bar */}
      <rect x={x} y={y} width={fillWidth} height={barHeight} rx={4} fill={color} />
      {/* Speed label */}
      <text
        x={center.x}
        y={y + barHeight + 12}
        textAnchor="middle"
        fontSize="8"
        fontFamily="monospace"
        fill={color}
        opacity="0.8"
      >
        {speedLabel}
      </text>
    </g>
  )
}

/** Protractor arc overlay shown while aiming */
function ProtractorArc({
  center,
  angle,
  radius,
}: {
  center: Vec2
  angle: number
  radius: number
}) {
  const ticks: { x1: number; y1: number; x2: number; y2: number; label?: string }[] = []
  for (let deg = 0; deg < 360; deg += 15) {
    const rad = (deg * Math.PI) / 180
    const cos = Math.cos(rad)
    const sin = -Math.sin(rad)
    const isMajor = deg % 45 === 0
    const innerR = isMajor ? radius - 12 : radius - 6
    ticks.push({
      x1: center.x + cos * innerR,
      y1: center.y + sin * innerR,
      x2: center.x + cos * radius,
      y2: center.y + sin * radius,
      label: isMajor ? `${deg}` : undefined,
    })
  }

  return (
    <g opacity="0.6">
      <circle
        cx={center.x}
        cy={center.y}
        r={radius}
        fill="rgba(0, 188, 212, 0.05)"
        stroke="rgba(0, 188, 212, 0.2)"
        strokeWidth="1"
      />
      {ticks.map((tick, i) => (
        <g key={i}>
          <line
            x1={tick.x1}
            y1={tick.y1}
            x2={tick.x2}
            y2={tick.y2}
            stroke="#00bcd4"
            strokeWidth={tick.label ? 1.5 : 0.8}
          />
          {tick.label && (
            <text
              x={center.x + Math.cos((i * 15 * Math.PI) / 180) * (radius + 12)}
              y={center.y - Math.sin((i * 15 * Math.PI) / 180) * (radius + 12)}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize="7"
              fill="#00bcd4"
              opacity="0.8"
            >
              {tick.label}
            </text>
          )}
        </g>
      ))}
      {(() => {
        const rad = (angle * Math.PI) / 180
        return (
          <line
            x1={center.x}
            y1={center.y}
            x2={center.x + Math.cos(rad) * radius}
            y2={center.y - Math.sin(rad) * radius}
            stroke="#00bcd4"
            strokeWidth="2"
            opacity="0.9"
          />
        )
      })()}
    </g>
  )
}

/** Angle display at a bounce point */
function BounceAngleDisplay({
  bounce,
}: {
  bounce: {
    position: Vec2
    incidenceAngle: number
    reflectionAngle: number
    normal: Vec2
    incoming: Vec2
    outgoing: Vec2
  }
}) {
  const { position: pos, incidenceAngle, normal, incoming, outgoing } = bounce
  const arcRadius = 20
  const normalLen = 25

  const inAngleRad = Math.atan2(-incoming.y, -incoming.x)
  const outAngleRad = Math.atan2(outgoing.y, outgoing.x)
  const normalAngleRad = Math.atan2(normal.y, normal.x)

  const incArcStart = normalAngleRad
  const incArcEnd = inAngleRad
  const refArcStart = outAngleRad
  const refArcEnd = normalAngleRad

  function arcPath(cx: number, cy: number, r: number, startAngle: number, endAngle: number): string {
    let sweep = endAngle - startAngle
    while (sweep > Math.PI) sweep -= 2 * Math.PI
    while (sweep < -Math.PI) sweep += 2 * Math.PI

    const x1 = cx + r * Math.cos(startAngle)
    const y1 = cy + r * Math.sin(startAngle)
    const x2 = cx + r * Math.cos(endAngle)
    const y2 = cy + r * Math.sin(endAngle)
    const largeArc = Math.abs(sweep) > Math.PI ? 1 : 0
    const sweepDir = sweep > 0 ? 1 : 0

    return `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} ${sweepDir} ${x2} ${y2}`
  }

  return (
    <g>
      <line
        x1={pos.x - normal.x * normalLen}
        y1={pos.y - normal.y * normalLen}
        x2={pos.x + normal.x * normalLen}
        y2={pos.y + normal.y * normalLen}
        stroke="#666"
        strokeWidth="1"
        strokeDasharray="3 3"
        opacity="0.6"
      />
      <path
        d={arcPath(pos.x, pos.y, arcRadius, incArcStart, incArcEnd)}
        fill="none"
        stroke="#4caf50"
        strokeWidth="1.5"
        opacity="0.8"
      />
      <path
        d={arcPath(pos.x, pos.y, arcRadius, refArcStart, refArcEnd)}
        fill="none"
        stroke="#2196f3"
        strokeWidth="1.5"
        opacity="0.8"
      />
      <text
        x={pos.x + normal.x * (arcRadius + 14)}
        y={pos.y + normal.y * (arcRadius + 14)}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize="9"
        fontFamily="monospace"
        fill="#80deea"
        opacity="0.9"
      >
        {Math.round(incidenceAngle)}°
      </text>
      <circle cx={pos.x} cy={pos.y} r={3} fill="#00bcd4" opacity="0.7" />
    </g>
  )
}

/** Particle burst when goal is reached */
function GoalReachedParticles({ center }: { center: Vec2 }) {
  const particleCount = 12
  return (
    <g>
      {Array.from({ length: particleCount }, (_, i) => {
        const angle = (i / particleCount) * Math.PI * 2
        const dist = 40
        const color = i % 2 === 0 ? '#ffd700' : '#4caf50'
        return (
          <circle
            key={i}
            cx={center.x}
            cy={center.y}
            r={4}
            fill={color}
            opacity="0"
          >
            <animate
              attributeName="cx"
              from={`${center.x}`}
              to={`${center.x + Math.cos(angle) * dist}`}
              dur="0.8s"
              fill="freeze"
            />
            <animate
              attributeName="cy"
              from={`${center.y}`}
              to={`${center.y + Math.sin(angle) * dist}`}
              dur="0.8s"
              fill="freeze"
            />
            <animate
              attributeName="opacity"
              from="1"
              to="0"
              dur="0.8s"
              fill="freeze"
            />
            <animate
              attributeName="r"
              from="4"
              to="1"
              dur="0.8s"
              fill="freeze"
            />
          </circle>
        )
      })}
    </g>
  )
}
