import GameCard from '../../components/GameCard/GameCard.tsx'
import PendulumThumbnail from '../../components/thumbnails/PendulumThumbnail.tsx'
import PlinkoThumbnail from '../../components/thumbnails/PlinkoThumbnail.tsx'
import PinballThumbnail from '../../components/thumbnails/PinballThumbnail.tsx'
import VectorThumbnail from '../../components/thumbnails/VectorThumbnail.tsx'
import TrigThumbnail from '../../components/thumbnails/TrigThumbnail.tsx'
import SlopeSurferThumbnail from '../../components/thumbnails/SlopeSurferThumbnail.tsx'
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
          to="/slope-surfer"
          title="Slope Surfer"
          description="Ride a curve where your board IS the tangent line and your speed IS |f'(x)|. Shape the terrain, collect gems, and feel what derivatives really mean."
          thumbnail={<SlopeSurferThumbnail />}
        />
        <GameCard
          to="/plinko"
          title="Plinko"
          description="Drag pegs to reshape a Plinko board and watch balls bounce with real physics. Match target distributions by sculpting the ball flow."
          thumbnail={<PlinkoThumbnail />}
        />
        <GameCard
          to="/vectors"
          title="Vector Voyager"
          description="Launch a ship and place gravity wells to bend its path around asteroids. A physics puzzle where you harness gravitational pull to reach the target."
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
