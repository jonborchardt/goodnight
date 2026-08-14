const TREES = [
  { x: 70, y: 660, s: 1 },
  { x: 190, y: 645, s: 0.8 },
  { x: 1400, y: 640, s: 0.7 },
  { x: 1520, y: 655, s: 1.1 },
]

function Tree({ x, y, s, swaying }: { x: number; y: number; s: number; swaying: boolean }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} pointerEvents="none">
      <rect x={-7} y={-40} width={14} height={40} rx={3} fill="#2a2119" />
      <g className={`foliage${swaying ? ' swaying' : ''}`}>
        <ellipse cx={0} cy={-78} rx={34} ry={30} fill="#15301f" />
        <ellipse cx={-20} cy={-56} rx={26} ry={22} fill="#183826" />
        <ellipse cx={20} cy={-56} rx={26} ry={22} fill="#12281a" />
      </g>
    </g>
  )
}

export default function Trees({ swaying }: { swaying: boolean }) {
  return (
    <g>
      {TREES.map((t, i) => (
        <Tree key={i} {...t} swaying={swaying} />
      ))}
    </g>
  )
}
