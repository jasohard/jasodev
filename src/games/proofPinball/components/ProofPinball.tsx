/**
 * Proof Pinball — Main Game Component
 *
 * Geometry meets billiards. Aim and launch a ball through geometric rooms,
 * bouncing off walls with angle-of-reflection physics.
 */

import { useReducer, useCallback, useRef, useEffect, useState } from 'react'
import { gameReducer, initializeLevel } from '../gameState'
import { computeBallPath, computePredictionPath, interpolatePath, pathLength, directionFromAngle, radToDeg } from '../physics'
import { LEVELS } from '../levels'
import type { Vec2 } from '../types'
import styles from './ProofPinball.module.css'

const VIEWBOX_W = 400
const VIEWBOX_H = 600
const BALL_RADIUS = 7
const TARGET_GLOW_ID = 'target-glow'
const BALL_GLOW_ID = 'ball-glow'
const BALL_SPEED = 450 // px per second in viewBox units

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

  // Track which targets have been "announced" during current animation
  const announcedTargetsRef = useRef<Set<string>>(new Set())

  const { level, phase, aimAngle, targets, reflectors, currentPath, animationProgress, shotsTaken, stars, levelStars, selectedReflectorId, isAiming } = state

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
      const dx = pt.x - lp.x
      const dy = pt.y - lp.y
      const dist = Math.sqrt(dx * dx + dy * dy)

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
      if (dist < 120) {
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

  const handlePointerUp = useCallback(() => {
    if (isAiming && phase === 'aiming') {
      // Fire the shot
      const path = computeBallPath(
        level.launchPoint,
        aimAngle,
        level.walls,
        reflectors,
        targets,
        level.maxBounces
      )
      announcedTargetsRef.current = new Set()
      dispatch({ type: 'FIRE_SHOT', path })
    }
  }, [isAiming, phase, aimAngle, level, reflectors, targets])

  // ── Ball animation ───────────────────────────────────
  useEffect(() => {
    if (phase !== 'animating' || !currentPath) return

    const totalLen = pathLength(currentPath.points)
    const duration = (totalLen / BALL_SPEED) * 1000 // ms

    animStartRef.current = performance.now()

    const animate = (now: number) => {
      const elapsed = now - animStartRef.current
      const progress = Math.min(elapsed / duration, 1)

      dispatch({ type: 'UPDATE_ANIMATION', progress })

      // Check if ball has reached any targets
      if (currentPath.targetsHit.length > 0) {
        const ballPos = interpolatePath(currentPath.points, progress)
        for (const targetId of currentPath.targetsHit) {
          if (announcedTargetsRef.current.has(targetId)) continue
          const target = targets.find((t) => t.id === targetId)
          if (target) {
            const dx = ballPos.x - target.center.x
            const dy = ballPos.y - target.center.y
            if (Math.sqrt(dx * dx + dy * dy) < target.radius + BALL_RADIUS) {
              announcedTargetsRef.current.add(targetId)
              dispatch({ type: 'HIT_TARGET', targetId })
            }
          }
        }
      }

      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(animate)
      } else {
        // Animation complete
        dispatch({ type: 'SHOT_COMPLETE' })
      }
    }

    animFrameRef.current = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(animFrameRef.current)
    }
  }, [phase, currentPath, targets])

  // Reset hint when level changes
  useEffect(() => {
    setShowHint(true)
  }, [level.id])

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
          // A bounce at index i happens between points[i] and points[i+1]
          // Show it if animationProgress is past that point
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
              const frac = (targetDist - accumulated) / segLen
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
            {/* Target glow filter */}
            <filter id={TARGET_GLOW_ID} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            {/* Ball glow */}
            <filter id={BALL_GLOW_ID} x="-100%" y="-100%" width="300%" height="300%">
              <feGaussianBlur stdDeviation="3" result="blur" />
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
          </defs>

          {/* Background */}
          <rect width={VIEWBOX_W} height={VIEWBOX_H} fill="#1a1a2e" />

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
          {(() => {
            const vertices = new Map<string, Vec2>()
            for (const wall of level.walls) {
              const sk = `${Math.round(wall.start.x)},${Math.round(wall.start.y)}`
              const ek = `${Math.round(wall.end.x)},${Math.round(wall.end.y)}`
              vertices.set(sk, wall.start)
              vertices.set(ek, wall.end)
            }
            return Array.from(vertices.entries()).map(([key, v]) => (
              <circle key={`v-${key}`} cx={v.x} cy={v.y} r={3} fill="#fff" opacity="0.6" />
            ))
          })()}

          {/* Reflectors */}
          {reflectors.map((ref) => {
            const rad = (ref.angle * Math.PI) / 180
            const dx = Math.cos(rad) * ref.halfLength
            const dy = Math.sin(rad) * ref.halfLength
            const isSelected = ref.id === selectedReflectorId
            return (
              <g key={ref.id}>
                {/* Reflector line */}
                <line
                  x1={ref.center.x - dx}
                  y1={ref.center.y - dy}
                  x2={ref.center.x + dx}
                  y2={ref.center.y + dy}
                  stroke={isSelected ? '#4fc3f7' : '#2196f3'}
                  strokeWidth={isSelected ? 5 : 4}
                  strokeLinecap="round"
                />
                {/* Rotation handle */}
                <circle
                  cx={ref.center.x + dx}
                  cy={ref.center.y + dy}
                  r={isSelected ? 10 : 8}
                  fill={isSelected ? '#4fc3f7' : '#2196f3'}
                  opacity={0.8}
                />
                {/* Center dot */}
                <circle
                  cx={ref.center.x}
                  cy={ref.center.y}
                  r={4}
                  fill="#2196f3"
                  opacity={0.5}
                />
                {/* Invisible touch target */}
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

          {/* Targets */}
          {targets.map((target) => (
            <g key={target.id}>
              {/* Outer glow ring */}
              {!target.hit && (
                <circle
                  cx={target.center.x}
                  cy={target.center.y}
                  r={target.radius + 4}
                  fill="none"
                  stroke="#ffd700"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                  opacity="0.5"
                  filter={`url(#${TARGET_GLOW_ID})`}
                >
                  <animateTransform
                    attributeName="transform"
                    type="rotate"
                    from={`0 ${target.center.x} ${target.center.y}`}
                    to={`360 ${target.center.x} ${target.center.y}`}
                    dur="8s"
                    repeatCount="indefinite"
                  />
                </circle>
              )}
              {/* Main target */}
              <circle
                cx={target.center.x}
                cy={target.center.y}
                r={target.radius}
                fill={target.hit ? '#4caf50' : 'rgba(255, 215, 0, 0.15)'}
                stroke={target.hit ? '#4caf50' : '#ffd700'}
                strokeWidth="2"
              />
              {/* Inner ring */}
              <circle
                cx={target.center.x}
                cy={target.center.y}
                r={target.radius * 0.5}
                fill="none"
                stroke={target.hit ? '#81c784' : '#ffd700'}
                strokeWidth="1"
                opacity="0.6"
              />
              {/* Center dot */}
              <circle
                cx={target.center.x}
                cy={target.center.y}
                r={3}
                fill={target.hit ? '#81c784' : '#ffd700'}
              />
              {/* Hit check mark */}
              {target.hit && (
                <text
                  x={target.center.x}
                  y={target.center.y + 5}
                  textAnchor="middle"
                  fontSize="18"
                  fill="#fff"
                  fontWeight="bold"
                >
                  ✓
                </text>
              )}
            </g>
          ))}

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
            {/* Pulse ring (aiming mode) */}
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
            {/* Outer ring */}
            <circle
              cx={level.launchPoint.x}
              cy={level.launchPoint.y}
              r={16}
              fill="none"
              stroke="#4caf50"
              strokeWidth="1.5"
              opacity={phase === 'aiming' ? 0.6 : 0.3}
            />
            {/* Inner dot */}
            <circle
              cx={level.launchPoint.x}
              cy={level.launchPoint.y}
              r={BALL_RADIUS}
              fill={phase === 'aiming' ? '#4caf50' : '#2e7d32'}
              filter={phase === 'aiming' ? `url(#${BALL_GLOW_ID})` : undefined}
            />
            {/* Invisible touch target */}
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
                const len = 40
                return (
                  <line
                    x1={level.launchPoint.x}
                    y1={level.launchPoint.y}
                    x2={level.launchPoint.x + dir.x * len}
                    y2={level.launchPoint.y + dir.y * len}
                    stroke="#4caf50"
                    strokeWidth="2"
                    opacity="0.8"
                    strokeLinecap="round"
                  />
                )
              })()}
              {/* Arrow head */}
              {(() => {
                const dir = directionFromAngle(aimAngle)
                const tipX = level.launchPoint.x + dir.x * 40
                const tipY = level.launchPoint.y + dir.y * 40
                const perpX = -dir.y * 5
                const perpY = dir.x * 5
                return (
                  <polygon
                    points={`${tipX + dir.x * 8},${tipY + dir.y * 8} ${tipX + perpX},${tipY + perpY} ${tipX - perpX},${tipY - perpY}`}
                    fill="#4caf50"
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
                r={BALL_RADIUS}
                fill="#ffffff"
                filter={`url(#${BALL_GLOW_ID})`}
              />
              <circle
                cx={ballPos.x}
                cy={ballPos.y}
                r={BALL_RADIUS * 0.5}
                fill="#e0f7fa"
              />
            </g>
          )}

          {/* Hit particles */}
          {targets.filter((t) => t.hit).map((target) => (
            <HitParticles key={`particles-${target.id}`} center={target.center} />
          ))}

          {/* Bounce counter during animation */}
          {phase === 'animating' && (
            <g>
              <rect x={VIEWBOX_W - 75} y={8} width={65} height={24} rx={6} fill="rgba(0,0,0,0.5)" />
              <text
                x={VIEWBOX_W - 42}
                y={24}
                textAnchor="middle"
                fontSize="11"
                fontFamily="monospace"
                fill="#80deea"
              >
                {visibleBounces.length} {visibleBounces.length === 1 ? 'bounce' : 'bounces'}
              </text>
            </g>
          )}

          {/* Target status during animation */}
          {phase === 'animating' && targets.length > 1 && (
            <g>
              <rect x={8} y={8} width={80} height={24} rx={6} fill="rgba(0,0,0,0.5)" />
              <text
                x={48}
                y={24}
                textAnchor="middle"
                fontSize="11"
                fontFamily="monospace"
                fill={targets.every((t) => t.hit) ? '#4caf50' : '#ffd700'}
              >
                {targets.filter((t) => t.hit).length}/{targets.length} targets
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
              You used all {level.maxShots} shots without hitting every target.
              <br />
              Targets hit: {targets.filter((t) => t.hit).length}/{targets.length}
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
        <span className={styles.angleDisplay}>
          {Math.round(aimAngle)}°
        </span>
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

// ── Sub-components ──────────────────────────────────────

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
  // Draw tick marks every 15 degrees
  const ticks: { x1: number; y1: number; x2: number; y2: number; label?: string }[] = []
  for (let deg = 0; deg < 360; deg += 15) {
    const rad = (deg * Math.PI) / 180
    const cos = Math.cos(rad)
    const sin = -Math.sin(rad) // SVG y is flipped
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
      {/* Background arc */}
      <circle
        cx={center.x}
        cy={center.y}
        r={radius}
        fill="rgba(0, 188, 212, 0.05)"
        stroke="rgba(0, 188, 212, 0.2)"
        strokeWidth="1"
      />
      {/* Tick marks */}
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
      {/* Current angle indicator line */}
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

  // Draw the normal line
  const normalLen = 25

  // Draw incidence and reflection arcs
  const inAngleRad = Math.atan2(-incoming.y, -incoming.x) // reverse incoming direction
  const outAngleRad = Math.atan2(outgoing.y, outgoing.x)
  const normalAngleRad = Math.atan2(normal.y, normal.x)

  // Small arcs showing angle in and angle out
  const incArcStart = normalAngleRad
  const incArcEnd = inAngleRad
  const refArcStart = outAngleRad
  const refArcEnd = normalAngleRad

  function arcPath(cx: number, cy: number, r: number, startAngle: number, endAngle: number): string {
    // Normalize the sweep
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
      {/* Normal line (dashed) */}
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
      {/* Incidence arc */}
      <path
        d={arcPath(pos.x, pos.y, arcRadius, incArcStart, incArcEnd)}
        fill="none"
        stroke="#4caf50"
        strokeWidth="1.5"
        opacity="0.8"
      />
      {/* Reflection arc */}
      <path
        d={arcPath(pos.x, pos.y, arcRadius, refArcStart, refArcEnd)}
        fill="none"
        stroke="#2196f3"
        strokeWidth="1.5"
        opacity="0.8"
      />
      {/* Angle label */}
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
      {/* Bounce flash dot */}
      <circle cx={pos.x} cy={pos.y} r={3} fill="#00bcd4" opacity="0.7" />
    </g>
  )
}

/** Particle burst effect when a target is hit */
function HitParticles({ center }: { center: Vec2 }) {
  const particleCount = 8
  return (
    <g>
      {Array.from({ length: particleCount }, (_, i) => {
        const angle = (i / particleCount) * Math.PI * 2
        const dist = 30
        return (
          <circle
            key={i}
            cx={center.x}
            cy={center.y}
            r={3}
            fill="#ffd700"
            opacity="0"
          >
            <animate
              attributeName="cx"
              from={`${center.x}`}
              to={`${center.x + Math.cos(angle) * dist}`}
              dur="0.6s"
              fill="freeze"
            />
            <animate
              attributeName="cy"
              from={`${center.y}`}
              to={`${center.y + Math.sin(angle) * dist}`}
              dur="0.6s"
              fill="freeze"
            />
            <animate
              attributeName="opacity"
              from="1"
              to="0"
              dur="0.6s"
              fill="freeze"
            />
            <animate
              attributeName="r"
              from="3"
              to="1"
              dur="0.6s"
              fill="freeze"
            />
          </circle>
        )
      })}
    </g>
  )
}
