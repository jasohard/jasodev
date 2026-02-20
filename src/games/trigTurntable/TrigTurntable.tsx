/**
 * Trig Turntable — Main Game Component
 *
 * Stack spinning circles to create mesmerizing wave patterns.
 * One circle makes a sine wave. Two make music. Five make art.
 * You'll accidentally learn Fourier analysis.
 */

import { useReducer, useCallback, useRef, useEffect, useState, useMemo } from 'react'
import { gameReducer, initializeLevel, isCircleLocked } from './gameState'
import {
  computeEpicycleTip,
  computeWaveY,
  computeMatchScore,
  calculateStars,
  generateEquation,
} from './engine'
import { LEVELS } from './levels'
import type { CircleParams, ObservationPhase } from './types'
import styles from './TrigTurntable.module.css'

// ── Layout constants (SVG viewBox) ──────────────
const VB_W = 600
const VB_H = 360
const CIRCLE_CX = 130 // Center of the circle area
const CIRCLE_CY = 180
const CIRCLE_SCALE = 70 // Pixels per unit amplitude
const WAVE_X_START = 270 // Where the wave timeline begins
const WAVE_X_END = 590 // Where the wave timeline ends
const WAVE_Y_CENTER = 180 // Center line of the wave
const WAVE_Y_SCALE = 70 // Pixels per unit amplitude
const WAVE_NUM_POINTS = 300

// ── Observation mode timing (seconds) ───────────
const OBS_PHASE_DURATION = 2 // Duration per phase

export default function TrigTurntable() {
  const [state, dispatch] = useReducer(
    gameReducer,
    { levelId: 1, levelStars: {} },
    (init) => initializeLevel(init.levelId, init.levelStars)
  )

  const [showHint, setShowHint] = useState(true)
  const [isDraggingAmplitude, setIsDraggingAmplitude] = useState(false)
  const [isDraggingPhase, setIsDraggingPhase] = useState(false)
  const svgRef = useRef<SVGSVGElement>(null)
  const animRef = useRef<number>(0)
  const lastTimeRef = useRef<number>(0)
  const timeRef = useRef<number>(0)
  const speedRef = useRef<number>(1)

  const {
    level, circles, selectedCircleIndex, time, isPlaying,
    speed, matchScore, stars, levelStars, phase,
    observationPhase, showSecondaryHint,
  } = state

  const selectedCircle = circles[selectedCircleIndex]

  // Keep refs in sync with state (post-render effect to avoid side effects during render)
  useEffect(() => {
    timeRef.current = time
    speedRef.current = speed
  }, [time, speed])

  // ── Animation loop ──────────────────────────────
  useEffect(() => {
    if (!isPlaying) return
    if (phase !== 'playing' && phase !== 'observation') return

    lastTimeRef.current = performance.now()

    const animate = (now: number) => {
      const dt = Math.min((now - lastTimeRef.current) / 1000, 0.1) // Cap dt to avoid jumps
      lastTimeRef.current = now
      const newTime = timeRef.current + dt * speedRef.current * 2 // Base speed: 2 rad/s
      dispatch({ type: 'UPDATE_TIME', time: newTime })
      animRef.current = requestAnimationFrame(animate)
    }

    animRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animRef.current)
  }, [isPlaying, phase])

  // ── Observation mode auto-advance ─────────────────
  useEffect(() => {
    if (phase !== 'observation') return

    const sequence: { phase: ObservationPhase; delay: number }[] = [
      { phase: 'circle2', delay: OBS_PHASE_DURATION * 1000 },
      { phase: 'combined', delay: OBS_PHASE_DURATION * 2 * 1000 },
      { phase: 'done', delay: OBS_PHASE_DURATION * 3 * 1000 },
    ]

    const timers = sequence.map(({ phase: p, delay }) =>
      window.setTimeout(() => {
        dispatch({ type: 'ADVANCE_OBSERVATION', phase: p })
      }, delay)
    )

    return () => timers.forEach(clearTimeout)
  }, [phase, level.id])

  // ── Score computation (throttled) ───────────────
  useEffect(() => {
    if (level.artMode || level.observationMode || phase !== 'playing') return
    const score = computeMatchScore(circles, level.targetCircles)
    dispatch({ type: 'UPDATE_SCORE', score })
  }, [circles, level, phase])

  // Reset hint when level changes
  useEffect(() => {
    setShowHint(true)
  }, [level.id])

  // ── SVG coordinate conversion ───────────────────
  const svgPoint = useCallback((clientX: number, clientY: number) => {
    const svg = svgRef.current
    if (!svg) return null
    const rect = svg.getBoundingClientRect()
    return {
      x: ((clientX - rect.left) / rect.width) * VB_W,
      y: ((clientY - rect.top) / rect.height) * VB_H,
    }
  }, [])

  // ── Drag handling for amplitude and phase ───────
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (phase !== 'playing') return
    if (level.observationMode) return
    const pt = svgPoint(e.clientX, e.clientY)
    if (!pt || !selectedCircle) return
    if (isCircleLocked(level, selectedCircleIndex)) return

    // Compute current tip position of selected circle
    const epicycle = computeEpicycleTip(circles.slice(0, selectedCircleIndex + 1), time, CIRCLE_CX, CIRCLE_CY)
    const tip = epicycle.intermediates[selectedCircleIndex]
    if (!tip) return

    const distToTip = Math.sqrt((pt.x - tip.tipX) ** 2 + (pt.y - tip.tipY) ** 2)

    if (distToTip < 30) {
      setIsDraggingAmplitude(true)
      svgRef.current?.setPointerCapture(e.pointerId)
      e.preventDefault()
      return
    }

    // Check if near the circle rim (for phase drag)
    const distToCenter = Math.sqrt((pt.x - tip.cx) ** 2 + (pt.y - tip.cy) ** 2)
    const circleRadius = selectedCircle.amplitude * CIRCLE_SCALE
    if (Math.abs(distToCenter - circleRadius) < 20) {
      setIsDraggingPhase(true)
      svgRef.current?.setPointerCapture(e.pointerId)
      e.preventDefault()
    }
  }, [phase, svgPoint, selectedCircle, circles, selectedCircleIndex, time, level])

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDraggingAmplitude && !isDraggingPhase) return
    const pt = svgPoint(e.clientX, e.clientY)
    if (!pt) return

    // Get center of the selected circle
    const epicycle = computeEpicycleTip(circles.slice(0, selectedCircleIndex), time, CIRCLE_CX, CIRCLE_CY)
    const parentTip = selectedCircleIndex === 0
      ? { x: CIRCLE_CX, y: CIRCLE_CY }
      : { x: epicycle.x, y: epicycle.y }

    if (isDraggingAmplitude) {
      const dx = pt.x - parentTip.x
      const dy = pt.y - parentTip.y
      const dist = Math.sqrt(dx * dx + dy * dy)
      const newAmplitude = Math.max(0.1, Math.min(2.5, dist / CIRCLE_SCALE))
      if (!level.lockedParams.includes('amplitude')) {
        dispatch({ type: 'SET_AMPLITUDE', circleIndex: selectedCircleIndex, value: Math.round(newAmplitude * 20) / 20 })
      }
    }

    if (isDraggingPhase && selectedCircle) {
      const dx = pt.x - parentTip.x
      const dy = pt.y - parentTip.y
      // Compute angle (remember SVG y is flipped for math convention)
      const angle = Math.atan2(-dy, dx)
      // Phase = angle - frequency * time (to get the starting angle)
      const newPhase = angle - selectedCircle.frequency * time
      if (!level.lockedParams.includes('phase')) {
        dispatch({ type: 'SET_PHASE', circleIndex: selectedCircleIndex, value: newPhase })
      }
    }
  }, [isDraggingAmplitude, isDraggingPhase, svgPoint, circles, selectedCircleIndex, time, selectedCircle, level.lockedParams])

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    svgRef.current?.releasePointerCapture(e.pointerId)
    setIsDraggingAmplitude(false)
    setIsDraggingPhase(false)
  }, [])

  // ── Compute epicycle positions ──────────────────
  const epicycleData = useMemo(() => {
    return computeEpicycleTip(circles, time, CIRCLE_CX, CIRCLE_CY)
  }, [circles, time])

  // ── Determine which circles are visible (for observation mode animation) ──
  const visibleCircleCount = useMemo(() => {
    if (phase !== 'observation') return circles.length
    if (observationPhase === 'circle1') return 1
    return circles.length // circle2, combined, done — all show both circles
  }, [phase, observationPhase, circles.length])

  const showCombinedWave = phase !== 'observation' || observationPhase === 'combined' || observationPhase === 'done'

  // ── Player wave path (uses visible circles) ────
  const visibleCircles = useMemo(() => circles.slice(0, visibleCircleCount), [circles, visibleCircleCount])

  const playerWavePath = useMemo(() => {
    if (phase === 'observation' && !showCombinedWave) return ''
    const points: string[] = []
    for (let i = 0; i < WAVE_NUM_POINTS; i++) {
      const frac = i / (WAVE_NUM_POINTS - 1)
      const x = WAVE_X_START + frac * (WAVE_X_END - WAVE_X_START)
      const t = frac * 4 * Math.PI // Show 2 full periods
      const y = WAVE_Y_CENTER - computeWaveY(circles, t) * WAVE_Y_SCALE
      points.push(`${x.toFixed(1)},${y.toFixed(1)}`)
    }
    return points.join(' ')
  }, [circles, phase, showCombinedWave])

  // ── Target wave path ────────────────────────────
  const targetWavePath = useMemo(() => {
    if (level.artMode || level.targetCircles.length === 0 || level.observationMode) return ''
    const points: string[] = []
    for (let i = 0; i < WAVE_NUM_POINTS; i++) {
      const frac = i / (WAVE_NUM_POINTS - 1)
      const x = WAVE_X_START + frac * (WAVE_X_END - WAVE_X_START)
      const t = frac * 4 * Math.PI
      const y = WAVE_Y_CENTER - computeWaveY(level.targetCircles, t) * WAVE_Y_SCALE
      points.push(`${x.toFixed(1)},${y.toFixed(1)}`)
    }
    return points.join(' ')
  }, [level])

  // ── Animated wave trace ─────────────────────────
  const animatedWaveY = useMemo(() => {
    return WAVE_Y_CENTER - computeWaveY(circles, time) * WAVE_Y_SCALE
  }, [circles, time])

  // ── Connection line from epicycle tip to wave ───
  const connectionLineY = animatedWaveY

  // ── Equation string ─────────────────────────────
  const equation = useMemo(() => generateEquation(circles), [circles])

  // ── Whether this level has multi-circle context ──
  const isMultiCircleLevel = level.targetCircles.length > 1 || circles.length > 1

  // ── Submit score ────────────────────────────────
  const handleSubmit = useCallback(() => {
    if (level.artMode || level.observationMode) return
    const score = computeMatchScore(circles, level.targetCircles)
    const earnedStars = calculateStars(score, level.starThresholds)
    dispatch({ type: 'UPDATE_SCORE', score })
    if (earnedStars > 0) {
      dispatch({ type: 'COMPLETE_LEVEL', stars: earnedStars })
    }
  }, [circles, level])

  // ── Render: Level Select ────────────────────────
  if (phase === 'levelSelect') {
    return (
      <div className={styles.container}>
        <div className={styles.levelSelect}>
          <h2 className={styles.levelSelectTitle}>Trig Turntable</h2>
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
                  {lvl.artMode ? (
                    <span className={styles.artBadge}>FREE MODE</span>
                  ) : lvl.observationMode ? (
                    <span className={styles.obsBadge}>WATCH</span>
                  ) : (
                    <span className={styles.levelStars}>
                      {'★'.repeat(s)}{'☆'.repeat(3 - s)}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  const nextLevelId = level.id < LEVELS.length ? level.id + 1 : null

  // ── Render: Game ────────────────────────────────
  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.levelInfo}>
          <span className={styles.levelTitle}>
            {level.artMode ? 'Art Mode' : `Level ${level.id}: ${level.name}`}
          </span>
          <span className={styles.levelSubtitle}>{level.subtitle}</span>
        </div>
        {!level.artMode && !level.observationMode && (
          <div className={styles.scoreInfo}>
            <span
              className={styles.matchScore}
              style={{ color: matchScore >= 80 ? '#81c784' : matchScore >= 60 ? '#ffd54f' : '#ef9a9a' }}
            >
              {matchScore.toFixed(0)}%
            </span>
            <span className={styles.starDisplay}>
              {'★'.repeat(Math.max(0, stars))}{'☆'.repeat(3 - Math.max(0, stars))}
            </span>
          </div>
        )}
        {level.observationMode && (
          <div className={styles.scoreInfo}>
            <span className={styles.obsBadgeHeader}>OBSERVATION</span>
          </div>
        )}
        {level.artMode && (
          <div className={styles.scoreInfo}>
            <span className={styles.matchScore} style={{ color: '#aed581' }}>
              {circles.length} circle{circles.length !== 1 ? 's' : ''}
            </span>
          </div>
        )}
      </div>

      {/* Primary Hint */}
      {showHint && level.hint && !level.observationMode && (
        <div className={styles.hintBanner}>
          <span>{level.hint}</span>
          <button className={styles.hintDismiss} onClick={() => setShowHint(false)} aria-label="Dismiss">✕</button>
        </div>
      )}

      {/* Secondary Hint (for guided levels, shown after adding a circle) */}
      {showSecondaryHint && level.secondaryHint && (
        <div className={styles.secondaryHintBanner}>
          <span>{level.secondaryHint}</span>
          <button
            className={styles.hintDismiss}
            onClick={() => dispatch({ type: 'DISMISS_SECONDARY_HINT' })}
            aria-label="Dismiss"
          >✕</button>
        </div>
      )}

      {/* Main SVG visualization */}
      <div className={styles.vizArea}>
        <div className={styles.svgContainer}>
          <svg
            ref={svgRef}
            className={styles.gameSvg}
            viewBox={`0 0 ${VB_W} ${VB_H}`}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            style={{ touchAction: 'none' }}
          >
            <defs>
              <filter id="glow-blue" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
              <filter id="glow-soft" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="2" result="blur" />
                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
              <clipPath id="wave-clip">
                <rect x={WAVE_X_START} y={0} width={WAVE_X_END - WAVE_X_START} height={VB_H} />
              </clipPath>
            </defs>

            {/* Background */}
            <rect width={VB_W} height={VB_H} fill="#0d1117" />

            {/* Radial glow behind epicycle area */}
            <circle cx={CIRCLE_CX} cy={CIRCLE_CY} r={120} fill="none" opacity="0.06">
              <animate attributeName="r" values="110;130;110" dur="4s" repeatCount="indefinite" />
            </circle>
            <circle cx={CIRCLE_CX} cy={CIRCLE_CY} r={100} fill={selectedCircle?.color ?? '#4fc3f7'} opacity="0.03" />

            {/* Subtle grid */}
            <g opacity="0.06">
              {/* Circle area crosshairs */}
              <line x1={CIRCLE_CX} y1={40} x2={CIRCLE_CX} y2={320} stroke="#fff" strokeWidth="0.5" />
              <line x1={30} y1={CIRCLE_CY} x2={230} y2={CIRCLE_CY} stroke="#fff" strokeWidth="0.5" />
            </g>

            {/* Wave area axis */}
            <line x1={WAVE_X_START} y1={WAVE_Y_CENTER} x2={WAVE_X_END} y2={WAVE_Y_CENTER} stroke="#333" strokeWidth="1" />
            <line x1={WAVE_X_START} y1={40} x2={WAVE_X_START} y2={320} stroke="#333" strokeWidth="1" />

            {/* Wave area amplitude markers */}
            <g opacity="0.15" fontSize="8" fill="#888" fontFamily="monospace">
              <line x1={WAVE_X_START - 3} y1={WAVE_Y_CENTER - WAVE_Y_SCALE} x2={WAVE_X_START + 3} y2={WAVE_Y_CENTER - WAVE_Y_SCALE} stroke="#555" strokeWidth="1" />
              <text x={WAVE_X_START - 8} y={WAVE_Y_CENTER - WAVE_Y_SCALE + 3} textAnchor="end">1</text>
              <line x1={WAVE_X_START - 3} y1={WAVE_Y_CENTER + WAVE_Y_SCALE} x2={WAVE_X_START + 3} y2={WAVE_Y_CENTER + WAVE_Y_SCALE} stroke="#555" strokeWidth="1" />
              <text x={WAVE_X_START - 8} y={WAVE_Y_CENTER + WAVE_Y_SCALE + 3} textAnchor="end">-1</text>
            </g>

            {/* Target wave (ghost) — not shown in observation mode */}
            {targetWavePath && (
              <polyline
                points={targetWavePath}
                fill="none"
                stroke="#ffffff"
                strokeWidth="2"
                opacity="0.25"
                strokeLinejoin="round"
                clipPath="url(#wave-clip)"
              />
            )}

            {/* Difference shading between player and target */}
            {targetWavePath && !level.artMode && !level.observationMode && (
              <DifferenceShading
                playerCircles={circles}
                targetCircles={level.targetCircles}
              />
            )}

            {/* Individual wave traces per circle (faded) — with labels on multi-circle levels */}
            {circles.length > 1 && circles.map((c, i) => {
              // In observation mode, only show visible circles
              if (phase === 'observation' && i >= visibleCircleCount) return null
              // Higher opacity on multi-circle levels for better visibility (~0.4 range)
              const baseOpacity = isMultiCircleLevel ? 0.4 : 0.15
              const traceOpacity = i === selectedCircleIndex ? Math.min(baseOpacity + 0.1, 0.5) : baseOpacity
              // Fade-in animation for circle 2 in observation mode
              const fadeIn = phase === 'observation' && i === 1 && observationPhase === 'circle2'
              return (
                <g key={c.id}>
                  <IndividualWave
                    circle={c}
                    opacity={traceOpacity}
                    fadeIn={fadeIn}
                  />
                  {/* Circle label near the wave trace */}
                  {isMultiCircleLevel && (
                    <text
                      x={WAVE_X_START + 4}
                      y={WAVE_Y_CENTER - c.amplitude * WAVE_Y_SCALE * 0.7 + i * 14}
                      fill={c.color}
                      fontSize="8"
                      fontFamily="sans-serif"
                      fontWeight="600"
                      opacity={traceOpacity + 0.15}
                      clipPath="url(#wave-clip)"
                    >
                      {isCircleLocked(level, i) ? `Circle ${i + 1} 🔒` : `Circle ${i + 1}`}
                    </text>
                  )}
                </g>
              )
            })}

            {/* Player wave (combined) — animated entrance in observation mode */}
            {showCombinedWave && playerWavePath && (
              <polyline
                points={playerWavePath}
                fill="none"
                stroke={selectedCircle?.color ?? '#4fc3f7'}
                strokeWidth="2.5"
                opacity={phase === 'observation' && observationPhase === 'combined' ? 0.7 : 0.9}
                strokeLinejoin="round"
                clipPath="url(#wave-clip)"
                className={phase === 'observation' && observationPhase === 'combined' ? styles.fadeInSvg : undefined}
              />
            )}

            {/* Epicycle circles */}
            {epicycleData.intermediates.map((inter, i) => {
              // In observation mode, only show visible circles
              if (phase === 'observation' && i >= visibleCircleCount) return null
              const circle = circles[i]
              const locked = isCircleLocked(level, i)
              const isSelected = i === selectedCircleIndex && !locked
              const radius = circle.amplitude * CIRCLE_SCALE
              // Fade-in for circle 2 in observation mode
              const fadeIn = phase === 'observation' && i === 1 && observationPhase === 'circle2'
              return (
                <g
                  key={circle.id}
                  opacity={isSelected ? 1 : locked ? 0.35 : 0.5}
                  className={fadeIn ? styles.fadeInSvg : undefined}
                >
                  {/* Circle orbit */}
                  <circle
                    cx={inter.cx}
                    cy={inter.cy}
                    r={radius}
                    fill="none"
                    stroke={circle.color}
                    strokeWidth={isSelected ? 1.5 : 1}
                    strokeDasharray={isSelected ? 'none' : '4 3'}
                    opacity={isSelected ? 0.6 : 0.3}
                  />
                  {/* Radius arm */}
                  <line
                    x1={inter.cx}
                    y1={inter.cy}
                    x2={inter.tipX}
                    y2={inter.tipY}
                    stroke={circle.color}
                    strokeWidth={isSelected ? 2 : 1.5}
                    opacity={isSelected ? 0.8 : 0.4}
                  />
                  {/* Tip dot (draggable if not locked) */}
                  <circle
                    cx={inter.tipX}
                    cy={inter.tipY}
                    r={isSelected ? 8 : 5}
                    fill={circle.color}
                    filter={isSelected ? 'url(#glow-blue)' : undefined}
                    style={{ cursor: locked ? 'default' : isSelected ? 'grab' : 'pointer' }}
                  />
                  {/* Center dot */}
                  <circle
                    cx={inter.cx}
                    cy={inter.cy}
                    r={3}
                    fill={circle.color}
                    opacity={0.4}
                  />
                  {/* Lock icon on locked circles */}
                  {locked && (
                    <g>
                      <text
                        x={inter.cx + radius + 6}
                        y={inter.cy - radius + 6}
                        fill={circle.color}
                        fontSize="12"
                        opacity="0.6"
                        pointerEvents="none"
                      >
                        🔒
                      </text>
                    </g>
                  )}
                  {/* Invisible touch target for tip */}
                  {isSelected && !locked && (
                    <circle
                      cx={inter.tipX}
                      cy={inter.tipY}
                      r={22}
                      fill="transparent"
                      style={{ cursor: 'grab' }}
                    />
                  )}
                </g>
              )
            })}

            {/* Epicycle tip trailing path (spirograph-like) */}
            <EpicycleTrail circles={visibleCircles} time={time} cx={CIRCLE_CX} cy={CIRCLE_CY} />

            {/* Connection line from final tip to wave */}
            {showCombinedWave && (
              <>
                <line
                  x1={epicycleData.x}
                  y1={epicycleData.y}
                  x2={WAVE_X_START}
                  y2={connectionLineY}
                  stroke={selectedCircle?.color ?? '#4fc3f7'}
                  strokeWidth="1"
                  strokeDasharray="4 4"
                  opacity="0.4"
                />

                {/* Horizontal bar on the connection line at the wave Y position */}
                <line
                  x1={WAVE_X_START - 2}
                  y1={connectionLineY}
                  x2={WAVE_X_START + 6}
                  y2={connectionLineY}
                  stroke={selectedCircle?.color ?? '#4fc3f7'}
                  strokeWidth="3"
                  strokeLinecap="round"
                  opacity="0.7"
                />

                {/* Animated dot on wave at the connection point */}
                <circle
                  cx={WAVE_X_START + 4}
                  cy={connectionLineY}
                  r={4}
                  fill={selectedCircle?.color ?? '#4fc3f7'}
                  filter="url(#glow-soft)"
                />
              </>
            )}

            {/* Separator line between circle and wave areas */}
            <line
              x1={250}
              y1={30}
              x2={250}
              y2={330}
              stroke="#30363d"
              strokeWidth="1"
              opacity="0.5"
            />

            {/* Observation mode captions */}
            {phase === 'observation' && (
              <ObservationCaption observationPhase={observationPhase} circles={circles} />
            )}

            {/* Pulsing ring on selected circle tip while dragging */}
            {(isDraggingAmplitude || isDraggingPhase) && epicycleData.intermediates[selectedCircleIndex] && (
              <circle
                cx={epicycleData.intermediates[selectedCircleIndex].tipX}
                cy={epicycleData.intermediates[selectedCircleIndex].tipY}
                r={12}
                fill="none"
                stroke={selectedCircle?.color ?? '#4fc3f7'}
                strokeWidth="2"
                opacity="0.6"
                pointerEvents="none"
              >
                <animate attributeName="r" from="12" to="22" dur="0.8s" repeatCount="indefinite" />
                <animate attributeName="opacity" from="0.6" to="0" dur="0.8s" repeatCount="indefinite" />
              </circle>
            )}
          </svg>
        </div>

        {/* Observation mode "I See It!" button */}
        {phase === 'observation' && observationPhase === 'done' && (
          <div className={styles.observationOverlay}>
            <button
              className={styles.iSeeItBtn}
              onClick={() => dispatch({ type: 'COMPLETE_OBSERVATION' })}
            >
              I See It! →
            </button>
          </div>
        )}

        {/* Completion overlay */}
        {phase === 'complete' && (
          <div className={styles.completionOverlay}>
            <div className={styles.completionTitle}>
              {level.observationMode ? 'Great!' : 'Level Complete!'}
            </div>
            <div className={styles.completionStars}>
              {'★'.repeat(stars)}{'☆'.repeat(3 - stars)}
            </div>
            <div className={styles.completionMessage}>
              {level.observationMode
                ? 'You learned how two waves combine into one!'
                : (
                  <>
                    Match score: {matchScore.toFixed(0)}%
                    <br />
                    {stars === 3 ? 'Perfect match!' : stars === 2 ? 'Great work!' : 'Level cleared!'}
                  </>
                )
              }
            </div>
            <div className={styles.completionActions}>
              <button className={styles.retryButton} onClick={() => dispatch({ type: 'RESET_LEVEL' })}>
                {level.observationMode ? 'Watch Again' : 'Retry'}
              </button>
              {nextLevelId && (
                <button className={styles.nextButton} onClick={() => dispatch({ type: 'SELECT_LEVEL', levelId: nextLevelId })}>
                  Next Level
                </button>
              )}
              <button className={styles.retryButton} onClick={() => dispatch({ type: 'GO_TO_LEVEL_SELECT' })}>
                Levels
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Equation display */}
      <div className={styles.equationBar}>{equation}</div>

      {/* Parameter controls — hidden in observation mode */}
      {!level.observationMode && (
        <div className={styles.controlsPanel}>
          {/* Circle selector tabs */}
          <div className={styles.circleSelector}>
            {circles.map((c, i) => {
              const locked = isCircleLocked(level, i)
              return (
                <button
                  key={c.id}
                  className={
                    locked
                      ? styles.circleTabLocked
                      : i === selectedCircleIndex
                        ? styles.circleTabActive
                        : styles.circleTab
                  }
                  style={{ borderColor: !locked && i === selectedCircleIndex ? c.color : 'transparent' }}
                  onClick={() => {
                    if (!locked) dispatch({ type: 'SELECT_CIRCLE', index: i })
                  }}
                  aria-disabled={locked}
                >
                  <span className={styles.circleTabDot} style={{ background: c.color }} />
                  <span>
                    {locked ? `Circle ${i + 1} 🔒` : `Circle ${i + 1}`}
                  </span>
                  {!locked && circles.length > 1 && (
                    <button
                      className={styles.removeCircle}
                      onClick={(e) => {
                        e.stopPropagation()
                        dispatch({ type: 'REMOVE_CIRCLE', index: i })
                      }}
                      aria-label={`Remove circle ${i + 1}`}
                    >
                      ×
                    </button>
                  )}
                </button>
              )
            })}
            {circles.length < level.maxCircles && (
              <button className={styles.addCircleBtn} onClick={() => dispatch({ type: 'ADD_CIRCLE' })}>
                + Add
              </button>
            )}
          </div>

          {/* Parameter sliders for selected circle */}
          {selectedCircle && !isCircleLocked(level, selectedCircleIndex) && (
            <>
              {/* Amplitude */}
              <div className={styles.paramRow}>
                <span className={styles.paramLabel}>Amp</span>
                {level.lockedParams.includes('amplitude') ? (
                  <span className={styles.paramLocked}>Locked ({selectedCircle.amplitude.toFixed(1)})</span>
                ) : (
                  <>
                    <input
                      type="range"
                      className={styles.paramSlider}
                      min="0.1"
                      max="2.5"
                      step="0.05"
                      value={selectedCircle.amplitude}
                      onChange={(e) => dispatch({
                        type: 'SET_AMPLITUDE',
                        circleIndex: selectedCircleIndex,
                        value: parseFloat(e.target.value),
                      })}
                      style={{
                        accentColor: selectedCircle.color,
                      }}
                    />
                    <span className={styles.paramValue}>{selectedCircle.amplitude.toFixed(2)}</span>
                  </>
                )}
              </div>
              {/* Frequency */}
              <div className={styles.paramRow}>
                <span className={styles.paramLabel}>Freq</span>
                {level.lockedParams.includes('frequency') ? (
                  <span className={styles.paramLocked}>Locked ({selectedCircle.frequency})</span>
                ) : (
                  <>
                    <input
                      type="range"
                      className={styles.paramSlider}
                      min="0.5"
                      max="8"
                      step="0.5"
                      value={selectedCircle.frequency}
                      onChange={(e) => dispatch({
                        type: 'SET_FREQUENCY',
                        circleIndex: selectedCircleIndex,
                        value: parseFloat(e.target.value),
                      })}
                      style={{
                        accentColor: selectedCircle.color,
                      }}
                    />
                    <span className={styles.paramValue}>{selectedCircle.frequency.toFixed(1)}</span>
                  </>
                )}
              </div>
              {/* Phase */}
              <div className={styles.paramRow}>
                <span className={styles.paramLabel}>Phase</span>
                {level.lockedParams.includes('phase') ? (
                  <span className={styles.paramLocked}>Locked (0)</span>
                ) : (
                  <>
                    <input
                      type="range"
                      className={styles.paramSlider}
                      min={-Math.PI}
                      max={Math.PI}
                      step={0.05}
                      value={selectedCircle.phase}
                      onChange={(e) => dispatch({
                        type: 'SET_PHASE',
                        circleIndex: selectedCircleIndex,
                        value: parseFloat(e.target.value),
                      })}
                      style={{
                        accentColor: selectedCircle.color,
                      }}
                    />
                    <span className={styles.paramValue}>
                      {(selectedCircle.phase / Math.PI).toFixed(2)}π
                    </span>
                  </>
                )}
              </div>
            </>
          )}

          {/* Show locked circle info if a locked circle is "selected" somehow */}
          {selectedCircle && isCircleLocked(level, selectedCircleIndex) && (
            <div className={styles.lockedInfo}>
              This circle is locked — select another circle to adjust.
            </div>
          )}
        </div>
      )}

      {/* Transport controls */}
      <div className={styles.transport}>
        <button className={styles.levelsBtn} onClick={() => dispatch({ type: 'GO_TO_LEVEL_SELECT' })}>
          Levels
        </button>
        <button className={styles.playBtn} onClick={() => dispatch({ type: 'TOGGLE_PLAY' })}>
          {isPlaying ? '⏸' : '▶'}
        </button>
        <button
          className={styles.speedBtn}
          onClick={() => dispatch({ type: 'SET_SPEED', speed: speed === 1 ? 2 : speed === 2 ? 0.5 : 1 })}
        >
          {speed}×
        </button>
        {!level.observationMode && (
          <button className={styles.resetBtn} onClick={() => dispatch({ type: 'RESET_LEVEL' })}>
            Reset
          </button>
        )}
        {!level.artMode && !level.observationMode && (
          <button className={styles.submitBtn} onClick={handleSubmit}>
            Check
          </button>
        )}
      </div>
    </div>
  )
}

// ── Sub-components ──────────────────────────────

/**
 * Renders a single circle's wave contribution as a faded trace.
 */
function IndividualWave({ circle, opacity, fadeIn }: { circle: CircleParams; opacity: number; fadeIn?: boolean }) {
  const points = useMemo(() => {
    const pts: string[] = []
    for (let i = 0; i < 200; i++) {
      const frac = i / 199
      const x = WAVE_X_START + frac * (WAVE_X_END - WAVE_X_START)
      const t = frac * 4 * Math.PI
      const y = WAVE_Y_CENTER - circle.amplitude * Math.sin(circle.frequency * t + circle.phase) * WAVE_Y_SCALE
      pts.push(`${x.toFixed(1)},${y.toFixed(1)}`)
    }
    return pts.join(' ')
  }, [circle])

  return (
    <polyline
      points={points}
      fill="none"
      stroke={circle.color}
      strokeWidth="1.5"
      opacity={opacity}
      strokeLinejoin="round"
      clipPath="url(#wave-clip)"
      className={fadeIn ? styles.fadeInSvg : undefined}
    />
  )
}

/**
 * Renders a fading trail behind the final epicycle tip.
 * Creates a spirograph-like visual that shows the epicycle path.
 */
function EpicycleTrail({
  circles,
  time,
  cx,
  cy,
}: {
  circles: CircleParams[]
  time: number
  cx: number
  cy: number
}) {
  const trailPoints = useMemo(() => {
    const numTrailPoints = 80
    const trailDuration = 3 // seconds of trail history
    const pts: string[] = []

    for (let i = 0; i < numTrailPoints; i++) {
      const frac = i / (numTrailPoints - 1)
      const t = Math.max(0, time - trailDuration * (1 - frac))
      const tip = computeEpicycleTip(circles, t, cx, cy)
      pts.push(`${tip.x.toFixed(1)},${tip.y.toFixed(1)}`)
    }
    return pts.join(' ')
  }, [circles, time, cx, cy])

  const lastCircle = circles[circles.length - 1]
  const color = lastCircle?.color ?? '#4fc3f7'

  return (
    <polyline
      points={trailPoints}
      fill="none"
      stroke={color}
      strokeWidth="1.5"
      opacity="0.25"
      strokeLinejoin="round"
      strokeLinecap="round"
    />
  )
}

/**
 * Renders translucent shading between player wave and target wave
 * to visualize the difference.
 */
function DifferenceShading({
  playerCircles,
  targetCircles,
}: {
  playerCircles: CircleParams[]
  targetCircles: CircleParams[]
}) {
  const pathD = useMemo(() => {
    const numPoints = 150
    // Build a closed path: player wave forward, target wave backward
    const playerPoints: string[] = []
    const targetPoints: string[] = []

    for (let i = 0; i < numPoints; i++) {
      const frac = i / (numPoints - 1)
      const x = WAVE_X_START + frac * (WAVE_X_END - WAVE_X_START)
      const t = frac * 4 * Math.PI
      const py = WAVE_Y_CENTER - computeWaveY(playerCircles, t) * WAVE_Y_SCALE
      const ty = WAVE_Y_CENTER - computeWaveY(targetCircles, t) * WAVE_Y_SCALE
      playerPoints.push(`${x.toFixed(1)},${py.toFixed(1)}`)
      targetPoints.push(`${x.toFixed(1)},${ty.toFixed(1)}`)
    }

    // Closed polygon: player forward then target reversed
    return `M ${playerPoints.join(' L ')} L ${targetPoints.reverse().join(' L ')} Z`
  }, [playerCircles, targetCircles])

  return (
    <path
      d={pathD}
      fill="rgba(239, 83, 80, 0.12)"
      clipPath="url(#wave-clip)"
    />
  )
}

/**
 * Observation mode captions that appear during the animated intro.
 */
function ObservationCaption({
  observationPhase,
  circles,
}: {
  observationPhase: ObservationPhase
  circles: CircleParams[]
}) {
  const captions: Record<ObservationPhase, string> = {
    circle1: `Wave 1 (${circles[0]?.color === '#4fc3f7' ? 'blue' : 'circle 1'})`,
    circle2: `Wave 2 (${circles[1]?.color === '#f06292' ? 'pink' : 'circle 2'}) joins in...`,
    combined: 'Wave 1 + Wave 2 = Combined Wave',
    done: 'The thick wave = blue + pink, added at every point!',
  }

  return (
    <g className={styles.fadeInSvg}>
      {/* Semi-transparent background for readability */}
      <rect
        x={WAVE_X_START + 10}
        y={VB_H - 40}
        width={WAVE_X_END - WAVE_X_START - 20}
        height={28}
        rx={6}
        fill="rgba(0,0,0,0.7)"
      />
      <text
        x={(WAVE_X_START + WAVE_X_END) / 2}
        y={VB_H - 21}
        fill="#e8e8f0"
        fontSize="11"
        fontFamily="sans-serif"
        fontWeight="600"
        textAnchor="middle"
      >
        {captions[observationPhase]}
      </text>
    </g>
  )
}
