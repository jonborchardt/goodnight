// src/scene/TownScene.tsx  (v1 — Task 4 replaces this file with the final
// version that adds houses, lights, dog, car, ripples, shhh, pointer input)
import type { GameState } from '../game/types'
import type { GameControls } from '../ui/useGameLoop'
import Sky from './Sky'
import Ground from './Ground'
import Trees from './Trees'
import House from './House'
import RainLayer from './RainLayer'
import './scene.css'

export default function TownScene({ state }: { state: GameState; controls: GameControls }) {
  return (
    <div className="town-root">
      <svg className="town-svg" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid meet">
        <Sky state={state} />
        <Ground />
        <Trees swaying={state.weather !== 'clear'} />
        {state.houses.map((h) => (
          <House key={h.def.id} hs={h} now={state.time} />
        ))}
        <RainLayer weather={state.weather} />
      </svg>
    </div>
  )
}
