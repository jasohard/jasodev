/**
 * Inline SVG thumbnail for Plinko shown on the game hub.
 * Depicts a physics-based Plinko board with moveable pegs and bouncing balls.
 */
export default function PlinkoThumbnail() {
  return (
    <svg viewBox="0 0 160 100" width="160" height="100" aria-hidden="true">
      {/* Background */}
      <rect width="160" height="100" rx="8" fill="#0d1117" />

      {/* Fixed pegs (gray) */}
      <circle cx="50" cy="20" r="3" fill="#555" stroke="#666" strokeWidth="0.5" />
      <circle cx="80" cy="20" r="3" fill="#555" stroke="#666" strokeWidth="0.5" />
      <circle cx="110" cy="20" r="3" fill="#555" stroke="#666" strokeWidth="0.5" />
      <circle cx="65" cy="36" r="3" fill="#555" stroke="#666" strokeWidth="0.5" />
      <circle cx="95" cy="36" r="3" fill="#555" stroke="#666" strokeWidth="0.5" />

      {/* Moveable pegs (cyan with dashed ring) */}
      <circle cx="40" cy="38" r="5" fill="none" stroke="rgba(0,188,212,0.3)" strokeWidth="0.8" strokeDasharray="2 2" />
      <circle cx="40" cy="38" r="3" fill="#00bcd4" stroke="#00e5ff" strokeWidth="0.5" />

      <circle cx="120" cy="50" r="5" fill="none" stroke="rgba(0,188,212,0.3)" strokeWidth="0.8" strokeDasharray="2 2" />
      <circle cx="120" cy="50" r="3" fill="#00bcd4" stroke="#00e5ff" strokeWidth="0.5" />

      <circle cx="80" cy="55" r="5" fill="none" stroke="rgba(0,188,212,0.3)" strokeWidth="0.8" strokeDasharray="2 2" />
      <circle cx="80" cy="55" r="3" fill="#00bcd4" stroke="#00e5ff" strokeWidth="0.5" />

      {/* Animated bouncing ball */}
      <circle r="2" fill="#ffeaa7" opacity="0.9">
        <animate
          attributeName="cx"
          values="80;72;85;70;80"
          dur="2s"
          repeatCount="indefinite"
        />
        <animate
          attributeName="cy"
          values="10;25;40;58;70"
          dur="2s"
          repeatCount="indefinite"
        />
      </circle>

      {/* Second ball trailing */}
      <circle r="2" fill="#ffeaa7" opacity="0.5">
        <animate
          attributeName="cx"
          values="82;90;75;90;85"
          dur="2.3s"
          repeatCount="indefinite"
        />
        <animate
          attributeName="cy"
          values="10;28;45;60;70"
          dur="2.3s"
          repeatCount="indefinite"
        />
      </circle>

      {/* Histogram bars */}
      <rect x="28" y="82" width="14" height="6" rx="1" fill="#6c5ce7" opacity="0.5" />
      <rect x="45" y="76" width="14" height="12" rx="1" fill="#6c5ce7" opacity="0.7" />
      <rect x="62" y="70" width="14" height="18" rx="1" fill="#6c5ce7" opacity="0.9" />
      <rect x="79" y="74" width="14" height="14" rx="1" fill="#6c5ce7" opacity="0.7" />
      <rect x="96" y="78" width="14" height="10" rx="1" fill="#6c5ce7" opacity="0.6" />
      <rect x="113" y="83" width="14" height="5" rx="1" fill="#6c5ce7" opacity="0.4" />

      {/* Target line (dashed cyan) */}
      <polyline
        points="35,80 52,73 69,68 86,72 103,77 120,82"
        fill="none"
        stroke="#00d2d3"
        strokeWidth="1.2"
        strokeDasharray="3 2"
      />
    </svg>
  )
}
