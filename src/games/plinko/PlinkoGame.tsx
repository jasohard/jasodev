import { useState, useCallback, useRef, useEffect } from 'react'
import type { Peg, ActiveBall } from './types'
import { LEVELS } from './levels'
import {
  createPegs,
  computeBallPath,
  computeMatchPercent,
  computeStars,
  computeStats,
  getBinCount,
} from './engine'
import PlinkoBoard from './components/PlinkoBoard'
import Controls from './components/Controls'
import LevelSelect from './components/LevelSelect'
import StatsPanel from './components/StatsPanel'
import styles from './PlinkoGame.module.css'

let ballIdCounter = 0

export default function PlinkoGame() {
  const [currentLevelId, setCurrentLevelId] = useState(1)
  const [bestStars, setBestStars] = useState<Record<number, number>>({})

  const level = LEVELS.find((l) => l.id === currentLevelId) ?? LEVELS[0]
  const binCount = getBinCount(level.rows)

  const [pegs, setPegs] = useState<Peg[][]>(() => createPegs(level))
  const [bins, setBins] = useState<number[]>(() => Array(binCount).fill(0))
  const [totalBalls, setTotalBalls] = useState(0)
  const [selectedPeg, setSelectedPeg] = useState<{
    row: number
    col: number
  } | null>(null)
  const [activeBalls, setActiveBalls] = useState<ActiveBall[]>([])
  const [speed, setSpeed] = useState<1 | 3 | 10>(1)
  const [dropCount, setDropCount] = useState<1 | 10 | 50>(1)
  const [isDropping, setIsDropping] = useState(false)

  const matchPercent = computeMatchPercent(bins, level.targetDistribution)
  const stars = level.isTutorial && totalBalls >= 20
    ? 3 as const
    : computeStars(matchPercent, level)
  const stats = computeStats(bins)

  const animFrameRef = useRef<number>(0)
  const ballsRef = useRef<ActiveBall[]>([])

  // Update best stars when stars change
  useEffect(() => {
    if (stars > 0) {
      setBestStars((prev) => ({
        ...prev,
        [currentLevelId]: Math.max(prev[currentLevelId] ?? 0, stars),
      }))
    }
  }, [stars, currentLevelId])

  // Set page title
  useEffect(() => {
    document.title = `Probability Plinko - Level ${level.id} | jasodev`
    return () => {
      document.title = 'jasodev'
    }
  }, [level.id])

  // Animation loop
  const animate = useCallback(() => {
    const speedFactor = speed === 1 ? 0.012 : speed === 3 ? 0.035 : 0.08
    let hasActive = false
    const completed: ActiveBall[] = []

    const updated = ballsRef.current.map((ball) => {
      if (ball.progress >= 1) return ball

      const newProgress = Math.min(1, ball.progress + speedFactor)
      hasActive = newProgress < 1

      if (newProgress >= 1) {
        completed.push(ball)
      }

      return { ...ball, progress: newProgress }
    })

    ballsRef.current = updated
    setActiveBalls([...updated])

    // Update bins for completed balls
    if (completed.length > 0) {
      setBins((prev) => {
        const next = [...prev]
        for (const ball of completed) {
          const idx = ball.path.binIndex
          if (idx >= 0 && idx < next.length) {
            next[idx]++
          }
        }
        return next
      })
      setTotalBalls((prev) => prev + completed.length)

      // Clean up completed balls after a short delay
      setTimeout(() => {
        ballsRef.current = ballsRef.current.filter((b) => b.progress < 1)
        setActiveBalls((prev) => prev.filter((b) => b.progress < 1))
      }, 200)
    }

    if (hasActive || ballsRef.current.some((b) => b.progress < 1)) {
      animFrameRef.current = requestAnimationFrame(animate)
    } else {
      setIsDropping(false)
    }
  }, [speed])

  // Drop balls
  const handleDrop = useCallback(() => {
    const newBalls: ActiveBall[] = []
    for (let i = 0; i < dropCount; i++) {
      const path = computeBallPath(pegs, level.rows)
      newBalls.push({
        id: ballIdCounter++,
        path,
        progress: 0,
        hue: (ballIdCounter * 47 + i * 137) % 360,
      })
    }

    ballsRef.current = [...ballsRef.current, ...newBalls]
    setActiveBalls([...ballsRef.current])
    setIsDropping(true)

    // Start animation if not already running
    cancelAnimationFrame(animFrameRef.current)
    animFrameRef.current = requestAnimationFrame(animate)
  }, [dropCount, pegs, level.rows, animate])

  // Reset bins
  const handleReset = useCallback(() => {
    cancelAnimationFrame(animFrameRef.current)
    ballsRef.current = []
    setActiveBalls([])
    setBins(Array(binCount).fill(0))
    setTotalBalls(0)
    setIsDropping(false)
  }, [binCount])

  // Level change
  const handleLevelChange = useCallback(
    (levelId: number) => {
      cancelAnimationFrame(animFrameRef.current)
      ballsRef.current = []
      const newLevel = LEVELS.find((l) => l.id === levelId) ?? LEVELS[0]
      const newBinCount = getBinCount(newLevel.rows)
      setCurrentLevelId(levelId)
      setPegs(createPegs(newLevel))
      setBins(Array(newBinCount).fill(0))
      setTotalBalls(0)
      setActiveBalls([])
      setSelectedPeg(null)
      setIsDropping(false)
    },
    []
  )

  // Peg interactions
  const handlePegTap = useCallback(
    (row: number, col: number) => {
      if (
        selectedPeg &&
        selectedPeg.row === row &&
        selectedPeg.col === col
      ) {
        setSelectedPeg(null)
      } else {
        setSelectedPeg({ row, col })
      }
    },
    [selectedPeg]
  )

  const handleProbChange = useCallback(
    (row: number, col: number, prob: number) => {
      setPegs((prev) => {
        const next = prev.map((r) => r.map((p) => ({ ...p })))
        if (next[row] && next[row][col]) {
          next[row][col].leftProb = prob
        }
        return next
      })
    },
    []
  )

  const handleDeselectPeg = useCallback(() => {
    setSelectedPeg(null)
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cancelAnimationFrame(animFrameRef.current)
    }
  }, [])

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Probability Plinko</h1>
        <p className={styles.levelLabel}>
          Level {level.id}: {level.name}
        </p>
        <p className={styles.subtitle}>{level.subtitle}</p>
      </header>

      <div className={styles.boardWrapper}>
        <PlinkoBoard
          level={level}
          pegs={pegs}
          bins={bins}
          totalBalls={totalBalls}
          matchPercent={matchPercent}
          stars={stars}
          activeBalls={activeBalls}
          selectedPeg={selectedPeg}
          onPegTap={handlePegTap}
          onProbChange={handleProbChange}
          onDeselectPeg={handleDeselectPeg}
        />
      </div>

      <Controls
        onDrop={handleDrop}
        onReset={handleReset}
        dropCount={dropCount}
        onDropCountChange={setDropCount}
        speed={speed}
        onSpeedChange={setSpeed}
        isDropping={isDropping}
        totalBalls={totalBalls}
      />

      <StatsPanel stats={stats} hint={level.hint} />

      <LevelSelect
        levels={LEVELS}
        currentLevel={currentLevelId}
        bestStars={bestStars}
        onSelectLevel={handleLevelChange}
      />
    </div>
  )
}
