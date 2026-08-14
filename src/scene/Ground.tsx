import { ROAD_Y, SCENE_W } from '../game/sim'

export default function Ground() {
  return (
    <g>
      <rect x={0} y={620} width={SCENE_W} height={280} fill="#101a26" />
      <rect x={0} y={ROAD_Y - 22} width={SCENE_W} height={44} fill="#1c2129" />
      <line
        x1={0}
        y1={ROAD_Y}
        x2={SCENE_W}
        y2={ROAD_Y}
        stroke="#39404e"
        strokeWidth={3}
        strokeDasharray="36 28"
      />
    </g>
  )
}
