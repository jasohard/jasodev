import { useEffect } from 'react'
import styles from './PendulumPage.module.css'

export default function PendulumPage() {
  useEffect(() => {
    document.title = 'Pendulum Flows - jasodev'
    return () => {
      document.title = 'jasodev'
    }
  }, [])

  return (
    <div className={styles.page}>
      <div className={styles.canvasWrapper}>
        <iframe
          src="/pendulum.html"
          title="Pendulum Flows - Interactive algorithmic art"
          className={styles.iframe}
          allow="autoplay"
        />
      </div>
      <div className={styles.info}>
        <h1 className={styles.title}>Pendulum Flows</h1>
        <p className={styles.description}>
          Algorithmic art visualizing the interplay of coupled oscillators.
          The world swings between extremes — order and chaos, growth and
          decay, tension and release. Watch as emergent patterns of flow and
          counterflow unfold.
        </p>
      </div>
    </div>
  )
}
