/**
 * Inline SVG thumbnail for Vector Voyager on the game hub.
 * Depicts a ship, vector arrows, asteroids, and target.
 */
export default function VectorThumbnail() {
  return (
    <svg viewBox="0 0 160 100" width="160" height="100" aria-hidden="true">
      {/* Deep space background */}
      <rect width="160" height="100" rx="8" fill="#0a0a23" />

      {/* Stars */}
      <circle cx="15" cy="12" r="0.8" fill="#fff" opacity="0.5" />
      <circle cx="45" cy="8" r="0.6" fill="#fff" opacity="0.3" />
      <circle cx="90" cy="15" r="1" fill="#fff" opacity="0.4" />
      <circle cx="130" cy="22" r="0.7" fill="#fff" opacity="0.6" />
      <circle cx="65" cy="85" r="0.8" fill="#fff" opacity="0.4" />
      <circle cx="145" cy="75" r="0.6" fill="#fff" opacity="0.3" />
      <circle cx="25" cy="65" r="0.9" fill="#fff" opacity="0.5" />
      <circle cx="110" cy="60" r="0.7" fill="#fff" opacity="0.4" />

      {/* Target */}
      <circle cx="130" cy="30" r="12" fill="none" stroke="#ffd700" strokeWidth="1.5" strokeDasharray="4 2" opacity="0.8" />
      <circle cx="130" cy="30" r="2" fill="#ffd700" opacity="0.6" />

      {/* Asteroid */}
      <circle cx="85" cy="48" r="14" fill="#3a3a4a" stroke="#666" strokeWidth="1" />
      <circle cx="82" cy="44" r="3" fill="none" stroke="#555" strokeWidth="0.5" opacity="0.5" />

      {/* Ship (triangle) */}
      <polygon points="30,68 22,62 22,74" fill="#e0f7fa" stroke="#4fc3f7" strokeWidth="0.8" />

      {/* Vector 1: blue arrow going right-up */}
      <line x1="30" y1="68" x2="70" y2="48" stroke="#4fc3f7" strokeWidth="2" />
      <polygon points="70,48 64,48 67,43" fill="#4fc3f7" />

      {/* Vector 2: green arrow going right-up */}
      <line x1="70" y1="48" x2="130" y2="30" stroke="#81c784" strokeWidth="2" />
      <polygon points="130,30 124,32 126,26" fill="#81c784" />

      {/* Resultant dashed */}
      <line x1="30" y1="68" x2="130" y2="30" stroke="#fff" strokeWidth="1" strokeDasharray="4 3" opacity="0.3" />
    </svg>
  )
}
