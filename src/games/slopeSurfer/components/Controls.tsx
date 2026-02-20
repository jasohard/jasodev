/**
 * Controls — SURF button and tool buttons (derivative toggle, speed overlay, etc.)
 */

import { memo } from 'react'
import type { GamePhase } from '../types'
import styles from './Controls.module.css'

interface ControlsProps {
  phase: GamePhase
  showDerivToggle: boolean
  showDerivGraph: boolean
  showSpeedOverlay: boolean
  onSurf: () => void
  onRetry: () => void
  onToggleDerivative: () => void
  onToggleSpeed: () => void
  onLevelSelect: () => void
  onResetTerrain: () => void
}

function ControlsComponent({
  phase,
  showDerivToggle,
  showDerivGraph,
  showSpeedOverlay,
  onSurf,
  onRetry,
  onToggleDerivative,
  onToggleSpeed,
  onLevelSelect,
  onResetTerrain,
}: ControlsProps) {
  const isPlanning = phase === 'planning'
  const isRiding = phase === 'riding'

  return (
    <div className={styles.bar}>
      <div className={styles.left}>
        {/* Level select button */}
        <button
          className={styles.toolBtn}
          onClick={onLevelSelect}
          aria-label="Level select"
          title="Level Select"
        >
          ☰
        </button>

        {/* Reset terrain */}
        {isPlanning && (
          <button
            className={styles.toolBtn}
            onClick={onResetTerrain}
            aria-label="Reset terrain"
            title="Reset Terrain"
          >
            ↺
          </button>
        )}
      </div>

      <div className={styles.center}>
        {/* SURF button */}
        {isPlanning && (
          <button className={styles.surfBtn} onClick={onSurf}>
            🏄 SURF!
          </button>
        )}

        {/* Riding indicator */}
        {isRiding && (
          <div className={styles.ridingIndicator}>
            Riding...
          </div>
        )}
      </div>

      <div className={styles.right}>
        {/* Derivative graph toggle */}
        {showDerivToggle && (
          <button
            className={`${styles.toolBtn} ${showDerivGraph ? styles.active : ''}`}
            onClick={onToggleDerivative}
            aria-label="Toggle derivative graph"
            title="Show f'(x) graph"
          >
            f&apos;
          </button>
        )}

        {/* Speed overlay toggle */}
        <button
          className={`${styles.toolBtn} ${showSpeedOverlay ? styles.active : ''}`}
          onClick={onToggleSpeed}
          aria-label="Toggle speed colors"
          title="Color by speed"
        >
          🌈
        </button>

        {/* Retry */}
        {(phase === 'riding' || phase === 'failed') && (
          <button
            className={styles.toolBtn}
            onClick={onRetry}
            aria-label="Retry level"
            title="Retry"
          >
            🔄
          </button>
        )}
      </div>
    </div>
  )
}

export default memo(ControlsComponent)
