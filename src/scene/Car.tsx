import { ROAD_Y } from '../game/sim'

export default function Car({ x, dir }: { x: number; dir: 1 | -1 }) {
  return (
    <g className="car" transform={`translate(${x} ${ROAD_Y - 6}) scale(${dir} 1)`} pointerEvents="none">
      <polygon points="34,-18 78,-10 78,-4 34,-8" fill="#ffe9a8" opacity={0.35} />
      <rect x={-34} y={-22} width={68} height={16} rx={6} fill="#5a6b8c" />
      <rect x={-18} y={-34} width={32} height={14} rx={5} fill="#48587a" />
      <circle cx={-18} cy={-4} r={7} fill="#151a24" />
      <circle cx={18} cy={-4} r={7} fill="#151a24" />
    </g>
  )
}
