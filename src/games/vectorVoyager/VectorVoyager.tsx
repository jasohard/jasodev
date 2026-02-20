import { useState, useCallback, useRef, useEffect } from 'react'
import type { GameVector, Vec2, GamePhase, TrailParticle } from './types'
import { LEVELS } from './levels'
import {
  BOARD_WIDTH,
  BOARD_HEIGHT,
  vecSub,
  vecLen,
  vecAdd,
  vecNormalize,
  totalFuelUsed,
  checkCollisions,
  reachesTarget,
  computeStars,
} from './engine'
import GameBoard from './components/GameBoard'
import Controls from './components/Controls'
import LevelSelect from './components/LevelSelect'
import styles from './VectorVoyager.module.css'

let vectorIdCounter = 0
let trailIdCounter = 0

export default function VectorVoyager() {
  const [currentLevelId, setCurrentLevelId] = useState(1)
  const [bestStars, setBestStars] = useState<Record<number, number>>({})

  const level = LEVELS.find((l) => l.id === currentLevelId) ?? LEVELS[0]

  const [vectors, setVectors] = useState<GameVector[]>([])
  const [phase, setPhase] = useState<GamePhase>('planning')
  const [shipPos, setShipPos] = useState<Vec2>(level.shipStart)
  const [shipAngle, setShipAngle] = useState(0)
  const [trail, setTrail] = useState<TrailParticle[]>([])
  const [explosionParticles, setExplosionParticles] = useState<Vec2[]>([])
  const [victoryParticles, setVictoryParticles] = useState<Vec2[]>([])
  const [draggingIdx, setDraggingIdx] = useState(-1)

  // Drag state tracked via refs (for pointerMove handler perf)
  const isDragging = useRef(false)
  const dragMode = useRef<'new' | 'adjust'>('new')
  const dragVectorIdxRef = useRef(-1)
  const svgRef = useRef<SVGSVGElement | null>(null)

  const animFrameRef = useRef(0)

  // Derived state
  const fuelUsed = totalFuelUsed(vectors)
  const overBudget = level.fuelBudget > 0 && fuelUsed > level.fuelBudget
  const collision = vectors.length > 0 ? checkCollisions(vectors, level.asteroids) : { hit: false as const }
  const canLaunch = vectors.length > 0 && !collision.hit

  // Stars computed after success
  const stars: 0 | 1 | 2 | 3 =
    phase === 'success'
      ? computeStars(true, vectors.length, level.par, fuelUsed, level.fuelBudget)
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
    return () => {
      document.title = 'jasodev'
    }
  }, [level.name])

  // ─── Pointer → SVG coordinate conversion ─────────────────────

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

  // Clamp point inside board bounds with margin
  const clamp = useCallback((p: Vec2): Vec2 => {
    const m = 6
    return {
      x: Math.max(m, Math.min(BOARD_WIDTH - m, p.x)),
      y: Math.max(m, Math.min(BOARD_HEIGHT - m, p.y)),
    }
  }, [])

  // ─── Drag handlers ────────────────────────────────────────────

  const handleDragStart = useCallback(
    (e: React.PointerEvent) => {
      if (phase !== 'planning') return
      // Save SVG ref from the event's closest SVG
      const targetEl = e.target as Element
      const svg = targetEl.closest('svg') as SVGSVGElement | null
      if (svg) svgRef.current = svg
      targetEl.setPointerCapture?.(e.pointerId)

      const pt = pointerToSVG(e)

      // Check if tapping on an existing arrowhead handle
      const handleAttr = targetEl.getAttribute?.('data-vector-handle')
      if (handleAttr !== null && handleAttr !== undefined) {
        const idx = parseInt(handleAttr, 10)
        if (!isNaN(idx) && idx >= 0 && idx < vectors.length) {
          isDragging.current = true
          dragMode.current = 'adjust'
          dragVectorIdxRef.current = idx
          setDraggingIdx(idx)
          return
        }
      }

      // Otherwise, create a new vector from the chain endpoint
      const startPt =
        vectors.length > 0 ? vectors[vectors.length - 1].end : level.shipStart
      const dist = vecLen(vecSub(pt, startPt))
      if (dist > 60) return // too far from endpoint — ignore

      const newVec: GameVector = {
        id: vectorIdCounter++,
        start: startPt,
        end: clamp(pt),
      }
      setVectors((prev) => [...prev, newVec])
      isDragging.current = true
      dragMode.current = 'new'
      dragVectorIdxRef.current = -1
      setDraggingIdx(-1)
    },
    [phase, vectors, level.shipStart, pointerToSVG, clamp]
  )

  const handleDragMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging.current) return
      const pt = clamp(pointerToSVG(e))

      if (dragMode.current === 'new') {
        setVectors((prev) => {
          const next = [...prev]
          const last = next[next.length - 1]
          if (last) {
            next[next.length - 1] = { ...last, end: pt }
          }
          return next
        })
      } else if (dragMode.current === 'adjust') {
        const idx = dragVectorIdxRef.current
        setVectors((prev) => {
          const next = [...prev]
          if (next[idx]) {
            next[idx] = { ...next[idx], end: pt }
            // Cascade: update start points of subsequent vectors in chain
            for (let i = idx + 1; i < next.length; i++) {
              const delta = vecSub(prev[i].end, prev[i].start)
              next[i] = {
                ...next[i],
                start: next[i - 1].end,
                end: vecAdd(next[i - 1].end, delta),
              }
            }
          }
          return next
        })
      }
    },
    [pointerToSVG, clamp]
  )

  const handleDragEnd = useCallback(() => {
    if (!isDragging.current) return
    isDragging.current = false
    setDraggingIdx(-1)

    // Remove vectors that are too tiny (accidental taps)
    setVectors((prev) => {
      const last = prev[prev.length - 1]
      if (last && vecLen(vecSub(last.end, last.start)) < 8) {
        return prev.slice(0, -1)
      }
      return prev
    })
  }, [])

  // ─── Launch animation ─────────────────────────────────────────

  const handleLaunch = useCallback(() => {
    if (vectors.length === 0 || overBudget) return

    const col = checkCollisions(vectors, level.asteroids)

    setPhase('launching')
    setTrail([])
    setExplosionParticles([])
    setVictoryParticles([])

    const startTime = performance.now()
    const SPEED = 180 // pixels per second

    // Compute segment durations
    const segDurations = vectors.map((v) =>
      vecLen(vecSub(v.end, v.start)) / SPEED
    )

    // If there's a collision, truncate the colliding segment
    let totalDur = segDurations.reduce((a, b) => a + b, 0)
    if (col.hit) {
      const origDur = segDurations[col.vectorIdx]
      segDurations[col.vectorIdx] = origDur * col.t
      totalDur = segDurations
        .slice(0, col.vectorIdx + 1)
        .reduce((a, b) => a + b, 0)
    }

    // Ensure minimum duration
    totalDur = Math.max(totalDur, 0.2)

    let trailParticles: TrailParticle[] = []
    let lastTrailTime = 0

    const animate = (now: number) => {
      const elapsed = (now - startTime) / 1000

      // Find which segment and progress
      let remaining = elapsed
      let segIdx = 0
      let segT = 0
      const maxSeg = col.hit ? col.vectorIdx + 1 : vectors.length

      for (segIdx = 0; segIdx < maxSeg; segIdx++) {
        const dur = segDurations[segIdx]
        if (dur <= 0) continue
        if (remaining <= dur) {
          segT = remaining / dur
          break
        }
        remaining -= dur
        if (segIdx === maxSeg - 1) segT = 1
      }
      segIdx = Math.min(segIdx, maxSeg - 1)

      // Ease-in-out per segment
      const eased =
        segT < 0.5
          ? 2 * segT * segT
          : 1 - Math.pow(-2 * segT + 2, 2) / 2

      const v = vectors[segIdx]
      if (!v) return

      const d = vecSub(v.end, v.start)
      const pos: Vec2 = {
        x: v.start.x + d.x * eased,
        y: v.start.y + d.y * eased,
      }

      const angle = Math.atan2(-d.y, d.x)
      setShipPos(pos)
      setShipAngle(angle)

      // Engine trail particles
      if (now - lastTrailTime > 35) {
        lastTrailTime = now
        const norm = vecNormalize(d)
        trailParticles = [
          ...trailParticles
            .filter((p) => p.opacity > 0.05)
            .map((p) => ({ ...p, opacity: p.opacity * 0.82 })),
          {
            x: pos.x - norm.x * 10 + (Math.random() - 0.5) * 5,
            y: pos.y + norm.y * 10 + (Math.random() - 0.5) * 5,
            opacity: 1,
            id: trailIdCounter++,
          },
        ]
        setTrail([...trailParticles])
      }

      // Animation end
      if (elapsed >= totalDur) {
        if (col.hit) {
          const particles: Vec2[] = []
          for (let i = 0; i < 12; i++) {
            const a = (Math.PI * 2 * i) / 12
            const dist = 8 + Math.random() * 22
            particles.push({
              x: pos.x + Math.cos(a) * dist,
              y: pos.y + Math.sin(a) * dist,
            })
          }
          setExplosionParticles(particles)
          setPhase('collision')
        } else if (reachesTarget(vectors, level.target, level.targetRadius)) {
          const particles: Vec2[] = []
          for (let i = 0; i < 14; i++) {
            const a = (Math.PI * 2 * i) / 14
            const dist = 8 + Math.random() * 30
            particles.push({
              x: level.target.x + Math.cos(a) * dist,
              y: level.target.y + Math.sin(a) * dist,
            })
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
  }, [vectors, level, overBudget])

  // ─── Clear / Undo / Level change ──────────────────────────────

  const resetState = useCallback(
    (start: Vec2) => {
      cancelAnimationFrame(animFrameRef.current)
      setVectors([])
      setPhase('planning')
      setShipPos(start)
      setShipAngle(0)
      setTrail([])
      setExplosionParticles([])
      setVictoryParticles([])
      setDraggingIdx(-1)
    },
    []
  )

  const handleClear = useCallback(() => {
    resetState(level.shipStart)
  }, [level.shipStart, resetState])

  const handleUndo = useCallback(() => {
    if (phase !== 'planning' || vectors.length === 0) return
    setVectors((prev) => prev.slice(0, -1))
  }, [phase, vectors.length])

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
    return () => {
      cancelAnimationFrame(animFrameRef.current)
    }
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
          vectors={vectors}
          phase={phase}
          stars={stars}
          shipPos={shipPos}
          shipAngle={shipAngle}
          trail={trail}
          draggingIdx={draggingIdx}
          onDragStart={handleDragStart}
          onDragMove={handleDragMove}
          onDragEnd={handleDragEnd}
          explosionParticles={explosionParticles}
          victoryParticles={victoryParticles}
        />
      </div>

      <Controls
        phase={phase}
        vectorCount={vectors.length}
        canLaunch={canLaunch}
        overBudget={overBudget}
        hasNextLevel={hasNextLevel}
        onLaunch={handleLaunch}
        onClear={handleClear}
        onUndo={handleUndo}
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
