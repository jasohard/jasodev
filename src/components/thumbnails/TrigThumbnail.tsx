/**
 * SVG thumbnail for the Trig Turntable game card on the hub page.
 * Shows a spinning circle with a sine wave trace.
 */
export default function TrigThumbnail() {
  return (
    <svg viewBox="0 0 160 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <radialGradient id="trig-glow" cx="30%" cy="50%" r="40%">
          <stop offset="0%" stopColor="#4fc3f7" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#0d1117" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Background */}
      <rect width="160" height="100" fill="#0d1117" />
      <circle cx="45" cy="50" r="35" fill="url(#trig-glow)" />

      {/* Unit circle */}
      <circle cx="45" cy="50" r="24" fill="none" stroke="#4fc3f7" strokeWidth="1" opacity="0.4" />

      {/* Radius arm */}
      <line x1="45" y1="50" x2="65" y2="35" stroke="#4fc3f7" strokeWidth="1.2" opacity="0.7" />

      {/* Tip dot */}
      <circle cx="65" cy="35" r="3" fill="#4fc3f7" opacity="0.9" />

      {/* Center dot */}
      <circle cx="45" cy="50" r="2" fill="#4fc3f7" opacity="0.5" />

      {/* Connection line */}
      <line x1="65" y1="35" x2="80" y2="35" stroke="#4fc3f7" strokeWidth="0.8" strokeDasharray="2 2" opacity="0.4" />

      {/* Sine wave */}
      <path
        d="M 80 50 Q 90 30, 100 50 Q 110 70, 120 50 Q 130 30, 140 50 Q 150 70, 155 50"
        fill="none"
        stroke="#4fc3f7"
        strokeWidth="1.5"
        opacity="0.8"
        strokeLinecap="round"
      />

      {/* Second circle (epicycle) hint */}
      <circle cx="65" cy="35" r="10" fill="none" stroke="#f06292" strokeWidth="0.8" opacity="0.3" strokeDasharray="2 2" />
      <line x1="65" y1="35" x2="72" y2="28" stroke="#f06292" strokeWidth="0.8" opacity="0.4" />
      <circle cx="72" cy="28" r="2" fill="#f06292" opacity="0.6" />

      {/* Axis line */}
      <line x1="80" y1="50" x2="155" y2="50" stroke="#333" strokeWidth="0.5" opacity="0.5" />
    </svg>
  )
}
