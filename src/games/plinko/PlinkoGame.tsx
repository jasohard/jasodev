import { useState, useCallback, useRef, useEffect, useMemo } from 'react'
import type { Ball, Peg, SpeedMultiplier, DropCount } from './types'
import { LEVELS } from './levels'
import {
  BOARD_WIDTH,
  BOARD_HEIGHT,
  WALL_LEFT,
  WALL_RIGHT,
  DROP_Y,
  BIN_TOP,
  PEG_ZONE_TOP,
  PEG_ZONE_BOTTOM,
  createBall,
  createPegsFromLevel,
  stepPhysics,
  computeMatchPercent,
  computeStars,
  isValidPegPosition,
  clampPegPosition,
  getBinX,
  getBinWidth,
} from './engine'
import styles from './PlinkoGame.module.css'

export default function PlinkoGame() {
  const [currentLevelId, setCurrentLevelId] = useState(1)
  const [bestStars, setBestStars] = useState<Record<number, number>>({})

  const level = LEVELS.find((l) => l.id === currentLevelId) ?? LEVELS[0]

  const [pegs, setPegs] = useState<Peg[]>(() =>
    createPegsFromLevel(level.fixedPegs, level.moveablePegs, level.bumperPegs)
  )
  const [bins, setBins] = useState<number[]>(() =>
    Array(level.binCount).fill(0) as number[]
  )
  const [totalBalls, setTotalBalls] = useState(0)
  const [balls, setBalls] = useState<Ball[]>([])
  const [speed, setSpeed] = useState<SpeedMultiplier>(1)
  const [dropCount, setDropCount] = useState<DropCount>(50)
  const [isSimulating, setIsSimulating] = useState(false)
  const [showLevelSelect, setShowLevelSelect] = useState(false)

  // Drag state
  const [draggingPegId, setDraggingPegId] = useState<string | null>(null)
  const [dragValid, setDragValid] = useState(true)

  // Refs for animation loop
  const animFrameRef = useRef(0)
  const ballsRef = useRef<Ball[]>([])
  const pegsRef = useRef<Peg[]>(pegs)
  const binsRef = useRef<number[]>(bins)
  const speedRef = useRef(speed)
  const isSimulatingRef = useRef(false)
  const isMountedRef = useRef(true)
  const svgRef = useRef<SVGSVGElement>(null)

  // Keep refs in sync
  useEffect(() => { speedRef.current = speed }, [speed])
  useEffect(() => { pegsRef.current = pegs }, [pegs])
  useEffect(() => { binsRef.current = bins }, [bins])

  // Scoring
  const matchPercent = level.freePlay
    ? 0
    : computeMatchPercent(bins, level.targetDistribution)

  const scoreReady = totalBalls >= level.minBallsForScore
  const stars = scoreReady && !level.freePlay
    ? computeStars(matchPercent, level.star1, level.star2, level.star3)
    : (0 as const)

  // Update best stars
  useEffect(() => {
    if (stars > 0) {
      setBestStars((prev) => ({
        ...prev,
        [currentLevelId]: Math.max(prev[currentLevelId] ?? 0, stars),
      }))
    }
  }, [stars, currentLevelId])

  // Page title
  useEffect(() => {
    document.title = `Plinko - ${level.name} | jasodev`
    return () => { document.title = 'jasodev' }
  }, [level.name])

  // ─── Animation loop ─────────────────────────────────────────
  const lastTimeRef = useRef(0)

  const animationLoop = useCallback((timestamp: number) => {
    if (!isMountedRef.current) return

    if (lastTimeRef.current === 0) lastTimeRef.current = timestamp
    let dt = (timestamp - lastTimeRef.current) / 1000
    lastTimeRef.current = timestamp

    // Cap dt to prevent huge jumps
    dt = Math.min(dt, 0.05)

    // Apply speed multiplier
    const s = speedRef.current
    dt *= s

    const landed = stepPhysics(
      ballsRef.current,
      pegsRef.current,
      binsRef.current.length,
      dt
    )

    if (!isMountedRef.current) return

    // Update bins for landed balls
    if (landed.length > 0) {
      setBins((prev) => {
        const next = [...prev]
        for (const idx of landed) {
          if (idx >= 0 && idx < next.length) next[idx]++
        }
        return next
      })
      setTotalBalls((prev) => prev + landed.length)
    }

    // Clean up dead balls, keep active + recently landed for display
    const activeBalls = ballsRef.current.filter((b) => b.active)
    const landedBalls = ballsRef.current.filter(
      (b) => !b.active && b.age < 1.5
    )
    ballsRef.current = [...activeBalls, ...landedBalls]

    // Trigger React re-render for ball positions
    setBalls([...ballsRef.current])

    if (activeBalls.length > 0) {
      animFrameRef.current = requestAnimationFrame(animationLoop)
    } else {
      isSimulatingRef.current = false
      setIsSimulating(false)
      // Final cleanup — remove landed balls from display after settling
      ballsRef.current = []
      setBalls([])
    }
  }, [])

  const ensureAnimating = useCallback(() => {
    if (!isSimulatingRef.current) {
      isSimulatingRef.current = true
      setIsSimulating(true)
      lastTimeRef.current = 0
      animFrameRef.current = requestAnimationFrame(animationLoop)
    }
  }, [animationLoop])

  // ─── Drop balls ─────────────────────────────────────────────
  const handleDrop = useCallback(() => {
    const dropX = level.dropX ?? BOARD_WIDTH / 2
    const newBalls: Ball[] = []
    for (let i = 0; i < dropCount; i++) {
      const ball = createBall(dropX)
      // Stagger drops slightly
      ball.y = DROP_Y - i * 0.3
      newBalls.push(ball)
    }
    ballsRef.current = [...ballsRef.current, ...newBalls]
    ensureAnimating()
  }, [dropCount, level.dropX, ensureAnimating])

  // ─── Reset bins ─────────────────────────────────────────────
  const handleResetBins = useCallback(() => {
    cancelAnimationFrame(animFrameRef.current)
    isSimulatingRef.current = false
    setIsSimulating(false)
    ballsRef.current = []
    setBalls([])
    setBins(Array(level.binCount).fill(0) as number[])
    setTotalBalls(0)
  }, [level.binCount])

  // ─── Reset pegs ─────────────────────────────────────────────
  const handleResetPegs = useCallback(() => {
    setPegs((prev) =>
      prev.map((p) =>
        p.type === 'moveable'
          ? { ...p, x: p.startX, y: p.startY }
          : p
      )
    )
  }, [])

  // ─── Level change ───────────────────────────────────────────
  const handleLevelChange = useCallback((levelId: number) => {
    cancelAnimationFrame(animFrameRef.current)
    isSimulatingRef.current = false
    setIsSimulating(false)
    ballsRef.current = []
    const newLevel = LEVELS.find((l) => l.id === levelId) ?? LEVELS[0]
    setCurrentLevelId(levelId)
    setPegs(createPegsFromLevel(newLevel.fixedPegs, newLevel.moveablePegs, newLevel.bumperPegs))
    setBins(Array(newLevel.binCount).fill(0) as number[])
    setTotalBalls(0)
    setBalls([])
    setDraggingPegId(null)
    setShowLevelSelect(false)
  }, [])

  // ─── SVG coordinate conversion ─────────────────────────────
  const toSvgCoords = useCallback(
    (clientX: number, clientY: number): { x: number; y: number } | null => {
      const svg = svgRef.current
      if (!svg) return null
      const ctm = svg.getScreenCTM()
      if (!ctm) return null
      return {
        x: (clientX - ctm.e) / ctm.a,
        y: (clientY - ctm.f) / ctm.d,
      }
    },
    []
  )

  // ─── Peg drag handlers ─────────────────────────────────────
  const handlePegPointerDown = useCallback(
    (e: React.PointerEvent, pegId: string) => {
      const peg = pegs.find((p) => p.id === pegId)
      if (!peg || peg.type !== 'moveable') return
      e.preventDefault()
      e.stopPropagation()
      ;(e.target as Element).setPointerCapture(e.pointerId)
      setDraggingPegId(pegId)
      setDragValid(true)
    },
    [pegs]
  )

  const handlePegPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!draggingPegId) return
      const pt = toSvgCoords(e.clientX, e.clientY)
      if (!pt) return

      const clamped = clampPegPosition(pt.x, pt.y)
      const valid = isValidPegPosition(clamped.x, clamped.y, draggingPegId, pegs)
      setDragValid(valid)

      setPegs((prev) =>
        prev.map((p) =>
          p.id === draggingPegId ? { ...p, x: clamped.x, y: clamped.y } : p
        )
      )
    },
    [draggingPegId, pegs, toSvgCoords]
  )

  const handlePegPointerUp = useCallback(() => {
    if (!draggingPegId) return

    // If the position isn't valid, snap back to start
    if (!dragValid) {
      setPegs((prev) =>
        prev.map((p) =>
          p.id === draggingPegId ? { ...p, x: p.startX, y: p.startY } : p
        )
      )
    }

    setDraggingPegId(null)
    setDragValid(true)
  }, [draggingPegId, dragValid])

  // ─── Keyboard shortcuts ─────────────────────────────────────
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      )
        return
      if (e.code === 'Space') {
        e.preventDefault()
        handleDrop()
      } else if (e.code === 'KeyR' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault()
        handleResetBins()
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [handleDrop, handleResetBins])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false
      cancelAnimationFrame(animFrameRef.current)
    }
  }, [])

  // ─── Computed values ────────────────────────────────────────
  const binWidth = getBinWidth(level.binCount)
  const maxBinCount = Math.max(1, ...bins)

  const targetMaxHeight = 80
  const histMaxHeight = 80

  // Memoize target distribution bars
  const targetBars = useMemo(() => {
    if (level.freePlay) return null
    return level.targetDistribution.map((val, i) => {
      const x = getBinX(i, level.binCount)
      const h = val * targetMaxHeight * level.binCount
      return { x, h, i }
    })
  }, [level.targetDistribution, level.binCount, level.freePlay])

  // ─── Toggle helpers ─────────────────────────────────────────
  const nextSpeed = (): SpeedMultiplier => {
    if (speed === 1) return 3
    if (speed === 3) return 10
    return 1
  }

  const nextDropCount = (): DropCount => {
    if (dropCount === 10) return 50
    if (dropCount === 50) return 100
    return 10
  }

  // ─── Star display ──────────────────────────────────────────
  const starDisplay = (count: 0 | 1 | 2 | 3) => (
    <span className={styles.stars}>
      {[1, 2, 3].map((n) => (
        <span key={n} className={n <= count ? styles.starFilled : styles.starEmpty}>
          {n <= count ? '\u2605' : '\u2606'}
        </span>
      ))}
    </span>
  )

  // Match bar color
  const matchColor =
    matchPercent >= 85 ? '#2ecc71' :
    matchPercent >= 65 ? '#f1c40f' :
    matchPercent >= 40 ? '#e67e22' : '#e74c3c'

  return (
    <div className={styles.page}>
      {/* ─── Header ─────────────────────────────────────── */}
      <header className={styles.header}>
        <h1 className={styles.title}>Plinko</h1>
        <p className={styles.levelLabel}>
          Level {level.id}: {level.name}
        </p>
        <p className={styles.subtitle}>{level.subtitle}</p>
      </header>

      {/* ─── Hint ───────────────────────────────────────── */}
      <div className={styles.hint}>{level.hint}</div>

      {/* ─── Board SVG ──────────────────────────────────── */}
      <div className={styles.boardWrapper}>
        <svg
          ref={svgRef}
          viewBox={`0 0 ${BOARD_WIDTH} ${BOARD_HEIGHT}`}
          className={styles.board}
          onPointerMove={handlePegPointerMove}
          onPointerUp={handlePegPointerUp}
          onPointerCancel={handlePegPointerUp}
          style={{ touchAction: 'none' }}
        >
          <defs>
            <radialGradient id="ballGlow" cx="40%" cy="35%">
              <stop offset="0%" stopColor="#fff" />
              <stop offset="50%" stopColor="#ffeaa7" />
              <stop offset="100%" stopColor="#fdcb6e" />
            </radialGradient>
            <filter id="pegShadow">
              <feDropShadow dx="0" dy="1" stdDeviation="2" floodOpacity="0.3" />
            </filter>
            <filter id="ballGlowFilter">
              <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Background */}
          <rect width={BOARD_WIDTH} height={BOARD_HEIGHT} fill="#0d1117" rx="8" />

          {/* Peg placement zone boundary */}
          <rect
            x={WALL_LEFT}
            y={PEG_ZONE_TOP}
            width={WALL_RIGHT - WALL_LEFT}
            height={PEG_ZONE_BOTTOM - PEG_ZONE_TOP}
            fill="none"
            stroke="rgba(255,255,255,0.04)"
            strokeWidth="1"
            strokeDasharray="4 4"
            rx="4"
          />

          {/* Walls */}
          <line
            x1={WALL_LEFT} y1={DROP_Y}
            x2={WALL_LEFT} y2={BIN_TOP}
            stroke="rgba(255,255,255,0.12)"
            strokeWidth="2"
          />
          <line
            x1={WALL_RIGHT} y1={DROP_Y}
            x2={WALL_RIGHT} y2={BIN_TOP}
            stroke="rgba(255,255,255,0.12)"
            strokeWidth="2"
          />

          {/* Drop point indicator */}
          <circle
            cx={level.dropX ?? BOARD_WIDTH / 2}
            cy={DROP_Y}
            r="6"
            fill="none"
            stroke="rgba(255,255,255,0.3)"
            strokeWidth="1.5"
            strokeDasharray="3 3"
          >
            <animate
              attributeName="r"
              values="5;8;5"
              dur="2s"
              repeatCount="indefinite"
            />
          </circle>
          <circle
            cx={level.dropX ?? BOARD_WIDTH / 2}
            cy={DROP_Y}
            r="2"
            fill="rgba(255,255,255,0.5)"
          />

          {/* ─── Bin dividers ──────────────────────────── */}
          {Array.from({ length: level.binCount + 1 }, (_, i) => {
            const x = WALL_LEFT + i * binWidth
            return (
              <line
                key={`div-${i}`}
                x1={x} y1={BIN_TOP}
                x2={x} y2={BIN_TOP + 80}
                stroke="rgba(255,255,255,0.15)"
                strokeWidth="1"
              />
            )
          })}
          {/* Bin bottom */}
          <line
            x1={WALL_LEFT} y1={BIN_TOP + 80}
            x2={WALL_RIGHT} y2={BIN_TOP + 80}
            stroke="rgba(255,255,255,0.15)"
            strokeWidth="1"
          />
          {/* Bin labels */}
          {Array.from({ length: level.binCount }, (_, i) => (
            <text
              key={`lbl-${i}`}
              x={getBinX(i, level.binCount)}
              y={BIN_TOP + 76}
              textAnchor="middle"
              fill="rgba(255,255,255,0.25)"
              fontSize="9"
              fontFamily="monospace"
            >
              {i + 1}
            </text>
          ))}

          {/* ─── Target distribution overlay ───────────── */}
          {targetBars && targetBars.map(({ x, h, i }) => (
            <rect
              key={`target-${i}`}
              x={x - binWidth / 2 + 2}
              y={BIN_TOP + 78 - h}
              width={binWidth - 4}
              height={h}
              fill="none"
              stroke="#00d2d3"
              strokeWidth="1.5"
              strokeDasharray="4 2"
              opacity="0.5"
              rx="2"
            />
          ))}

          {/* ─── Histogram bars ────────────────────────── */}
          {bins.map((count, i) => {
            if (count === 0) return null
            const x = getBinX(i, level.binCount)
            const h = Math.min(78, (count / maxBinCount) * histMaxHeight)
            const targetVal = level.targetDistribution[i] ?? 0
            const actualVal = totalBalls > 0 ? count / totalBalls : 0
            const isOver = actualVal > targetVal * 1.4 && !level.freePlay
            return (
              <g key={`hist-${i}`}>
                <rect
                  x={x - binWidth / 2 + 3}
                  y={BIN_TOP + 78 - h}
                  width={binWidth - 6}
                  height={h}
                  fill={isOver ? '#e74c3c' : '#6c5ce7'}
                  opacity={0.8}
                  rx="2"
                />
                {count > 0 && (
                  <text
                    x={x}
                    y={BIN_TOP + 76 - h - 3}
                    textAnchor="middle"
                    fill="rgba(255,255,255,0.6)"
                    fontSize="8"
                    fontFamily="monospace"
                  >
                    {count}
                  </text>
                )}
              </g>
            )
          })}

          {/* ─── Pegs ──────────────────────────────────── */}
          {pegs.map((peg) => {
            const isDragging = peg.id === draggingPegId
            const isMoveable = peg.type === 'moveable'
            const isBumper = peg.type === 'bumper'

            let fill = '#555' // fixed
            let stroke = '#666'
            if (isMoveable) {
              fill = isDragging ? '#00e5ff' : '#00bcd4'
              stroke = isDragging && !dragValid ? '#e74c3c' : '#00e5ff'
            }
            if (isBumper) {
              fill = '#ff6b6b'
              stroke = '#ff8787'
            }

            return (
              <g key={peg.id}>
                {/* Grab handle ring for moveable pegs */}
                {isMoveable && !isDragging && (
                  <circle
                    cx={peg.x}
                    cy={peg.y}
                    r={peg.radius + 4}
                    fill="none"
                    stroke="rgba(0, 188, 212, 0.3)"
                    strokeWidth="1.5"
                    strokeDasharray="3 3"
                  />
                )}
                {isDragging && (
                  <circle
                    cx={peg.x}
                    cy={peg.y}
                    r={peg.radius + 5}
                    fill="none"
                    stroke={dragValid ? '#00e5ff' : '#e74c3c'}
                    strokeWidth="2"
                    opacity="0.7"
                  />
                )}

                {/* The peg itself */}
                <circle
                  cx={peg.x}
                  cy={peg.y}
                  r={peg.radius}
                  fill={fill}
                  stroke={stroke}
                  strokeWidth={isBumper ? 2 : 1.5}
                  filter="url(#pegShadow)"
                  style={isDragging ? { cursor: 'grabbing' } : isMoveable ? { cursor: 'grab' } : undefined}
                />

                {/* Invisible larger tap target for moveable pegs */}
                {isMoveable && (
                  <circle
                    cx={peg.x}
                    cy={peg.y}
                    r={Math.max(22, peg.radius + 8)}
                    fill="transparent"
                    style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
                    onPointerDown={(e) => handlePegPointerDown(e, peg.id)}
                  />
                )}
              </g>
            )
          })}

          {/* ─── Balls ─────────────────────────────────── */}
          {balls.map((ball) => (
            <circle
              key={ball.id}
              cx={ball.x}
              cy={ball.y}
              r={ball.radius}
              fill="url(#ballGlow)"
              filter="url(#ballGlowFilter)"
              opacity={ball.active ? 1 : 0.4}
            />
          ))}
        </svg>
      </div>

      {/* ─── Match bar ──────────────────────────────────── */}
      {!level.freePlay && (
        <div className={styles.matchBar}>
          <div className={styles.matchInfo}>
            <span className={styles.matchLabel}>
              Match: <strong>{matchPercent.toFixed(1)}%</strong>
              {!scoreReady && totalBalls > 0 && (
                <span className={styles.matchNote}>
                  {' '}(need {level.minBallsForScore} balls)
                </span>
              )}
            </span>
            {scoreReady && starDisplay(stars)}
          </div>
          <div className={styles.matchTrack}>
            <div
              className={styles.matchFill}
              style={{
                width: `${Math.min(100, matchPercent)}%`,
                backgroundColor: matchColor,
              }}
            />
            {/* Threshold markers */}
            <div className={styles.matchThreshold} style={{ left: `${level.star1}%` }} />
            <div className={styles.matchThreshold} style={{ left: `${level.star2}%` }} />
            <div className={styles.matchThreshold} style={{ left: `${level.star3}%` }} />
          </div>
        </div>
      )}

      {/* ─── Controls ───────────────────────────────────── */}
      <div className={styles.controls}>
        <div className={styles.controlRow}>
          <button
            className={styles.toggleBtn}
            onClick={() => setDropCount(nextDropCount())}
            aria-label={`Ball count: ${dropCount}`}
          >
            <span className={styles.toggleLabel}>Balls</span>
            <span className={styles.toggleValue}>{dropCount}</span>
          </button>

          <button
            className={`${styles.dropBtn} ${isSimulating ? styles.dropping : ''}`}
            onClick={handleDrop}
            aria-label={`Drop ${dropCount} balls`}
          >
            <svg viewBox="0 0 24 24" width={18} height={18} aria-hidden="true">
              <circle cx={12} cy={6} r={4} fill="currentColor" />
              <path d="M12 12 L8 20 L12 18 L16 20 Z" fill="currentColor" opacity={0.7} />
            </svg>
            <span>DROP</span>
          </button>

          <button
            className={styles.toggleBtn}
            onClick={() => setSpeed(nextSpeed())}
            aria-label={`Speed: ${speed}x`}
          >
            <span className={styles.toggleLabel}>Speed</span>
            <span className={styles.toggleValue}>{speed}x</span>
          </button>
        </div>

        <div className={styles.controlRow}>
          <button className={styles.secondaryBtn} onClick={handleResetBins} aria-label="Reset bins">
            <svg viewBox="0 0 24 24" width={14} height={14} aria-hidden="true">
              <path
                d="M17.65 6.35A7.96 7.96 0 0 0 12 4a8 8 0 1 0 8 8h-2a6 6 0 1 1-1.76-4.24l-2.24 2.24h6v-6l-2.35 2.35z"
                fill="currentColor"
              />
            </svg>
            Reset Bins
          </button>

          <button className={styles.secondaryBtn} onClick={handleResetPegs} aria-label="Reset pegs">
            <svg viewBox="0 0 24 24" width={14} height={14} aria-hidden="true">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z" fill="currentColor" />
              <circle cx="12" cy="12" r="3" fill="currentColor" />
            </svg>
            Reset Pegs
          </button>

          <span className={styles.ballCount}>
            Balls: {totalBalls}
          </span>
        </div>
      </div>

      {/* ─── Level select toggle ────────────────────────── */}
      <button
        className={styles.levelToggle}
        onClick={() => setShowLevelSelect((v) => !v)}
        aria-expanded={showLevelSelect}
      >
        {showLevelSelect ? 'Hide Levels' : 'Select Level'}
      </button>

      {/* ─── Level select grid ──────────────────────────── */}
      {showLevelSelect && (
        <div className={styles.levelGrid}>
          {LEVELS.map((lv) => {
            const earned = bestStars[lv.id] ?? 0
            const isCurrent = lv.id === currentLevelId
            return (
              <button
                key={lv.id}
                className={`${styles.levelBtn} ${isCurrent ? styles.levelBtnActive : ''}`}
                onClick={() => handleLevelChange(lv.id)}
                aria-label={`Level ${lv.id}: ${lv.name}`}
                aria-current={isCurrent ? 'true' : undefined}
              >
                <span className={styles.levelNum}>{lv.id}</span>
                <span className={styles.levelName}>{lv.name}</span>
                <span className={styles.levelStars}>
                  {[1, 2, 3].map((n) => (
                    <span
                      key={n}
                      className={n <= earned ? styles.starFilled : styles.starEmpty}
                    >
                      {n <= earned ? '\u2605' : '\u2606'}
                    </span>
                  ))}
                </span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
