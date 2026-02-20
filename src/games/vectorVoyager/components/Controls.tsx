import { useEffect } from 'react'
import type { GamePhase } from '../types'
import styles from './Controls.module.css'

interface ControlsProps {
  phase: GamePhase
  vectorCount: number
  canLaunch: boolean
  overBudget: boolean
  hasNextLevel: boolean
  onLaunch: () => void
  onClear: () => void
  onUndo: () => void
  onNextLevel: () => void
}

export default function Controls({
  phase,
  vectorCount,
  canLaunch,
  overBudget,
  hasNextLevel,
  onLaunch,
  onClear,
  onUndo,
  onNextLevel,
}: ControlsProps) {
  // Keyboard shortcuts
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      if (e.code === 'Space' && phase === 'planning') {
        e.preventDefault()
        if (canLaunch && !overBudget) onLaunch()
      } else if (e.code === 'KeyR' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault()
        onClear()
      } else if (e.code === 'KeyZ' && (e.metaKey || e.ctrlKey) && phase === 'planning') {
        e.preventDefault()
        onUndo()
      } else if (e.code === 'KeyN' && phase === 'success' && hasNextLevel) {
        e.preventDefault()
        onNextLevel()
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [phase, canLaunch, overBudget, hasNextLevel, onLaunch, onClear, onUndo, onNextLevel])

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
        {/* Undo */}
        <button
          className={styles.secondaryBtn}
          onClick={onUndo}
          disabled={!isPlanning || vectorCount === 0}
          aria-label="Undo last vector"
        >
          <svg viewBox="0 0 24 24" width={16} height={16}>
            <path d="M12.5 8c-2.65 0-5.05 1-6.9 2.6L2 7v9h9l-3.62-3.62c1.39-1.16 3.16-1.88 5.12-1.88 3.54 0 6.55 2.31 7.6 5.5l2.37-.78C21.08 11.03 17.15 8 12.5 8z" fill="currentColor" />
          </svg>
          <span>Undo</span>
        </button>

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
            className={`${styles.launchBtn} ${overBudget ? styles.overBudget : ''}`}
            onClick={isPlanning ? onLaunch : onClear}
            disabled={isPlanning ? !canLaunch || overBudget : isLaunching}
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

        {/* Clear */}
        <button
          className={styles.secondaryBtn}
          onClick={onClear}
          disabled={isLaunching || (isPlanning && vectorCount === 0)}
          aria-label="Clear all vectors"
        >
          <svg viewBox="0 0 24 24" width={16} height={16}>
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" fill="currentColor" />
          </svg>
          <span>Clear</span>
        </button>
      </div>
    </div>
  )
}
