/**
 * Inline SVG thumbnail for Vector Voyager on the game hub.
 * Depicts a ship, launch vector, gravity well, curved path, and target.
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

      {/* Target */}
      <circle cx="135" cy="30" r="10" fill="none" stroke="#ffd700" strokeWidth="1.5" strokeDasharray="4 2" opacity="0.8" />
      <circle cx="135" cy="30" r="2" fill="#ffd700" opacity="0.6" />

      {/* Asteroid */}
      <circle cx="85" cy="50" r="12" fill="#3a3a4a" stroke="#666" strokeWidth="1" />

      {/* Gravity well — purple concentric rings */}
      <circle cx="100" cy="25" r="16" fill="none" stroke="#9c27b0" strokeWidth="0.8" opacity="0.2" />
      <circle cx="100" cy="25" r="10" fill="none" stroke="#9c27b0" strokeWidth="0.8" opacity="0.35" />
      <circle cx="100" cy="25" r="5" fill="none" stroke="#9c27b0" strokeWidth="1" opacity="0.5" />
      <circle cx="100" cy="25" r="2" fill="#ce93d8" opacity="0.7" />

      {/* Ship (triangle) */}
      <polygon points="28,70 20,64 20,76" fill="#e0f7fa" stroke="#4fc3f7" strokeWidth="0.8" />

      {/* Launch vector */}
      <line x1="28" y1="70" x2="55" y2="55" stroke="#4fc3f7" strokeWidth="2" />
      <polygon points="55,55 49,56 51,50" fill="#4fc3f7" />

      {/* Curved trajectory preview (dotted cyan) */}
      <path
        d="M28,70 Q60,40 100,30 Q120,26 135,30"
        fill="none"
        stroke="#00e5ff"
        strokeWidth="1"
        strokeDasharray="3 3"
        opacity="0.5"
      />
    </svg>
  )
}
