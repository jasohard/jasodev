/**
 * Slope Surfer — Main game component.
 *
 * A surfer rides along a mathematical curve where:
 * - Their board IS the tangent line
 * - Their speed IS |f'(x)|
 *
 * Players drag control points to reshape terrain, then launch
 * the surfer to collect gems and reach a target zone.
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
  comboMultiplier,
  comboColor,
  BOARD_WIDTH,
  BOARD_HEIGHT,
} from './engine'

import Terrain from './components/Terrain'
import ControlPoints from './components/ControlPoints'
import Surfer from './components/Surfer'
import Gems from './components/Gems'
import TargetZoneComponent from './components/TargetZone'
import SpeedOverlay from './components/SpeedOverlay'
import HUD from './components/HUD'
import DerivativeGraph from './components/DerivativeGraph'
import Particles from './components/Particles'
import Controls from './components/Controls'
import LevelSelect from './components/LevelSelect'
import LevelComplete from './components/LevelComplete'
import ScorePopup from './components/ScorePopup'
import type { ScorePopupItem } from './components/ScorePopup'
import type { Vec2 } from './types'

import styles from './SlopeSurfer.module.css'

let popupIdCounter = 0

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

  // ─── Build the interpolation curve from control points ────────────

  const curveFunc = useMemo(() => {
    const allPoints: Vec2[] = [
      level.startPoint,
      ...state.controlPoints.map(cp => ({ x: cp.x, y: cp.y })),
      level.endPoint,
    ]
    return buildMonotoneCubic(allPoints)
  }, [level.startPoint, level.endPoint, state.controlPoints])

  // ─── Derivative function ──────────────────────────────────────────

  const derivativeFunc = useCallback(
    (x: number) => numericalDerivative(curveFunc, x),
    [curveFunc]
  )

  // Current derivative and speed at surfer position
  const currentDerivative = derivativeFunc(state.surferX)
  const currentSpeed = surferSpeed(currentDerivative, level.speedMultiplier)

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

  // ─── Animation Loop ──────────────────────────────────────────────

  const animLoop = useCallback((timestamp: number) => {
    if (lastTimeRef.current === 0) {
      lastTimeRef.current = timestamp
    }
    const dt = Math.min((timestamp - lastTimeRef.current) / 1000, 0.05) // Cap at 50ms
    lastTimeRef.current = timestamp

    // Advance surfer
    const derivative = derivativeFunc(state.surferX)
    const speed = surferSpeed(derivative, level.speedMultiplier)
    const newX = state.surferX + speed * dt

    // Check if surfer has gone past the end
    if (newX >= level.endPoint.x) {
      // Check target landing
      const curveY = curveFunc(level.endPoint.x)
      if (checkTargetReached(newX, curveY, level.target)) {
        const precision = landingPrecision(newX, level.target)
        dispatch({ type: 'LAND_SUCCESS', precision })

        // Landing burst particles
        const burstPos = { x: (level.target.xStart + level.target.xEnd) / 2, y: level.target.yCenter }
        dispatch({ type: 'SPAWN_PARTICLES', particles: createLandingBurst(burstPos) })

        // Screen shake
        dispatch({ type: 'SET_SHAKE', offset: { x: (Math.random() - 0.5) * 4, y: (Math.random() - 0.5) * 4 } })
        setTimeout(() => dispatch({ type: 'SET_SHAKE', offset: { x: 0, y: 0 } }), 150)
      } else if (level.autoPass) {
        // Auto-pass tutorial levels
        dispatch({ type: 'LAND_SUCCESS', precision: 1 })
      } else {
        dispatch({ type: 'LAND_FAILED' })
      }
      return
    }

    // Update position via TICK
    dispatch({
      type: 'TICK',
      dt,
      curveY: curveFunc,
      derivative: derivativeFunc,
    })

    // Check gem collisions
    const surferY = curveFunc(newX)
    for (const gem of levelGems) {
      if (!state.gemsCollected.has(gem.id)) {
        if (checkGemCollision({ x: newX, y: surferY }, gem)) {
          const mult = comboMultiplier(state.comboCount + 1)
          dispatch({ type: 'COLLECT_GEM', gemId: gem.id, comboMultiplier: mult })

          // Gem burst particles
          dispatch({ type: 'SPAWN_PARTICLES', particles: createGemBurst({ x: gem.x, y: gem.y }) })

          // Score popup
          const points = Math.round(100 * mult)
          const color = comboColor(state.comboCount + 1)
          setScorePopups(prev => [
            ...prev.slice(-5),
            { id: popupIdCounter++, x: gem.x, y: gem.y - 10, text: `+${points}`, color },
          ])

          // Board flash
          setTimeout(() => dispatch({ type: 'CLEAR_BOARD_FLASH' }), 100)

          // Small screen shake
          dispatch({ type: 'SET_SHAKE', offset: { x: (Math.random() - 0.5) * 2, y: (Math.random() - 0.5) * 2 } })
          setTimeout(() => dispatch({ type: 'SET_SHAKE', offset: { x: 0, y: 0 } }), 80)
        }
      }
    }

    // Speed trail particles
    speedTrailTimer.current += dt
    if (speed > 60 && speedTrailTimer.current > 0.08) {
      speedTrailTimer.current = 0
      const angle = Math.atan(derivative)
      dispatch({ type: 'SPAWN_PARTICLES', particles: [createSpeedTrail({ x: newX, y: surferY }, angle)] })
    }

    // Update particles
    dispatch({ type: 'UPDATE_PARTICLES', dt })

    animRef.current = requestAnimationFrame(animLoop)
  }, [state.surferX, state.gemsCollected, state.comboCount, curveFunc, derivativeFunc, level, levelGems, dispatch])

  // Start/stop animation loop
  useEffect(() => {
    if (state.phase === 'riding') {
      lastTimeRef.current = 0
      speedTrailTimer.current = 0
      animRef.current = requestAnimationFrame(animLoop)
    } else {
      cancelAnimationFrame(animRef.current)
    }
    return () => cancelAnimationFrame(animRef.current)
  }, [state.phase, animLoop])

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
    dispatch({ type: 'ENTER_LEVEL_SELECT' })
  }, [])

  const handleSelectLevel = useCallback((id: number) => {
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
          <g transform={`translate(${state.shakeOffset.x}, ${state.shakeOffset.y})`}>
            {/* Background stars and speed lines */}
            <SpeedOverlay
              speed={currentSpeed}
              isRiding={state.phase === 'riding'}
              surferX={state.surferX}
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
            <Gems
              gems={levelGems}
              collected={state.gemsCollected}
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
              x={state.surferX}
              speed={currentSpeed}
              derivative={currentDerivative}
              isRiding={state.phase === 'riding'}
              boardFlash={state.boardFlash}
            />

            {/* Particles */}
            <Particles particles={state.particles} />

            {/* Score popups */}
            <ScorePopup items={scorePopups} />

            {/* HUD overlay */}
            <HUD
              speed={currentSpeed}
              derivative={currentDerivative}
              gemsCollected={state.gemsCollected.size}
              totalGems={levelGems.length}
              rideTime={state.rideTime}
              comboCount={state.comboCount}
              stars={stars}
              phase={state.phase}
              score={state.score}
            />

            {/* Derivative graph */}
            {state.showDerivGraph && (
              <DerivativeGraph
                curveFunc={curveFunc}
                xStart={level.startPoint.x}
                xEnd={level.endPoint.x}
                surferX={state.surferX}
                isRiding={state.phase === 'riding'}
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
