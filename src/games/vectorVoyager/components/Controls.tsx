import { useEffect } from 'react'
import type { GamePhase } from '../types'
import styles from './Controls.module.css'

interface ControlsProps {
  phase: GamePhase
  canLaunch: boolean
  hasSelectedWell: boolean
  hasNextLevel: boolean
  onLaunch: () => void
  onClear: () => void
  onRemoveWell: () => void
  onAdjustWellStrength: (delta: number) => void
  onNextLevel: () => void
}

export default function Controls({
  phase,
  canLaunch,
  hasSelectedWell,
  hasNextLevel,
  onLaunch,
  onClear,
  onRemoveWell,
  onAdjustWellStrength,
  onNextLevel,
}: ControlsProps) {
  // Keyboard shortcuts
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      if (e.code === 'Space' && phase === 'planning') {
        e.preventDefault()
        if (canLaunch) onLaunch()
      } else if (e.code === 'KeyR' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault()
        onClear()
      } else if (e.code === 'Delete' || e.code === 'Backspace') {
        if (phase === 'planning' && hasSelectedWell) {
          e.preventDefault()
          onRemoveWell()
        }
      } else if (e.code === 'KeyN' && phase === 'success' && hasNextLevel) {
        e.preventDefault()
        onNextLevel()
      } else if (e.code === 'ArrowUp' && phase === 'planning' && hasSelectedWell) {
        e.preventDefault()
        onAdjustWellStrength(1)
      } else if (e.code === 'ArrowDown' && phase === 'planning' && hasSelectedWell) {
        e.preventDefault()
        onAdjustWellStrength(-1)
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [phase, canLaunch, hasSelectedWell, hasNextLevel, onLaunch, onClear, onRemoveWell, onAdjustWellStrength, onNextLevel])

  const isPlanning = phase === 'planning'
  const isLaunching = phase === 'launching'
  const showResult = phase === 'success' || phase === 'collision' || phase === 'missed'

  return (
    <div className={styles.controls}>
      {showResult && (
        <div className={styles.resultBanner}>
          {phase === 'success' && (
            <span className={styles.successText}>Target reached!</span>
          )}
          {phase === 'collision' && (
            <span className={styles.failText}>Hit an asteroid!</span>
          )}
          {phase === 'missed' && (
            <span className={styles.failText}>Missed the target!</span>
          )}
        </div>
      )}

      <div className={styles.row}>
        {/* Well controls: remove + strength adjust */}
        {isPlanning && hasSelectedWell && (
          <>
            <button
              className={styles.secondaryBtn}
              onClick={() => onAdjustWellStrength(-1)}
              aria-label="Decrease well strength"
            >
              <span style={{ fontSize: '1rem', fontWeight: 700 }}>−</span>
            </button>
            <button
              className={styles.secondaryBtn}
              onClick={onRemoveWell}
              aria-label="Remove selected well"
              style={{ color: '#f44336' }}
            >
              <svg viewBox="0 0 24 24" width={16} height={16}>
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" fill="currentColor" />
              </svg>
              <span>Remove</span>
            </button>
            <button
              className={styles.secondaryBtn}
              onClick={() => onAdjustWellStrength(1)}
              aria-label="Increase well strength"
            >
              <span style={{ fontSize: '1rem', fontWeight: 700 }}>+</span>
            </button>
          </>
        )}

        {/* LAUNCH / RETRY / NEXT LEVEL */}
        {phase === 'success' && hasNextLevel ? (
          <button
            className={styles.launchBtn}
            onClick={onNextLevel}
            aria-label="Next level"
          >
            <span>NEXT LEVEL</span>
            <span className={styles.rocket}>&#x2192;</span>
          </button>
        ) : (
          <button
            className={styles.launchBtn}
            onClick={isPlanning ? onLaunch : onClear}
            disabled={isPlanning ? !canLaunch : isLaunching}
            aria-label={isPlanning ? 'Launch ship' : 'Clear and retry'}
          >
            {isPlanning ? (
              <>
                <span className={styles.rocket}>&#x1F680;</span>
                <span>LAUNCH</span>
              </>
            ) : (
              <span>RETRY</span>
            )}
          </button>
        )}

        {/* Reset */}
        <button
          className={styles.secondaryBtn}
          onClick={onClear}
          disabled={isLaunching}
          aria-label="Reset level"
        >
          <svg viewBox="0 0 24 24" width={16} height={16}>
            <path d="M12.5 8c-2.65 0-5.05 1-6.9 2.6L2 7v9h9l-3.62-3.62c1.39-1.16 3.16-1.88 5.12-1.88 3.54 0 6.55 2.31 7.6 5.5l2.37-.78C21.08 11.03 17.15 8 12.5 8z" fill="currentColor" />
          </svg>
          <span>Reset</span>
        </button>
      </div>
    </div>
  )
}
