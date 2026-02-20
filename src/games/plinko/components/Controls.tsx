import styles from './Controls.module.css'

interface ControlsProps {
  onDrop: () => void
  onReset: () => void
  dropCount: 1 | 10 | 50
  onDropCountChange: (count: 1 | 10 | 50) => void
  speed: 1 | 3 | 10
  onSpeedChange: (speed: 1 | 3 | 10) => void
  isDropping: boolean
  totalBalls: number
}

export default function Controls({
  onDrop,
  onReset,
  dropCount,
  onDropCountChange,
  speed,
  onSpeedChange,
  isDropping,
  totalBalls,
}: ControlsProps) {
  const nextDropCount = (): 1 | 10 | 50 => {
    if (dropCount === 1) return 10
    if (dropCount === 10) return 50
    return 1
  }

  const nextSpeed = (): 1 | 3 | 10 => {
    if (speed === 1) return 3
    if (speed === 3) return 10
    return 1
  }

  return (
    <div className={styles.controls}>
      <div className={styles.row}>
        {/* Drop count toggle */}
        <button
          className={styles.toggleBtn}
          onClick={() => onDropCountChange(nextDropCount())}
          aria-label={`Drop count: ${dropCount}. Tap to change.`}
        >
          <span className={styles.toggleLabel}>Balls</span>
          <span className={styles.toggleValue}>{dropCount}</span>
        </button>

        {/* DROP button - big and prominent */}
        <button
          className={styles.dropBtn}
          onClick={onDrop}
          disabled={isDropping}
          aria-label={`Drop ${dropCount} balls`}
        >
          <svg viewBox="0 0 24 24" width={20} height={20} className={styles.dropIcon}>
            <circle cx={12} cy={6} r={4} fill="currentColor" />
            <path
              d="M12 12 L8 20 L12 18 L16 20 Z"
              fill="currentColor"
              opacity={0.7}
            />
          </svg>
          <span>DROP</span>
        </button>

        {/* Speed toggle */}
        <button
          className={styles.toggleBtn}
          onClick={() => onSpeedChange(nextSpeed())}
          aria-label={`Speed: ${speed}x. Tap to change.`}
        >
          <span className={styles.toggleLabel}>Speed</span>
          <span className={styles.toggleValue}>{speed}x</span>
        </button>
      </div>

      <div className={styles.row}>
        {/* Reset */}
        <button
          className={styles.resetBtn}
          onClick={onReset}
          aria-label="Reset bins"
        >
          <svg viewBox="0 0 24 24" width={16} height={16}>
            <path
              d="M17.65 6.35A7.96 7.96 0 0 0 12 4a8 8 0 1 0 8 8h-2a6 6 0 1 1-1.76-4.24l-2.24 2.24h6v-6l-2.35 2.35z"
              fill="currentColor"
            />
          </svg>
          <span>Reset Bins</span>
        </button>

        {/* Ball count */}
        <span className={styles.ballCount}>
          Balls: {totalBalls}
        </span>
      </div>
    </div>
  )
}
