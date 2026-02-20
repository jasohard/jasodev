/**
 * Slope Surfer — Main game component.
 *
 * A surfer rides along a mathematical curve where:
 * - Their board IS the tangent line
 * - Their speed IS |f'(x)|
 *
 * Players drag control points to reshape terrain, then launch
 * the surfer to collect gems and reach a target zone.
 *
 * Animation uses refs for mutable game state to avoid stale closures
 * in requestAnimationFrame loops.
 */

import { useReducer, useCallback, useRef, useEffect, useMemo, useState } from 'react'
import { LEVELS } from './levels'
import { gameReducer, createInitialState } from './gameState'
import {
  buildMonotoneCubic,
  numericalDerivative,
  surferSpeed,
  checkGemCollision,
  checkTargetReached,
  landingPrecision,
  computeStars,
  createGemBurst,
  createLandingBurst,
  createSpeedTrail,
  updateParticles,
  comboMultiplier,
  comboColor,
  BOARD_WIDTH,
  BOARD_HEIGHT,
} from './engine'
import type { Vec2, Particle } from './types'

import Terrain from './components/Terrain'
import ControlPoints from './components/ControlPoints'
import Surfer from './components/Surfer'
import GemsComponent from './components/Gems'
import TargetZoneComponent from './components/TargetZone'
import SpeedOverlay from './components/SpeedOverlay'
import HUD from './components/HUD'
import DerivativeGraph from './components/DerivativeGraph'
import ParticlesComponent from './components/Particles'
import Controls from './components/Controls'
import LevelSelect from './components/LevelSelect'
import LevelComplete from './components/LevelComplete'
import ScorePopup from './components/ScorePopup'
import type { ScorePopupItem } from './components/ScorePopup'

import styles from './SlopeSurfer.module.css'

let popupIdCounter = 0

/**
 * Mutable animation state stored in a ref to avoid stale closures.
 * Synced back to React state on each frame via setState.
 */
interface AnimState {
  x: number
  speed: number
  derivative: number
  rideTime: number
  gemsCollected: Set<number>
  comboCount: number
  comboTimer: number
  score: number
  particles: Particle[]
  boardFlash: boolean
  shakeOffset: Vec2
  phase: 'riding' | 'done'
}

export default function SlopeSurfer() {
  const [currentLevelId, setCurrentLevelId] = useState(1)
  const [bestStars, setBestStars] = useState<Record<number, number>>({})
  const [scorePopups, setScorePopups] = useState<ScorePopupItem[]>([])

  const level = useMemo(
    () => LEVELS.find(l => l.id === currentLevelId) ?? LEVELS[0],
    [currentLevelId]
  )

  const [state, dispatch] = useReducer(gameReducer, level, createInitialState)
  const svgRef = useRef<SVGSVGElement | null>(null)
  const animRef = useRef(0)
  const lastTimeRef = useRef(0)
  const speedTrailTimer = useRef(0)
  const animStateRef = useRef<AnimState | null>(null)

  // ─── Render state (updated each frame from animStateRef) ──────────

  const [renderState, setRenderState] = useState({
    surferX: 0,
    surferSpeed: 0,
    surferDerivative: 0,
    rideTime: 0,
    gemsCollected: new Set<number>(),
    comboCount: 0,
    score: 0,
    particles: [] as Particle[],
    boardFlash: false,
    shakeOffset: { x: 0, y: 0 } as Vec2,
  })

  // ─── Build the interpolation curve from control points ────────────

  const curveFunc = useMemo(() => {
    const allPoints: Vec2[] = [
      level.startPoint,
      ...state.controlPoints.map(cp => ({ x: cp.x, y: cp.y })),
      level.endPoint,
    ]
    return buildMonotoneCubic(allPoints)
  }, [level.startPoint, level.endPoint, state.controlPoints])

  // Keep curveFunc in a ref so the animation loop can access it
  const curveFuncRef = useRef(curveFunc)
  curveFuncRef.current = curveFunc

  const levelRef = useRef(level)
  levelRef.current = level

  // ─── Derivative function ──────────────────────────────────────────

  // Surfer position values — use render state during riding, state otherwise
  const isRiding = state.phase === 'riding'
  const displayX = isRiding ? renderState.surferX : state.surferX
  const displayDerivative = isRiding
    ? renderState.surferDerivative
    : numericalDerivative(curveFunc, state.surferX)
  const displaySpeed = isRiding
    ? renderState.surferSpeed
    : surferSpeed(displayDerivative, level.speedMultiplier)
  const displayGems = isRiding ? renderState.gemsCollected : state.gemsCollected
  const displayCombo = isRiding ? renderState.comboCount : state.comboCount
  const displayScore = isRiding ? renderState.score : state.score
  const displayRideTime = isRiding ? renderState.rideTime : state.rideTime
  const displayParticles = isRiding ? renderState.particles : state.particles
  const displayBoardFlash = isRiding ? renderState.boardFlash : state.boardFlash
  const displayShake = isRiding ? renderState.shakeOffset : state.shakeOffset

  // Stars for display
  const levelGems = level.gems
  const stars: 0 | 1 | 2 | 3 = state.phase === 'success'
    ? computeStars(
        true,
        state.gemsCollected.size,
        levelGems.length,
        state.rideTime,
        level.parTime,
        level.freestyle
      )
    : 0

  // Update best stars on success
  useEffect(() => {
    if (state.phase === 'success' && stars > 0) {
      setBestStars(prev => ({
        ...prev,
        [currentLevelId]: Math.max(prev[currentLevelId] ?? 0, stars),
      }))
    }
  }, [state.phase, stars, currentLevelId])

  // SVG viewBox height (taller if derivative graph is shown)
  const svgHeight = state.showDerivGraph ? BOARD_HEIGHT + 80 : BOARD_HEIGHT

  // Set page title
  useEffect(() => {
    document.title = `Slope Surfer - ${level.name} | jasodev`
    return () => { document.title = 'jasodev' }
  }, [level.name])

  // ─── Animation Loop (ref-based, no stale closures) ────────────────

  const animLoop = useCallback((timestamp: number) => {
    const anim = animStateRef.current
    if (!anim || anim.phase !== 'riding') return

    if (lastTimeRef.current === 0) {
      lastTimeRef.current = timestamp
    }
    const dt = Math.min((timestamp - lastTimeRef.current) / 1000, 0.05)
    lastTimeRef.current = timestamp
    if (dt === 0) {
      animRef.current = requestAnimationFrame(animLoop)
      return
    }

    const cf = curveFuncRef.current
    const lev = levelRef.current

    // Advance surfer position
    const derivative = numericalDerivative(cf, anim.x)
    const speed = surferSpeed(derivative, lev.speedMultiplier)
    const newX = anim.x + speed * dt

    // Update combo timer
    anim.comboTimer = Math.max(0, anim.comboTimer - dt)
    if (anim.comboTimer <= 0) {
      anim.comboCount = 0
    }

    // Update particles
    anim.particles = updateParticles(anim.particles, dt)

    // Board flash decay
    if (anim.boardFlash) {
      // Will be cleared by timeout
    }

    // Check if surfer has gone past the end
    if (newX >= lev.endPoint.x) {
      const curveY = cf(lev.endPoint.x)
      anim.phase = 'done'
      anim.x = lev.endPoint.x

      if (checkTargetReached(newX, curveY, lev.target)) {
        const precision = landingPrecision(newX, lev.target)

        // Landing burst particles
        const burstPos = { x: (lev.target.xStart + lev.target.xEnd) / 2, y: lev.target.yCenter }
        anim.particles = [...anim.particles, ...createLandingBurst(burstPos)]

        // Shake
        anim.shakeOffset = { x: (Math.random() - 0.5) * 6, y: (Math.random() - 0.5) * 6 }

        // Sync final state to React
        syncToReact(anim)
        dispatch({
          type: 'LAND_SUCCESS',
          precision,
          rideScore: anim.score,
          rideGems: anim.gemsCollected,
          rideTime: anim.rideTime,
          rideCombo: anim.comboCount,
        })

        setTimeout(() => dispatch({ type: 'SET_SHAKE', offset: { x: 0, y: 0 } }), 200)
      } else if (lev.autoPass) {
        syncToReact(anim)
        dispatch({
          type: 'LAND_SUCCESS',
          precision: 1,
          rideScore: anim.score,
          rideGems: anim.gemsCollected,
          rideTime: anim.rideTime,
          rideCombo: anim.comboCount,
        })
      } else {
        syncToReact(anim)
        dispatch({
          type: 'LAND_FAILED',
          rideScore: anim.score,
          rideGems: anim.gemsCollected,
          rideTime: anim.rideTime,
        })
      }
      return
    }

    // Update position
    anim.x = newX
    anim.speed = speed
    anim.derivative = derivative
    anim.rideTime += dt

    // Check gem collisions
    const surferY = cf(newX)
    const gemsToCheck = lev.gems
    for (const gem of gemsToCheck) {
      if (!anim.gemsCollected.has(gem.id)) {
        if (checkGemCollision({ x: newX, y: surferY }, gem)) {
          anim.gemsCollected = new Set(anim.gemsCollected)
          anim.gemsCollected.add(gem.id)
          anim.comboCount = anim.comboTimer > 0 ? anim.comboCount + 1 : 1
          anim.comboTimer = 1.0

          const mult = comboMultiplier(anim.comboCount)
          const points = Math.round(100 * mult)
          anim.score += points

          // Gem burst particles
          anim.particles = [...anim.particles, ...createGemBurst({ x: gem.x, y: gem.y })]

          // Board flash
          anim.boardFlash = true
          setTimeout(() => {
            if (animStateRef.current) animStateRef.current.boardFlash = false
          }, 100)

          // Score popup
          const color = comboColor(anim.comboCount)
          setScorePopups(prev => [
            ...prev.slice(-5),
            { id: popupIdCounter++, x: gem.x, y: gem.y - 10, text: `+${points}`, color },
          ])

          // Small shake
          anim.shakeOffset = { x: (Math.random() - 0.5) * 2, y: (Math.random() - 0.5) * 2 }
          setTimeout(() => {
            if (animStateRef.current) animStateRef.current.shakeOffset = { x: 0, y: 0 }
          }, 80)
        }
      }
    }

    // Speed trail particles
    speedTrailTimer.current += dt
    if (speed > 60 && speedTrailTimer.current > 0.08) {
      speedTrailTimer.current = 0
      const angle = Math.atan(derivative)
      anim.particles = [...anim.particles, createSpeedTrail({ x: newX, y: surferY }, angle)]
    }

    // Sync to React render state
    setRenderState({
      surferX: anim.x,
      surferSpeed: anim.speed,
      surferDerivative: anim.derivative,
      rideTime: anim.rideTime,
      gemsCollected: anim.gemsCollected,
      comboCount: anim.comboCount,
      score: anim.score,
      particles: anim.particles,
      boardFlash: anim.boardFlash,
      shakeOffset: anim.shakeOffset,
    })

    animRef.current = requestAnimationFrame(animLoop)
  }, []) // No deps — all reads are from refs

  // Helper to sync final animation state back to the reducer
  function syncToReact(anim: AnimState) {
    // The reducer actions will handle the final state
    // We just need the render state to show the final frame
    setRenderState({
      surferX: anim.x,
      surferSpeed: anim.speed,
      surferDerivative: anim.derivative,
      rideTime: anim.rideTime,
      gemsCollected: anim.gemsCollected,
      comboCount: anim.comboCount,
      score: anim.score,
      particles: anim.particles,
      boardFlash: anim.boardFlash,
      shakeOffset: anim.shakeOffset,
    })
  }

  // Start animation when riding begins
  useEffect(() => {
    if (state.phase === 'riding') {
      // Initialize animation state from current state
      animStateRef.current = {
        x: state.surferX,
        speed: 0,
        derivative: 0,
        rideTime: 0,
        gemsCollected: new Set<number>(),
        comboCount: 0,
        comboTimer: 0,
        score: 0,
        particles: [],
        boardFlash: false,
        shakeOffset: { x: 0, y: 0 },
        phase: 'riding',
      }
      lastTimeRef.current = 0
      speedTrailTimer.current = 0
      animRef.current = requestAnimationFrame(animLoop)
    } else {
      cancelAnimationFrame(animRef.current)
      animStateRef.current = null
    }
    return () => cancelAnimationFrame(animRef.current)
  }, [state.phase]) // eslint-disable-line react-hooks/exhaustive-deps

  // Clean up popups periodically
  useEffect(() => {
    if (scorePopups.length === 0) return
    const timer = setTimeout(() => {
      setScorePopups(prev => prev.slice(1))
    }, 900)
    return () => clearTimeout(timer)
  }, [scorePopups])

  // ─── Handlers ─────────────────────────────────────────────────────

  const handleDragControlPoint = useCallback((id: number, y: number) => {
    dispatch({ type: 'DRAG_CONTROL_POINT', id, y })
  }, [])

  const handleSurf = useCallback(() => {
    dispatch({ type: 'LAUNCH_SURFER' })
  }, [])

  const handleRetry = useCallback(() => {
    cancelAnimationFrame(animRef.current)
    animStateRef.current = null
    dispatch({ type: 'RESET_TERRAIN', level })
    setScorePopups([])
  }, [level])

  const handleToggleDerivative = useCallback(() => {
    dispatch({ type: 'TOGGLE_DERIVATIVE' })
  }, [])

  const handleToggleSpeed = useCallback(() => {
    dispatch({ type: 'TOGGLE_SPEED_OVERLAY' })
  }, [])

  const handleLevelSelect = useCallback(() => {
    cancelAnimationFrame(animRef.current)
    animStateRef.current = null
    dispatch({ type: 'ENTER_LEVEL_SELECT' })
  }, [])

  const handleSelectLevel = useCallback((id: number) => {
    cancelAnimationFrame(animRef.current)
    animStateRef.current = null
    const newLevel = LEVELS.find(l => l.id === id) ?? LEVELS[0]
    setCurrentLevelId(id)
    dispatch({ type: 'SELECT_LEVEL', level: newLevel })
    setScorePopups([])
  }, [])

  const handleBackFromSelect = useCallback(() => {
    dispatch({ type: 'SELECT_LEVEL', level })
  }, [level])

  const handleNextLevel = useCallback(() => {
    if (currentLevelId < LEVELS.length) {
      handleSelectLevel(currentLevelId + 1)
    }
  }, [currentLevelId, handleSelectLevel])

  const handleResetTerrain = useCallback(() => {
    dispatch({ type: 'RESET_TERRAIN', level })
  }, [level])

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter') {
        if (state.phase === 'planning') {
          e.preventDefault()
          handleSurf()
        }
      }
      if (e.key === 'r' || e.key === 'R') {
        handleRetry()
      }
      if (e.key === 'n' || e.key === 'N') {
        if (state.phase === 'success' && currentLevelId < LEVELS.length) {
          handleNextLevel()
        }
      }
      if (e.key === 'd' || e.key === 'D') {
        handleToggleDerivative()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [state.phase, currentLevelId, handleSurf, handleRetry, handleNextLevel, handleToggleDerivative])

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Slope Surfer</h1>
        <p className={styles.levelLabel}>
          Level {level.id}: {level.name}
        </p>
        <p className={styles.subtitle}>{level.subtitle}</p>
      </header>

      {state.phase === 'planning' && (
        <p className={styles.hint}>{level.hint}</p>
      )}

      {/* Main game SVG */}
      <div className={styles.boardWrapper}>
        <svg
          ref={svgRef}
          viewBox={`0 0 ${BOARD_WIDTH} ${svgHeight}`}
          className={styles.board}
          style={{ touchAction: 'none', userSelect: 'none' }}
        >
          {/* Sky gradient background */}
          <defs>
            <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0b0f1a" />
              <stop offset="100%" stopColor="#1a0f2e" />
            </linearGradient>
          </defs>
          <rect
            width={BOARD_WIDTH}
            height={svgHeight}
            fill="url(#skyGrad)"
            rx={8}
          />

          {/* Camera shake wrapper */}
          <g transform={`translate(${displayShake.x}, ${displayShake.y})`}>
            {/* Background stars and speed lines */}
            <SpeedOverlay
              speed={displaySpeed}
              isRiding={isRiding}
              surferX={displayX}
            />

            {/* Target zone (behind terrain) */}
            <TargetZoneComponent
              target={level.target}
              reached={state.phase === 'success'}
            />

            {/* Terrain curve */}
            <Terrain
              curveFunc={curveFunc}
              xStart={level.startPoint.x}
              xEnd={level.endPoint.x}
              showSpeedOverlay={state.showSpeedOverlay}
            />

            {/* Gems */}
            <GemsComponent
              gems={levelGems}
              collected={displayGems}
            />

            {/* Control points (interactive during planning) */}
            <ControlPoints
              points={state.controlPoints}
              enabled={state.phase === 'planning'}
              onDrag={handleDragControlPoint}
              svgRef={svgRef}
            />

            {/* Surfer */}
            <Surfer
              curveFunc={curveFunc}
              x={displayX}
              speed={displaySpeed}
              derivative={displayDerivative}
              isRiding={isRiding}
              boardFlash={displayBoardFlash}
            />

            {/* Particles */}
            <ParticlesComponent particles={displayParticles} />

            {/* Score popups */}
            <ScorePopup items={scorePopups} />

            {/* HUD overlay */}
            <HUD
              speed={displaySpeed}
              derivative={displayDerivative}
              gemsCollected={displayGems.size}
              totalGems={levelGems.length}
              rideTime={displayRideTime}
              comboCount={displayCombo}
              stars={stars}
              phase={state.phase}
              score={displayScore}
            />

            {/* Derivative graph */}
            {state.showDerivGraph && (
              <DerivativeGraph
                curveFunc={curveFunc}
                xStart={level.startPoint.x}
                xEnd={level.endPoint.x}
                surferX={displayX}
                isRiding={isRiding}
                yOffset={BOARD_HEIGHT + 4}
                graphHeight={72}
              />
            )}
          </g>
        </svg>
      </div>

      {/* Controls bar */}
      <Controls
        phase={state.phase}
        showDerivToggle={level.showDerivToggle}
        showDerivGraph={state.showDerivGraph}
        showSpeedOverlay={state.showSpeedOverlay}
        onSurf={handleSurf}
        onRetry={handleRetry}
        onToggleDerivative={handleToggleDerivative}
        onToggleSpeed={handleToggleSpeed}
        onLevelSelect={handleLevelSelect}
        onResetTerrain={handleResetTerrain}
      />

      {/* Level complete overlay */}
      {(state.phase === 'success' || state.phase === 'failed') && (
        <LevelComplete
          success={state.phase === 'success'}
          stars={stars}
          score={state.score}
          gemsCollected={state.gemsCollected.size}
          totalGems={levelGems.length}
          rideTime={state.rideTime}
          parTime={level.parTime}
          hasNextLevel={currentLevelId < LEVELS.length}
          onRetry={handleRetry}
          onNextLevel={handleNextLevel}
          onLevelSelect={handleLevelSelect}
        />
      )}

      {/* Level select overlay */}
      {state.phase === 'levelSelect' && (
        <LevelSelect
          levels={LEVELS}
          currentLevel={currentLevelId}
          bestStars={bestStars}
          onSelectLevel={handleSelectLevel}
          onBack={handleBackFromSelect}
        />
      )}
    </div>
  )
}
