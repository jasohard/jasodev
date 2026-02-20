/** Inline SVG thumbnail for the Pendulum Flows art piece. */
export default function PendulumThumbnail() {
  return (
    <svg viewBox="0 0 160 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <radialGradient id="pend-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#7c5cbf" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#0a0a0f" stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect width="160" height="100" fill="#0a0a12" />
      <circle cx="80" cy="50" r="40" fill="url(#pend-glow)" />

      {/* Stylized pendulum arcs */}
      <g fill="none" strokeLinecap="round" opacity="0.7">
        <path d="M40 50 Q80 20 120 50" stroke="#c4a0e8" strokeWidth="1.2" />
        <path d="M45 55 Q80 30 115 55" stroke="#a87cd4" strokeWidth="1" />
        <path d="M35 45 Q80 10 125 45" stroke="#9068c0" strokeWidth="0.8" />
        <path d="M50 60 Q80 35 110 60" stroke="#e0c0f8" strokeWidth="1" />
        <path d="M30 50 Q80 80 130 50" stroke="#7c5cbf" strokeWidth="1.2" />
        <path d="M38 58 Q80 75 122 58" stroke="#9474d4" strokeWidth="0.8" />
      </g>

      {/* Particle dots */}
      <g opacity="0.9">
        <circle cx="60" cy="38" r="1.5" fill="#c4a0e8" />
        <circle cx="100" cy="38" r="1.5" fill="#c4a0e8" />
        <circle cx="80" cy="25" r="1.8" fill="#e0c0f8" />
        <circle cx="70" cy="62" r="1.2" fill="#9474d4" />
        <circle cx="90" cy="62" r="1.2" fill="#9474d4" />
        <circle cx="50" cy="50" r="1" fill="#a87cd4" />
        <circle cx="110" cy="50" r="1" fill="#a87cd4" />
        <circle cx="80" cy="70" r="1.5" fill="#7c5cbf" />
      </g>
    </svg>
  )
}
