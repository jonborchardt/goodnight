import type { Vec2 } from '../game/types'

export default function Dog({ pos, barking }: { pos: Vec2; barking: boolean }) {
  return (
    <g transform={`translate(${pos.x} ${pos.y})`} pointerEvents="none">
      <ellipse cx={0} cy={-14} rx={22} ry={14} fill="#8a6b4d" />
      <path d="M -20 -18 q -12 -8 -8 -20" stroke="#8a6b4d" strokeWidth={5} fill="none" strokeLinecap="round" />
      <circle cx={18} cy={barking ? -34 : -26} r={10} fill="#8a6b4d" />
      <polygon points="12,-42 17,-30 8,-32" fill="#6d5238" />
      {barking && (
        <g>
          <path d="M 30 -40 q 8 4 0 10" stroke="#e8ddc8" strokeWidth={2.5} fill="none" />
          <path d="M 36 -46 q 12 8 0 20" stroke="#e8ddc8" strokeWidth={2} fill="none" />
        </g>
      )}
    </g>
  )
}
