import type { ReactNode } from 'react'

/** Metadata for a game or interactive art piece displayed on the hub. */
export interface GameEntry {
  /** URL path segment, e.g. "pendulum" -> /pendulum */
  slug: string
  /** Display title */
  title: string
  /** Short description shown on the card */
  description: string
  /** Inline SVG thumbnail component */
  thumbnail: () => ReactNode
}
