import type { GameState, HouseState, LevelDef, Vec2, WeatherId } from './types'
import { mulberry32 } from './rng'

export const SCENE_W = 1600
export const SCENE_H = 900
export const ROAD_Y = 700
export const SHHH_RADIUS = 280

// Tuning: quiet neutral house 0->100 in ~40s; satisfied prefs ~25s; shhh ~triples calm.
export const BASE_RATE = 2.5
export const CALM_BONUS = 5

export function createGameState(level: LevelDef, seed: number = Date.now() >>> 0): GameState {
  const rng = mulberry32(seed)
  return {
    level,
    time: 0,
    status: 'playing',
    settleProgress: 0,
    weather: level.startWeather,
    houses: level.houses.map((def): HouseState => ({
      def,
      sleep: 0,
      windowOpen: def.windowStartsOpen ?? false,
      wokeAt: null,
    })),
    lights: level.streetlights.map((def) => ({ def, on: def.startsOn })),
    disturbances: [],
    car: null,
    shhh: null,
    seed,
    rng,
    nextAt: level.schedule.map((e) => e.firstAt ?? e.minGap + rng() * (e.maxGap - e.minGap)),
    severeUntil: 0,
    lastThunderAt: -Infinity,
    nextId: 1,
  }
}

export function tick(s: GameState, dt: number): void {
  s.time += dt
  if (s.status === 'complete') return
  for (const h of s.houses) {
    const rate = BASE_RATE + (shhhCovers(s, h.def.pos) ? CALM_BONUS : 0)
    h.sleep = clamp(h.sleep + rate * dt, 0, 100)
  }
  stepStatus(s, dt)
}

function stepStatus(s: GameState, dt: number): void {
  const allAsleep = s.houses.every((h) => h.sleep >= 100)
  if (!allAsleep) {
    s.status = 'playing'
    s.settleProgress = 0
    return
  }
  if (s.status === 'playing') {
    s.status = 'settling'
    s.settleProgress = 0
  }
  s.settleProgress += dt
  if (s.settleProgress >= s.level.settleSeconds) {
    s.status = 'complete'
    s.shhh = null
  }
}

export function setShhh(s: GameState, pos: Vec2 | null): void {
  if (s.status === 'complete') { s.shhh = null; return }
  s.shhh = pos === null ? null : { pos: { x: pos.x, y: pos.y } }
}

export function setWeather(s: GameState, w: WeatherId): void {
  if (s.level.weatherOptions.includes(w)) s.weather = w
}

export function toggleLight(s: GameState, lightId: string): void {
  const light = s.lights.find((l) => l.def.id === lightId)
  if (light) light.on = !light.on
}

export function toggleWindow(s: GameState, houseId: string): void {
  const h = s.houses.find((h) => h.def.id === houseId)
  if (h !== undefined && h.def.hasWindowControl) h.windowOpen = !h.windowOpen
}

function shhhCovers(s: GameState, p: Vec2): boolean {
  return s.shhh !== null && dist(s.shhh.pos, p) <= SHHH_RADIUS
}

function dist(a: Vec2, b: Vec2): number {
  return Math.hypot(a.x - b.x, a.y - b.y)
}

function clamp(v: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, v))
}
