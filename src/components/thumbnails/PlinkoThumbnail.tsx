/**
 * Inline SVG thumbnail for Probability Plinko shown on the game hub.
 * Depicts a mini Plinko board with pegs, balls, and histogram bars.
 */
export default function PlinkoThumbnail() {
  return (
    <svg viewBox="0 0 160 100" width="160" height="100" aria-hidden="true">
      {/* Background */}
      <rect width="160" height="100" rx="8" fill="#1a1a2e" />

      {/* Peg rows */}
      {/* Row 1 */}
      <circle cx="56" cy="18" r="3" fill="#888" />
      <circle cx="80" cy="18" r="3" fill="#888" />
      <circle cx="104" cy="18" r="3" fill="#888" />

      {/* Row 2 */}
      <circle cx="68" cy="30" r="3" fill="#5c9fdb" />
      <circle cx="92" cy="30" r="3" fill="#e0884d" />

      {/* Row 3 */}
      <circle cx="56" cy="42" r="3" fill="#5c9fdb" />
      <circle cx="80" cy="42" r="3" fill="#888" />
      <circle cx="104" cy="42" r="3" fill="#e0884d" />

      {/* Row 4 */}
      <circle cx="68" cy="54" r="3" fill="#888" />
      <circle cx="92" cy="54" r="3" fill="#888" />

      {/* Animated ball */}
      <circle cx="76" cy="36" r="2.5" fill="#fff" opacity="0.9">
        <animate
          attributeName="cy"
          values="12;36;60"
          dur="1.5s"
          repeatCount="indefinite"
        />
        <animate
          attributeName="cx"
          values="80;68;76"
          dur="1.5s"
          repeatCount="indefinite"
        />
      </circle>

      {/* Histogram bars */}
      <rect x="38" y="80" width="14" height="8" rx="1" fill="#6c5ce7" opacity="0.5" />
      <rect x="55" y="72" width="14" height="16" rx="1" fill="#6c5ce7" opacity="0.7" />
      <rect x="72" y="65" width="14" height="23" rx="1" fill="#6c5ce7" opacity="0.9" />
      <rect x="89" y="72" width="14" height="16" rx="1" fill="#6c5ce7" opacity="0.7" />
      <rect x="106" y="80" width="14" height="8" rx="1" fill="#6c5ce7" opacity="0.5" />

      {/* Target line (dashed) */}
      <polyline
        points="45,78 62,70 79,64 96,70 113,78"
        fill="none"
        stroke="#00d2d3"
        strokeWidth="1.5"
        strokeDasharray="3 2"
      />
    </svg>
  )
}
