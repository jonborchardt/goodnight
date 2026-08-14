import type { GameState } from '../game/types'

// The owl: a persistent soft noise source. CSS transform transition animates
// the flight when the sim relocates it (pos changes -> new translate).
export default function Owl({ owl }: { owl: NonNullable<GameState['owl']> }) {
  return (
    <g
      className="owl-body"
      style={{ transform: `translate(${owl.pos.x}px, ${owl.pos.y}px)` }}
      pointerEvents="none"
    >
      <circle className="owl-ripple" cx={0} cy={-12} r={8} fill="none" stroke="#cfd9f2" strokeWidth={1.5} />
      <ellipse cx={0} cy={-10} rx={10} ry={13} fill="#5e5648" />
      <circle cx={-4} cy={-16} r={2.2} fill="#ffd98a" />
      <circle cx={4} cy={-16} r={2.2} fill="#ffd98a" />
      <polygon points="-9,-22 -4,-14 -12,-15" fill="#4a4438" />
      <polygon points="9,-22 4,-14 12,-15" fill="#4a4438" />
    </g>
  )
}
