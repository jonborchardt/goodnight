import type { Disturbance } from '../game/types'

// Masked (rain/shhh'd) disturbances ripple smaller and fainter, per the brief.
export default function Ripple({ d }: { d: Disturbance }) {
  const t = Math.min(1, d.age / d.duration)
  const maxR = d.masked ? 110 : 240
  return (
    <circle
      className="ripple"
      cx={d.pos.x}
      cy={d.pos.y}
      r={12 + t * maxR}
      fill="none"
      stroke="#cfd9f2"
      strokeWidth={d.masked ? 1.5 : 2.5}
      opacity={(1 - t) * (d.masked ? 0.22 : 0.5)}
      pointerEvents="none"
    />
  )
}
