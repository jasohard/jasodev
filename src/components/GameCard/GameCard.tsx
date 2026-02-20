import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'
import styles from './GameCard.module.css'

interface GameCardProps {
  to: string
  title: string
  description: string
  thumbnail: ReactNode
}

export default function GameCard({ to, title, description, thumbnail }: GameCardProps) {
  return (
    <Link to={to} className={styles.card}>
      <div className={styles.thumbnail} aria-hidden="true">
        {thumbnail}
      </div>
      <div className={styles.info}>
        <h2 className={styles.title}>{title}</h2>
        <p className={styles.description}>{description}</p>
      </div>
    </Link>
  )
}
