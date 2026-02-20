/**
 * LevelComplete — Score breakdown overlay shown after success/failure.
 */

import { memo } from 'react'
import styles from './LevelComplete.module.css'

interface LevelCompleteProps {
  success: boolean
  stars: 0 | 1 | 2 | 3
  score: number
  gemsCollected: number
  totalGems: number
  rideTime: number
  parTime: number | null
  hasNextLevel: boolean
  onRetry: () => void
  onNextLevel: () => void
  onLevelSelect: () => void
}

function LevelCompleteComponent({
  success,
  stars,
  score,
  gemsCollected,
  totalGems,
  rideTime,
  parTime,
  hasNextLevel,
  onRetry,
  onNextLevel,
  onLevelSelect,
}: LevelCompleteProps) {
  return (
    <div className={styles.overlay}>
      <div className={`${styles.panel} ${success ? styles.success : styles.failure}`}>
        <h2 className={styles.title}>
          {success ? '🏄 Level Complete!' : 'Almost there...'}
        </h2>

        {/* Stars */}
        {success && (
          <div className={styles.starsRow}>
            {[1, 2, 3].map((n) => (
              <span
                key={n}
                className={`${styles.star} ${n <= stars ? styles.starEarned : ''}`}
                style={{ animationDelay: `${(n - 1) * 0.2}s` }}
              >
                {n <= stars ? '★' : '☆'}
              </span>
            ))}
          </div>
        )}

        {/* Stats */}
        <div className={styles.stats}>
          {success && (
            <div className={styles.stat}>
              <span className={styles.statLabel}>Score</span>
              <span className={styles.statValue}>{score}</span>
            </div>
          )}
          <div className={styles.stat}>
            <span className={styles.statLabel}>Gems</span>
            <span className={styles.statValue}>
              {gemsCollected}/{totalGems}
            </span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statLabel}>Time</span>
            <span className={styles.statValue}>{rideTime.toFixed(1)}s</span>
          </div>
          {parTime !== null && (
            <div className={styles.stat}>
              <span className={styles.statLabel}>Par</span>
              <span className={`${styles.statValue} ${rideTime <= parTime ? styles.underPar : ''}`}>
                {parTime}s
              </span>
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className={styles.actions}>
          <button className={styles.retryBtn} onClick={onRetry}>
            🔄 {success ? 'Replay' : 'Try Again'}
          </button>
          {success && hasNextLevel && (
            <button className={styles.nextBtn} onClick={onNextLevel}>
              Next Level →
            </button>
          )}
          <button className={styles.selectBtn} onClick={onLevelSelect}>
            Level Select
          </button>
        </div>
      </div>
    </div>
  )
}

export default memo(LevelCompleteComponent)
