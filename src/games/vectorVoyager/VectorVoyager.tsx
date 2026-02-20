import { useState, useCallback, useRef, useEffect } from 'react'
import type { LaunchVector, Vec2, GamePhase, TrailParticle, GravityWell } from './types'
import { LEVELS } from './levels'
import {
  BOARD_WIDTH,
  BOARD_HEIGHT,
  vecSub,
  vecLen,
  vecNormalize,
  simulateTrajectory,
  computeStars,
  maxWells,
  isTooClose,
} from './engine'
import GameBoard from './components/GameBoard'
import Controls from './components/Controls'
import LevelSelect from './components/LevelSelect'
import styles from './VectorVoyager.module.css'

let wellIdCounter = 0
let trailIdCounter = 0

export default function VectorVoyager() {
  const [currentLevelId, setCurrentLevelId] = useState(1)
  const [bestStars, setBestStars] = useState<Record<number, number>>({})

  const level = LEVELS.find((l) => l.id === currentLevelId) ?? LEVELS[0]

  // ─── Game state ──────────────────────────────────────────────
  const [launch, setLaunch] = useState<LaunchVector | null>(null)
  const [wells, setWells] = useState<GravityWell[]>([])
  const [selectedWellId, setSelectedWellId] = useState<number | null>(null)
  const [phase, setPhase] = useState<GamePhase>('planning')
  const [shipPos, setShipPos] = useState<Vec2>(level.shipStart)
  const [shipAngle, setShipAngle] = useState(0)
  const [trail, setTrail] = useState<TrailParticle[]>([])
  const [explosionParticles, setExplosionParticles] = useState<Vec2[]>([])
  const [victoryParticles, setVictoryParticles] = useState<Vec2[]>([])
  const [isDraggingLaunch, setIsDraggingLaunch] = useState(false)

  // Drag refs for performance
  const dragging = useRef(false)
  const dragType = useRef<'launch' | 'well-drag' | null>(null)
  const dragWellIdRef = useRef<number | null>(null)
  const svgRef = useRef<SVGSVGElement | null>(null)
  const animFrameRef = useRef(0)

  // Derived
  const mw = maxWells(level.wellPar)
  const hasLaunch = launch !== null && vecLen(vecSub(launch.end, launch.start)) > 8

  // Stars computed after success
  const stars: 0 | 1 | 2 | 3 =
    phase === 'success'
      ? computeStars(true, wells.length, level.wellPar)
      : 0

  // Update best stars
  useEffect(() => {
    if (phase === 'success' && stars > 0) {
      setBestStars((prev) => ({
        ...prev,
        [currentLevelId]: Math.max(prev[currentLevelId] ?? 0, stars),
      }))
    }
  }, [phase, stars, currentLevelId])

  // Set page title
  useEffect(() => {
    document.title = `Vector Voyager - ${level.name} | jasodev`
    return () => { document.title = 'jasodev' }
  }, [level.name])

  // ─── Pointer → SVG coordinate conversion ────────────────────

  const pointerToSVG = useCallback((e: React.PointerEvent): Vec2 => {
    const svg = svgRef.current ?? (e.currentTarget as SVGSVGElement)
    if (!svg || !svg.getScreenCTM) return { x: 0, y: 0 }
    const ctm = svg.getScreenCTM()
    if (!ctm) return { x: 0, y: 0 }
    const inv = ctm.inverse()
    return {
      x: e.clientX * inv.a + e.clientY * inv.c + inv.e,
      y: e.clientX * inv.b + e.clientY * inv.d + inv.f,
    }
  }, [])

  const clamp = useCallback((p: Vec2): Vec2 => {
    const m = 6
    return {
      x: Math.max(m, Math.min(BOARD_WIDTH - m, p.x)),
      y: Math.max(m, Math.min(BOARD_HEIGHT - m, p.y)),
    }
  }, [])

  // ─── Pointer handlers ──────────────────────────────────────────

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (phase !== 'planning') return

      const targetEl = e.target as Element | null
      if (!targetEl) return
      const svg = targetEl.closest?.('svg') as SVGSVGElement | null
      if (svg) svgRef.current = svg
      ;(targetEl as Element).setPointerCapture?.(e.pointerId)

      const pt = pointerToSVG(e)

      // Check if tapping on the launch vector arrowhead
      const handleAttr = targetEl.getAttribute?.('data-launch-handle')
      if (handleAttr === 'true' && launch) {
        dragging.current = true
        dragType.current = 'launch'
        setIsDraggingLaunch(true)
        return
      }

      // Check if dragging from the ship to create/adjust launch vector
      const distToShip = vecLen(vecSub(pt, level.shipStart))
      if (distToShip < 40 || (!launch && distToShip < 60)) {
        dragging.current = true
        dragType.current = 'launch'
        setLaunch({ start: level.shipStart, end: clamp(pt) })
        setIsDraggingLaunch(true)
        setSelectedWellId(null)
        return
      }

      // Otherwise: place a gravity well (if not at max)
      if (wells.length < mw) {
        const tooClose = isTooClose(
          pt, level.asteroids, level.shipStart,
          level.target, level.targetRadius, wells
        )
        if (!tooClose) {
          const newWell: GravityWell = {
            id: wellIdCounter++,
            x: pt.x,
            y: pt.y,
            strength: 2,
          }
          setWells((prev) => [...prev, newWell])
          setSelectedWellId(newWell.id)
          dragging.current = true
          dragType.current = 'well-drag'
          dragWellIdRef.current = newWell.id
          return
        }
      }

      // Deselect well if tapping empty space
      setSelectedWellId(null)
    },
    [phase, launch, wells, level, mw, pointerToSVG, clamp]
  )

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging.current) return
      const pt = clamp(pointerToSVG(e))

      if (dragType.current === 'launch') {
        setLaunch({ start: level.shipStart, end: pt })
      } else if (dragType.current === 'well-drag' && dragWellIdRef.current !== null) {
        const wellId = dragWellIdRef.current
        setWells((prev) =>
          prev.map((w) => w.id === wellId ? { ...w, x: pt.x, y: pt.y } : w)
        )
      }
    },
    [pointerToSVG, clamp, level.shipStart]
  )

  const handlePointerUp = useCallback(() => {
    if (!dragging.current) return
    dragging.current = false
    dragType.current = null
    dragWellIdRef.current = null
    setIsDraggingLaunch(false)

    // Remove too-short launch vector
    setLaunch((prev) => {
      if (prev && vecLen(vecSub(prev.end, prev.start)) < 8) return null
      return prev
    })
  }, [])

  // ─── Well interaction ────────────────────────────────────────

  const handleSelectWell = useCallback((id: number) => {
    if (phase !== 'planning') return
    setSelectedWellId((prev) => (prev === id ? null : id))
  }, [phase])

  const handleRemoveWell = useCallback(() => {
    if (selectedWellId === null) return
    setWells((prev) => prev.filter((w) => w.id !== selectedWellId))
    setSelectedWellId(null)
  }, [selectedWellId])

  const handleAdjustWellStrength = useCallback((delta: number) => {
    if (selectedWellId === null) return
    setWells((prev) =>
      prev.map((w) =>
        w.id === selectedWellId
          ? { ...w, strength: Math.max(1, Math.min(5, w.strength + delta)) }
          : w
      )
    )
  }, [selectedWellId])

  // ─── Launch animation ──────────────────────────────────────

  const handleLaunch = useCallback(() => {
    if (!launch || !hasLaunch) return

    const sim = simulateTrajectory(
      launch, wells, level.asteroids, level.target, level.targetRadius
    )

    setPhase('launching')
    setTrail([])
    setExplosionParticles([])
    setVictoryParticles([])
    setSelectedWellId(null)

    const path = sim.path
    const totalSteps = sim.endIdx
    if (totalSteps <= 0) {
      setPhase('missed')
      return
    }

    const ANIM_SPEED = 4 // steps per frame at 60fps
    let currentStep = 0
    let trailParticles: TrailParticle[] = []
    let frameCount = 0

    const animate = () => {
      currentStep = Math.min(currentStep + ANIM_SPEED, totalSteps)
      const pos = path[currentStep]
      if (!pos) {
        setPhase('missed')
        return
      }

      // Compute angle from velocity direction
      const nextIdx = Math.min(currentStep + 2, totalSteps)
      const next = path[nextIdx] ?? pos
      const dx = next.x - pos.x
      const dy = next.y - pos.y
      const angle = Math.atan2(-dy, dx)

      setShipPos(pos)
      setShipAngle(angle)

      // Engine trail
      frameCount++
      if (frameCount % 2 === 0) {
        const norm = vecNormalize({ x: dx, y: dy })
        trailParticles = [
          ...trailParticles
            .filter((p) => p.opacity > 0.05)
            .map((p) => ({ ...p, opacity: p.opacity * 0.82 }))
            .slice(-40),
          {
            x: pos.x - norm.x * 8 + (Math.random() - 0.5) * 5,
            y: pos.y + norm.y * 8 + (Math.random() - 0.5) * 5,
            opacity: 1,
            id: trailIdCounter++,
          },
        ]
        setTrail([...trailParticles])
      }

      // Done?
      if (currentStep >= totalSteps) {
        if (sim.hitAsteroid) {
          const particles: Vec2[] = []
          for (let i = 0; i < 12; i++) {
            const a = (Math.PI * 2 * i) / 12
            const dist = 8 + Math.random() * 22
            particles.push({ x: pos.x + Math.cos(a) * dist, y: pos.y + Math.sin(a) * dist })
          }
          setExplosionParticles(particles)
          setPhase('collision')
        } else if (sim.reachedTarget) {
          const particles: Vec2[] = []
          for (let i = 0; i < 14; i++) {
            const a = (Math.PI * 2 * i) / 14
            const dist = 8 + Math.random() * 30
            particles.push({ x: level.target.x + Math.cos(a) * dist, y: level.target.y + Math.sin(a) * dist })
          }
          setVictoryParticles(particles)
          setPhase('success')
        } else {
          setPhase('missed')
        }
        return
      }

      animFrameRef.current = requestAnimationFrame(animate)
    }

    animFrameRef.current = requestAnimationFrame(animate)
  }, [launch, hasLaunch, wells, level])

  // ─── Reset / level change ──────────────────────────────────

  const resetState = useCallback((start: Vec2) => {
    cancelAnimationFrame(animFrameRef.current)
    setLaunch(null)
    setWells([])
    setSelectedWellId(null)
    setPhase('planning')
    setShipPos(start)
    setShipAngle(0)
    setTrail([])
    setExplosionParticles([])
    setVictoryParticles([])
    setIsDraggingLaunch(false)
  }, [])

  const handleClear = useCallback(() => {
    resetState(level.shipStart)
  }, [level.shipStart, resetState])

  const handleLevelChange = useCallback(
    (levelId: number) => {
      const newLevel = LEVELS.find((l) => l.id === levelId) ?? LEVELS[0]
      setCurrentLevelId(levelId)
      resetState(newLevel.shipStart)
    },
    [resetState]
  )

  const hasNextLevel = currentLevelId < LEVELS.length
  const handleNextLevel = useCallback(() => {
    if (!hasNextLevel) return
    handleLevelChange(currentLevelId + 1)
  }, [hasNextLevel, currentLevelId, handleLevelChange])

  // Cleanup on unmount
  useEffect(() => {
    return () => { cancelAnimationFrame(animFrameRef.current) }
  }, [])

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Vector Voyager</h1>
        <p className={styles.levelLabel}>
          Level {level.id}: {level.name}
        </p>
        <p className={styles.subtitle}>{level.subtitle}</p>
      </header>

      {phase === 'planning' && <p className={styles.hint}>{level.hint}</p>}

      <div className={styles.boardWrapper}>
        <GameBoard
          level={level}
          launch={launch}
          wells={wells}
          phase={phase}
          stars={stars}
          shipPos={shipPos}
          shipAngle={shipAngle}
          trail={trail}
          isDraggingLaunch={isDraggingLaunch}
          selectedWellId={selectedWellId}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onSelectWell={handleSelectWell}
          explosionParticles={explosionParticles}
          victoryParticles={victoryParticles}
        />
      </div>

      <Controls
        phase={phase}
        canLaunch={hasLaunch}
        hasSelectedWell={selectedWellId !== null}
        hasNextLevel={hasNextLevel}
        onLaunch={handleLaunch}
        onClear={handleClear}
        onRemoveWell={handleRemoveWell}
        onAdjustWellStrength={handleAdjustWellStrength}
        onNextLevel={handleNextLevel}
      />

      <LevelSelect
        levels={LEVELS}
        currentLevel={currentLevelId}
        bestStars={bestStars}
        onSelectLevel={handleLevelChange}
      />
    </div>
  )
}
