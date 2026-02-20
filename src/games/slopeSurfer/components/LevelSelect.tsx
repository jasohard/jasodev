/**
 * LevelSelect — Grid of 8 levels with star tracking.
 */

import { memo } from 'react'
import type { LevelConfig } from '../types'
import styles from './LevelSelect.module.css'

interface LevelSelectProps {
  levels: LevelConfig[]
  currentLevel: number
  bestStars: Record<number, number>
  onSelectLevel: (id: number) => void
  onBack: () => void
}

function LevelSelectComponent({
  levels,
  currentLevel,
  bestStars,
  onSelectLevel,
  onBack,
}: LevelSelectProps) {
  return (
    <div className={styles.overlay}>
      <div className={styles.panel}>
        <h2 className={styles.title}>Select Level</h2>
        <div className={styles.grid}>
          {levels.map((level) => {
            const stars = bestStars[level.id] ?? 0
            const isCurrent = level.id === currentLevel
            // Unlock logic: level 1 always unlocked, others need previous level completed
            const isUnlocked = level.id === 1 || (bestStars[level.id - 1] ?? 0) > 0
            return (
              <button
                key={level.id}
                className={`${styles.card} ${isCurrent ? styles.current : ''} ${!isUnlocked ? styles.locked : ''}`}
                onClick={() => isUnlocked && onSelectLevel(level.id)}
                disabled={!isUnlocked}
                aria-label={`Level ${level.id}: ${level.name}${isUnlocked ? '' : ' (locked)'}`}
              >
                <span className={styles.levelNum}>{level.id}</span>
                <span className={styles.levelName}>{level.name}</span>
                <span className={styles.stars}>
                  {[1, 2, 3].map((n) => (
                    <span
                      key={n}
                      className={n <= stars ? styles.starEarned : styles.starEmpty}
                    >
                      {n <= stars ? '★' : '☆'}
                    </span>
                  ))}
                </span>
                {!isUnlocked && <span className={styles.lock}>🔒</span>}
              </button>
            )
          })}
        </div>
        <button className={styles.backBtn} onClick={onBack}>
          ← Back to Game
        </button>
      </div>
    </div>
  )
}

export default memo(LevelSelectComponent)
