/**
 * Inline SVG thumbnail for Slope Surfer on the game hub.
 * Depicts a curve with a surfer, tangent line, gems, and target.
 */
export default function SlopeSurferThumbnail() {
  return (
    <svg viewBox="0 0 160 100" width="160" height="100" aria-hidden="true">
      {/* Sky gradient */}
      <defs>
        <linearGradient id="ssThumbnailSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0b0f1a" />
          <stop offset="100%" stopColor="#1a0f2e" />
        </linearGradient>
        <linearGradient id="ssThumbnailCurve" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#a8edea" />
          <stop offset="100%" stopColor="#fed6e3" />
        </linearGradient>
      </defs>
      <rect width="160" height="100" rx="8" fill="url(#ssThumbnailSky)" />

      {/* Stars */}
      <circle cx="20" cy="10" r="0.8" fill="#fff" opacity="0.4" />
      <circle cx="55" cy="15" r="0.6" fill="#fff" opacity="0.3" />
      <circle cx="100" cy="8" r="1" fill="#fff" opacity="0.5" />
      <circle cx="135" cy="20" r="0.7" fill="#fff" opacity="0.3" />

      {/* Mountain curve */}
      <path
        d="M10,70 Q40,25 70,55 Q90,70 110,40 Q130,20 150,50"
        fill="none"
        stroke="url(#ssThumbnailCurve)"
        strokeWidth="2"
        strokeLinecap="round"
      />

      {/* Filled area under curve */}
      <path
        d="M10,70 Q40,25 70,55 Q90,70 110,40 Q130,20 150,50 L150,100 L10,100 Z"
        fill="url(#ssThumbnailCurve)"
        opacity="0.08"
      />

      {/* Surfer (at ~x=70) */}
      <circle cx="70" cy="50" r="4" fill="#fff" stroke="#00e5ff" strokeWidth="1" />

      {/* Tangent line (board) */}
      <line x1="58" y1="58" x2="82" y2="48" stroke="#fff" strokeWidth="2" strokeLinecap="round" />

      {/* Gems */}
      <polygon points="35,30 38,35 35,40 32,35" fill="#ffd700" />
      <polygon points="105,35 108,40 105,45 102,40" fill="#ffd700" />
      <polygon points="130,22 133,27 130,32 127,27" fill="#ffd700" />

      {/* Target flag */}
      <line x1="145" y1="35" x2="145" y2="50" stroke="#4caf50" strokeWidth="1.5" strokeLinecap="round" />
      <polygon points="145,35 155,39 145,43" fill="#4caf50" opacity="0.8" />

      {/* Speed lines */}
      <line x1="52" y1="53" x2="40" y2="56" stroke="#fff" strokeWidth="0.8" opacity="0.3" />
      <line x1="55" y1="58" x2="45" y2="60" stroke="#fff" strokeWidth="0.8" opacity="0.2" />

      {/* f'(x) label */}
      <text x="12" y="92" fill="#76ff03" fontSize="8" fontFamily="monospace" opacity="0.5">
        f&apos;(x)
      </text>
    </svg>
  )
}
