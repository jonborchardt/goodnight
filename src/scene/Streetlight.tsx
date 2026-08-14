import type { StreetlightDef, Vec2 } from '../game/types'

// Visual only: pole/lamp/cone stay in their original paint position (behind
// houses, matching pre-adjacency depth) — see lightHitRect below for the tap
// target, which TownScene renders separately in a top-most overlay so it's
// never occluded by a house painted on top of the (shorter) visual pole.
export default function Streetlight({ def, on }: { def: StreetlightDef; on: boolean }) {
  const { x, y } = def.pos // base of the pole
  const top = y - 150
  return (
    <g>
      <polygon
        className="light-cone"
        points={`${x + 26},${top + 12} ${x - 44},${y} ${x + 96},${y}`}
        fill="#ffe9a8"
        opacity={on ? 0.16 : 0}
        pointerEvents="none"
      />
      <line x1={x} y1={y} x2={x} y2={top} stroke="#3c4352" strokeWidth={7} strokeLinecap="round" />
      <line x1={x} y1={top} x2={x + 26} y2={top + 6} stroke="#3c4352" strokeWidth={6} strokeLinecap="round" />
      <circle className="lamp" cx={x + 26} cy={top + 12} r={9}
        fill={on ? '#ffe9a8' : '#2a3040'} stroke="#3c4352" strokeWidth={2} />
    </g>
  )
}

// World-space oversized tap target (100 wide, full pole height) for a
// streetlight, geometry unchanged from the original inline rect.
export function lightHitRect(def: StreetlightDef): { x: number; y: number; w: number; h: number } {
  const { x, y }: Vec2 = def.pos
  const top = y - 150
  return { x: x - 40, y: top - 20, w: 100, h: y - top + 20 }
}
