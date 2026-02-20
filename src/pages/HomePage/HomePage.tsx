import GameCard from '../../components/GameCard/GameCard.tsx'
import PendulumThumbnail from '../../components/thumbnails/PendulumThumbnail.tsx'
import PlinkoThumbnail from '../../components/thumbnails/PlinkoThumbnail.tsx'
import PinballThumbnail from '../../components/thumbnails/PinballThumbnail.tsx'
import VectorThumbnail from '../../components/thumbnails/VectorThumbnail.tsx'
import TrigThumbnail from '../../components/thumbnails/TrigThumbnail.tsx'
import styles from './HomePage.module.css'

export default function HomePage() {
  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <h1 className={styles.heading}>Game Hub</h1>
        <p className={styles.subtitle}>
          A collection of browser games and interactive art
        </p>
      </section>

      <section className={styles.grid} aria-label="Available games">
        <GameCard
          to="/plinko"
          title="Probability Plinko"
          description="Hack a Plinko board by tweaking peg odds to match target distributions. Watch hundreds of balls prove you right — or wrong."
          thumbnail={<PlinkoThumbnail />}
        />
        <GameCard
          to="/vectors"
          title="Vector Voyager"
          description="Plan a spaceship's course by drawing vectors. Navigate around asteroids, thread narrow gaps, and feel like a mathematical pilot."
          thumbnail={<VectorThumbnail />}
        />
        <GameCard
          to="/proof-pinball"
          title="Proof Pinball"
          description="Geometry meets billiards. Aim and launch a ball through geometric rooms — the math of reflection IS the physics."
          thumbnail={<PinballThumbnail />}
        />
        <GameCard
          to="/trig"
          title="Trig Turntable"
          description="Stack spinning circles to create mesmerizing wave patterns. One circle makes a sine wave. Four make art. Accidentally learn Fourier analysis."
          thumbnail={<TrigThumbnail />}
        />
        <GameCard
          to="/pendulum"
          title="Pendulum Flows"
          description="Algorithmic art exploring the interplay of coupled oscillators and emergent flow patterns."
          thumbnail={<PendulumThumbnail />}
        />
      </section>
    </div>
  )
}
