import { useEffect, useMemo, useReducer, useRef } from 'react'
import type { GameState, LevelDef, Vec2, WeatherId } from '../game/types'
import {
  createGameState,
  setShhh,
  setWeather,
  tick,
  toggleLight,
  toggleWindow,
} from '../game/sim'

// Fixed sim step: 100 ms, in seconds (matches the sim's ~10 Hz design).
const STEP = 0.1
// Cap accumulated time (tab-away, huge dev speeds) so we never spiral.
const MAX_ACC = 2

export interface GameControls {
  shhh(pos: Vec2 | null): void
  toggleLight(id: string): void
  toggleWindow(id: string): void
  setWeather(w: WeatherId): void
  restart(): void
}

export interface DevGame {
  readonly state: GameState
  controls: GameControls
  setSpeed(mult: number): void
}

export function useGameLoop(level: LevelDef): { state: GameState; controls: GameControls } {
  const [, bump] = useReducer((n: number) => n + 1, 0)
  const stateRef = useRef<GameState | null>(null)
  const levelRef = useRef<LevelDef | null>(null)
  const speedRef = useRef(1)

  // Lazy init / re-init when the level object changes (new night).
  if (levelRef.current !== level) {
    levelRef.current = level
    stateRef.current = createGameState(level)
  }

  const controls = useMemo<GameControls>(
    () => ({
      shhh: (pos) => setShhh(stateRef.current!, pos),
      toggleLight: (id) => {
        toggleLight(stateRef.current!, id)
        bump()
      },
      toggleWindow: (id) => {
        toggleWindow(stateRef.current!, id)
        bump()
      },
      setWeather: (w) => {
        setWeather(stateRef.current!, w)
        bump()
      },
      restart: () => {
        stateRef.current = createGameState(level)
        bump()
      },
    }),
    [level],
  )

  useEffect(() => {
    let last = performance.now()
    let acc = 0
    let raf = requestAnimationFrame(function frame(now: number) {
      acc += ((now - last) / 1000) * speedRef.current
      last = now
      if (acc > MAX_ACC) acc = MAX_ACC
      let ticked = false
      while (acc >= STEP) {
        tick(stateRef.current!, STEP)
        acc -= STEP
        ticked = true
      }
      if (ticked) bump()
      raf = requestAnimationFrame(frame)
    })
    return () => cancelAnimationFrame(raf)
  }, [level])

  // Dev hooks so plans 3-5 can playtest via Playwright:
  // window.__game.state / .controls / .setSpeed(20)
  useEffect(() => {
    if (!import.meta.env.DEV) return
    const w = window as unknown as { __game?: DevGame }
    w.__game = {
      get state() {
        return stateRef.current!
      },
      controls,
      setSpeed: (mult: number) => {
        speedRef.current = mult
      },
    }
    return () => {
      delete w.__game
    }
  }, [controls])

  return { state: stateRef.current!, controls }
}
