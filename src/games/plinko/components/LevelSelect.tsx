import type { LevelConfig } from '../types'
import styles from './LevelSelect.module.css'

interface LevelSelectProps {
  levels: LevelConfig[]
  currentLevel: number
  /** Map of levelId → best stars earned */
  bestStars: Record<number, number>
  onSelectLevel: (levelId: number) => void
}

export default function LevelSelect({
  levels,
  currentLevel,
  bestStars,
  onSelectLevel,
}: LevelSelectProps) {
  return (
    <div className={styles.container}>
      <h3 className={styles.heading}>Select Level</h3>
      <div className={styles.grid}>
        {levels.map((level) => {
          const earned = bestStars[level.id] ?? 0
          const isCurrent = level.id === currentLevel
          return (
            <button
              key={level.id}
              className={`${styles.levelBtn} ${isCurrent ? styles.active : ''}`}
              onClick={() => onSelectLevel(level.id)}
              aria-label={`Level ${level.id}: ${level.name}`}
              aria-current={isCurrent ? 'true' : undefined}
            >
              <span className={styles.levelNum}>{level.id}</span>
              <span className={styles.levelName}>{level.name}</span>
              <span className={styles.stars} aria-label={`${earned} of 3 stars`}>
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
    </div>
  )
}
