import { SCENE_H, SCENE_W } from '../game/sim'
import type { WeatherId } from '../game/types'

export default function RainLayer({ weather }: { weather: WeatherId }) {
  if (weather !== 'rain') return null
  return (
    <g pointerEvents="none">
      <defs>
        <pattern id="rain" width={70} height={140} patternUnits="userSpaceOnUse">
          <line x1={12} y1={6} x2={4} y2={44} stroke="#8aa6d8" strokeWidth={2.5} strokeLinecap="round" opacity={0.5} />
          <line x1={52} y1={72} x2={44} y2={110} stroke="#8aa6d8" strokeWidth={2} strokeLinecap="round" opacity={0.35} />
          <line x1={33} y1={40} x2={26} y2={72} stroke="#8aa6d8" strokeWidth={1.5} strokeLinecap="round" opacity={0.25} />
        </pattern>
      </defs>
      <rect
        className="rain-sheet"
        x={-100}
        y={-280}
        width={SCENE_W + 200}
        height={SCENE_H + 400}
        fill="url(#rain)"
      />
    </g>
  )
}
