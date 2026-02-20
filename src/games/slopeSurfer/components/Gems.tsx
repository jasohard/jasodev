/**
 * Gems — Diamond-shaped collectibles with float animation.
 */

import { memo } from 'react'
import type { Gem } from '../types'

interface GemsProps {
  gems: Gem[]
  collected: Set<number>
}

function GemsComponent({ gems, collected }: GemsProps) {
  return (
    <g>
      {gems.map((gem) => {
        const isCollected = collected.has(gem.id)
        return (
          <g
            key={gem.id}
            transform={`translate(${gem.x}, ${gem.y})`}
            style={{
              opacity: isCollected ? 0 : 1,
              transition: 'opacity 0.2s ease-out',
            }}
          >
            {/* Outer glow */}
            <circle r={10} fill="#ffd700" opacity={0.1}>
              <animate
                attributeName="r"
                values="10;14;10"
                dur="2s"
                repeatCount="indefinite"
              />
              <animate
                attributeName="opacity"
                values="0.1;0.05;0.1"
                dur="2s"
                repeatCount="indefinite"
              />
            </circle>

            {/* Diamond shape */}
            <polygon
              points="0,-7 5,0 0,7 -5,0"
              fill="#ffd700"
              stroke="#b8860b"
              strokeWidth={1}
              strokeLinejoin="round"
            >
              {/* Float animation */}
              <animateTransform
                attributeName="transform"
                type="translate"
                values="0,0; 0,-3; 0,0"
                dur="1.8s"
                repeatCount="indefinite"
              />
            </polygon>

            {/* Sparkle highlight */}
            <circle r={1.5} cx={-1} cy={-2} fill="#fff" opacity={0.8}>
              <animate
                attributeName="opacity"
                values="0.8;0.3;0.8"
                dur="1.5s"
                repeatCount="indefinite"
              />
            </circle>
          </g>
        )
      })}
    </g>
  )
}

export default memo(GemsComponent)
