import type { StreetlightDef } from '../game/types'

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
      {/* Oversized invisible tap target: 100 wide, full pole height */}
      <rect
        data-toggle={`light:${def.id}`}
        x={x - 40}
        y={top - 20}
        width={100}
        height={y - top + 20}
        fill="transparent"
      />
    </g>
  )
}
