import { useState } from 'react'
import type { BinStats } from '../engine'
import styles from './StatsPanel.module.css'

interface StatsPanelProps {
  stats: BinStats
  hint: string
}

export default function StatsPanel({ stats, hint }: StatsPanelProps) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className={styles.container}>
      <button
        className={styles.toggleRow}
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        aria-label="Toggle statistics panel"
      >
        <span className={styles.icon}>
          {expanded ? '\u25BC' : '\u25B6'}
        </span>
        <span className={styles.label}>Stats & Hint</span>
      </button>

      {expanded && (
        <div className={styles.content}>
          <p className={styles.hint}>{hint}</p>
          {stats.total > 0 && (
            <div className={styles.statGrid}>
              <div className={styles.stat}>
                <span className={styles.statLabel}>Mean</span>
                <span className={styles.statValue}>{stats.mean}</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statLabel}>Std Dev</span>
                <span className={styles.statValue}>{stats.stdDev}</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statLabel}>Total</span>
                <span className={styles.statValue}>{stats.total}</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statLabel}>Max Bin</span>
                <span className={styles.statValue}>
                  #{stats.maxBin + 1} ({stats.maxBinCount})
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
