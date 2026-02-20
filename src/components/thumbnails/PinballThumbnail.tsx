/**
 * SVG thumbnail for the Proof Pinball game card on the hub page.
 * Shows a geometric room with bouncing ball trail.
 */
export default function PinballThumbnail() {
  return (
    <svg viewBox="0 0 160 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <radialGradient id="pin-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#00bcd4" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#1a1a2e" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Background */}
      <rect width="160" height="100" fill="#1a1a2e" />
      <circle cx="80" cy="50" r="45" fill="url(#pin-glow)" />

      {/* Room walls */}
      <g stroke="#fff" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" fill="none">
        <rect x="20" y="15" width="120" height="70" rx="2" />
      </g>

      {/* Ball trail */}
      <polyline
        points="35,70 65,25 130,55 100,80 45,40"
        fill="none"
        stroke="#00bcd4"
        strokeWidth="1.2"
        opacity="0.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Bounce dots */}
      <g fill="#00bcd4" opacity="0.8">
        <circle cx="65" cy="25" r="2" />
        <circle cx="130" cy="55" r="2" />
        <circle cx="100" cy="80" r="2" />
      </g>

      {/* Ball */}
      <circle cx="45" cy="40" r="4" fill="#fff" opacity="0.95" />

      {/* Target */}
      <circle
        cx="120"
        cy="30"
        r="7"
        fill="rgba(255, 215, 0, 0.15)"
        stroke="#ffd700"
        strokeWidth="1"
        opacity="0.8"
      />
      <circle cx="120" cy="30" r="2" fill="#ffd700" opacity="0.8" />

      {/* Launch point */}
      <circle cx="35" cy="70" r="3.5" fill="#4caf50" opacity="0.8" />

      {/* Angle arc at a bounce */}
      <path
        d="M 62 30 A 6 6 0 0 1 60 24"
        fill="none"
        stroke="#4caf50"
        strokeWidth="0.8"
        opacity="0.6"
      />
      <path
        d="M 68 24 A 6 6 0 0 1 70 30"
        fill="none"
        stroke="#2196f3"
        strokeWidth="0.8"
        opacity="0.6"
      />
    </svg>
  )
}
