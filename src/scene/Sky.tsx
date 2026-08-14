import type { GameState } from '../game/types'

// Deterministic decorative star field, computed once at module load (LCG).
const STARS: { x: number; y: number; r: number }[] = []
{
  let s = 42
  const next = () => {
    s = (s * 1664525 + 1013904223) % 4294967296
    return s / 4294967296
  }
  for (let i = 0; i < 60; i++) {
    STARS.push({ x: next() * 1600, y: next() * 480, r: 1 + (i % 3) * 0.6 })
  }
}

const MOON = { x: 1320, y: 150, r: 46 }
const RING_R = 68
const RING_C = 2 * Math.PI * RING_R

export default function Sky({ state }: { state: GameState }) {
  // settleProgress is 0..1 per the sim contract; clamp defensively.
  const p = Math.min(1, Math.max(0, state.settleProgress))
  return (
    <g>
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#070b1e" />
          <stop offset="1" stopColor="#18264a" />
        </linearGradient>
      </defs>
      <rect x={0} y={0} width={1600} height={900} fill="url(#sky)" />
      {STARS.map((st, i) => (
        <circle
          key={i}
          className="star"
          cx={st.x}
          cy={st.y}
          r={st.r}
          fill="#dfe8ff"
          opacity={0.25 + 0.75 * p}
        />
      ))}
      <circle cx={MOON.x} cy={MOON.y} r={MOON.r} fill="#f2edd3" />
      <circle cx={MOON.x - 14} cy={MOON.y - 8} r={8} fill="#dcd6b8" />
      <circle cx={MOON.x + 10} cy={MOON.y + 14} r={5} fill="#dcd6b8" />
      {/* Settle ring: fills clockwise around the moon while the town settles */}
      <circle
        className="settle-ring"
        cx={MOON.x}
        cy={MOON.y}
        r={RING_R}
        fill="none"
        stroke="#f2edd3"
        strokeWidth={3}
        strokeLinecap="round"
        strokeDasharray={RING_C}
        strokeDashoffset={RING_C * (1 - p)}
        opacity={p > 0 ? 0.9 : 0}
        transform={`rotate(-90 ${MOON.x} ${MOON.y})`}
      />
    </g>
  )
}
