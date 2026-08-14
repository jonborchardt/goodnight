import { SHHH_RADIUS } from '../game/sim'
import type { Vec2 } from '../game/types'

// Gentle, not a force field: barely-there fill plus a soft breathing edge.
export default function ShhhCircle({ pos }: { pos: Vec2 }) {
  return (
    <g pointerEvents="none">
      <circle cx={pos.x} cy={pos.y} r={SHHH_RADIUS} fill="#b8c4e8" opacity={0.07} />
      <circle
        className="shhh-edge"
        cx={pos.x}
        cy={pos.y}
        r={SHHH_RADIUS}
        fill="none"
        stroke="#b8c4e8"
        strokeWidth={2}
        opacity={0.18}
      />
    </g>
  )
}
