import type { GameState, HouseState, LevelDef, Vec2, WeatherId, Disturbance, DisturbanceType, ScheduleEntry } from './types'
import { mulberry32 } from './rng'

export const SCENE_W = 1600
export const SCENE_H = 900
export const ROAD_Y = 700
export const SHHH_RADIUS = 280
export const LIGHT_RADIUS = 320
export const CAR_SPEED = 240
export const OWL_LOUDNESS = 8

// Tuning: quiet neutral house 0->100 in ~40s; satisfied prefs ~25s; shhh ~triples calm.
export const BASE_RATE = 2.5
export const CALM_BONUS = 5

export const FALLOFF_D = 300
export const THUNDER_FALLOFF_D = 900
export const WINDOW_CLOSED_FACTOR = 0.4
export const SHHH_SOURCE_FACTOR = 0.2
export const MASK_RAIN = 6
export const MASK_WIND = 3
export const WAKE_THRESHOLD = 10
export const WAKE_KNOCKDOWN = 60
export const SEVERE_COOLDOWN = 4

export const DISTURBANCE_SPECS: Record<DisturbanceType, { loudness: number; duration: number; severe: boolean }> = {
  bark:    { loudness: 22, duration: 1.2, severe: true },
  car:     { loudness: 26, duration: 9.2, severe: true }, // duration replaced by actual crossing time
  owl:     { loudness: 12, duration: 1.0, severe: false },
  cans:    { loudness: 28, duration: 1.5, severe: true },
  gate:    { loudness: 14, duration: 1.5, severe: false },
  thunder: { loudness: 40, duration: 2.0, severe: true },
  tv:      { loudness: 10, duration: 4.0, severe: false },
}

export const THUNDER_MIN_GAP = 20
const RETRY_DELAY = 1 // blocked entries are delayed, never dropped

function stepScheduler(s: GameState): void {
  for (let i = 0; i < s.level.schedule.length; i++) {
    const e = s.level.schedule[i]
    if (s.time < s.nextAt[i]) continue
    if (e.type === 'car') {
      if (s.car !== null || s.time < s.severeUntil) { s.nextAt[i] = s.time + RETRY_DELAY; continue }
      spawnCar(s)
    } else if (e.type === 'thunder') {
      if (!canThunder(s)) { s.nextAt[i] = s.time + RETRY_DELAY; continue }
      spawnDisturbance(s, 'thunder', { x: SCENE_W / 2, y: 100 })
      s.lastThunderAt = s.time
    } else {
      if (DISTURBANCE_SPECS[e.type].severe && s.time < s.severeUntil) { s.nextAt[i] = s.time + RETRY_DELAY; continue }
      spawnDisturbance(s, e.type, schedulePos(s, e))
    }
    s.nextAt[i] = s.time + e.minGap + s.rng() * (e.maxGap - e.minGap)
  }
}

function canThunder(s: GameState): boolean {
  if (s.weather !== 'rain' || !s.level.thunder) return false
  if (s.time < s.severeUntil) return false
  if (s.time - s.lastThunderAt < THUNDER_MIN_GAP) return false
  // brief: no unfair disasters at the finale's finish line
  if (s.level.night === 10 && s.status === 'settling' && s.settleProgress < 2) return false
  return true
}

function schedulePos(s: GameState, e: ScheduleEntry): Vec2 {
  if (e.pos !== undefined) return e.pos
  if (e.type === 'bark' && s.level.dog !== undefined) return s.level.dog.pos
  return { x: 100 + s.rng() * (SCENE_W - 200), y: 150 + s.rng() * 400 }
}

const CAR_MARGIN = 200 // spawn distance past the scene edge => ~0.8s audible/visible approach

export function spawnCar(s: GameState): void {
  if (s.car !== null) return // one car at a time
  const dir: 1 | -1 = s.rng() < 0.5 ? 1 : -1
  const x = dir === 1 ? -CAR_MARGIN : SCENE_W + CAR_MARGIN
  s.car = { x, dir }
  const d = spawnDisturbance(s, 'car', { x, y: ROAD_Y })
  d.duration = (SCENE_W + 2 * CAR_MARGIN) / CAR_SPEED // full crossing ~8.3s
}

function stepCar(s: GameState, dt: number): void {
  if (s.car === null) return
  s.car.x += s.car.dir * CAR_SPEED * dt
  const d = s.disturbances.find((d) => d.type === 'car')
  if (d !== undefined) d.pos.x = s.car.x
  if (s.car.x < -CAR_MARGIN || s.car.x > SCENE_W + CAR_MARGIN) {
    s.car = null
    s.disturbances = s.disturbances.filter((d) => d.type !== 'car')
  }
}

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
      rate: 0,
    })),
    lights: level.streetlights.map((def) => ({ def, on: def.startsOn })),
    disturbances: [],
    car: null,
    owl: level.owl
      ? { perch: level.owl.start, pos: { x: level.owl.perches[level.owl.start].x, y: level.owl.perches[level.owl.start].y }, movedAt: 0 }
      : null,
    shhh: null,
    seed,
    rng,
    nextAt: level.schedule.map((e) => e.firstAt ?? e.minGap + rng() * (e.maxGap - e.minGap)),
    severeUntil: 0,
    lastThunderAt: -Infinity,
    nextId: 1,
  }
}

export function spawnDisturbance(s: GameState, type: DisturbanceType, pos: Vec2): Disturbance {
  const spec = DISTURBANCE_SPECS[type]
  const d: Disturbance = {
    id: s.nextId++,
    type,
    pos: { x: pos.x, y: pos.y },
    loudness: spec.loudness,
    age: 0,
    duration: spec.duration,
    masked: false,
  }
  s.disturbances.push(d)
  if (spec.severe) s.severeUntil = s.time + spec.duration + SEVERE_COOLDOWN
  return d
}

function maskingFloor(s: GameState): number {
  return s.weather === 'rain' ? MASK_RAIN : s.weather === 'wind' ? MASK_WIND : 0
}

function litLightNear(s: GameState, p: Vec2): boolean {
  return s.lights.some((l) => l.on && dist(l.def.pos, p) <= LIGHT_RADIUS)
}

// Every penalty leaves the net rate positive or is directly player-fixable, so no state is unwinnable.
function traitRate(s: GameState, h: HouseState): number {
  let r = 0
  const t = h.def.traits
  if (t.includes('needsLight')) r += litLightNear(s, h.def.pos) ? 1.5 : -2.5
  if (t.includes('lovesDark')) r += litLightNear(s, h.def.pos) ? -2.5 : 1.0
  if (t.includes('rainSleeper') && s.weather === 'rain') r += 2.0
  if (t.includes('freshAir')) r += h.windowOpen ? 1.5 : -2.5
  if (t.includes('quietHouse') && h.windowOpen) r -= 1.5
  return r
}

function effectiveNoiseAt(s: GameState, h: HouseState): number {
  let noise = 0
  for (const d of s.disturbances) {
    const scale = d.type === 'thunder' ? THUNDER_FALLOFF_D : FALLOFF_D
    const r = dist(d.pos, h.def.pos) / scale
    let v = d.loudness / (1 + r * r)
    if (!h.windowOpen) v *= WINDOW_CLOSED_FACTOR
    if (shhhCovers(s, d.pos)) v *= SHHH_SOURCE_FACTOR
    noise += v
  }
  if (s.owl !== null) {
    const r = dist(s.owl.pos, h.def.pos) / FALLOFF_D
    let v = OWL_LOUDNESS / (1 + r * r)
    if (!h.windowOpen) v *= WINDOW_CLOSED_FACTOR
    noise += v
  }
  let eff = Math.max(0, noise - maskingFloor(s))
  if (h.def.traits.includes('quietHouse')) eff *= 1.5
  if (h.def.traits.includes('stormWorrier') && s.disturbances.some((d) => d.type === 'thunder')) eff += 15
  return eff
}

function wakeThreshold(h: HouseState): number {
  if (h.def.traits.includes('deepSleeper')) return WAKE_THRESHOLD * 2
  if (h.def.traits.includes('lightSleeper')) return WAKE_THRESHOLD / 2
  return WAKE_THRESHOLD
}

function stepDisturbances(s: GameState, dt: number): void {
  const mask = maskingFloor(s)
  for (const d of s.disturbances) {
    d.age += dt
    d.masked = shhhCovers(s, d.pos) || d.loudness * WINDOW_CLOSED_FACTOR <= mask // rough "does weather swallow this" rendering hint
  }
  s.disturbances = s.disturbances.filter((d) => d.age < d.duration)
}

export function tick(s: GameState, dt: number): void {
  s.time += dt
  if (s.status === 'complete') return
  stepScheduler(s)
  stepCar(s, dt)
  stepDisturbances(s, dt)
  for (const h of s.houses) {
    const eff = effectiveNoiseAt(s, h)
    if (h.sleep >= 100) {
      h.rate = 0
      // hysteresis: an asleep house only wakes on a spike above its personal threshold
      if (eff > wakeThreshold(h)) {
        h.sleep = WAKE_KNOCKDOWN
        h.wokeAt = s.time
      }
      continue
    }
    // zen redesign: awake houses stall, never drain
    const rate = Math.max(0, BASE_RATE + traitRate(s, h) + (shhhCovers(s, h.def.pos) ? CALM_BONUS : 0) - eff)
    h.rate = rate
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
  const wasCovering = s.owl !== null && shhhCovers(s, s.owl.pos)
  s.shhh = pos === null ? null : { pos: { x: pos.x, y: pos.y } }
  if (s.owl !== null && !wasCovering && shhhCovers(s, s.owl.pos)) flushOwl(s)
}

// The gamble: a flushed owl picks a different authored perch at random.
function flushOwl(s: GameState): void {
  const def = s.level.owl
  if (def === undefined || s.owl === null || def.perches.length < 2) return
  let next = Math.floor(s.rng() * (def.perches.length - 1))
  if (next >= s.owl.perch) next++
  s.owl = { perch: next, pos: { x: def.perches[next].x, y: def.perches[next].y }, movedAt: s.time }
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
