import assert from 'node:assert/strict'
import type { GameState, HouseDef, LevelDef, TraitId, Vec2, DisturbanceType } from '../src/game/types'
import { stageOf } from '../src/game/types'
import { mulberry32 } from '../src/game/rng'
import {
  createGameState, tick, setShhh, setWeather, toggleLight, toggleWindow, spawnDisturbance, spawnCar,
  SCENE_W, ROAD_Y, DISTURBANCE_SPECS,
} from '../src/game/sim'
import type { ScheduleEntry } from '../src/game/types'

export function approx(actual: number, lo: number, hi: number, msg: string): void {
  assert.ok(actual >= lo && actual <= hi, `${msg}: got ${actual}, expected [${lo}, ${hi}]`)
}

export function lvl(patch: Partial<LevelDef>): LevelDef {
  return {
    night: 1, title: 'test', hint: '', settleSeconds: 5,
    weatherOptions: ['clear', 'wind', 'rain'], startWeather: 'clear', thunder: false,
    houses: [], streetlights: [], schedule: [],
    ...patch,
  }
}

export function house(patch: Partial<HouseDef>): HouseDef {
  return {
    id: 'h', label: 'H', pos: { x: 800, y: 500 }, color: '#cccccc',
    variant: 'cottage', traits: [], hasWindowControl: true,
    ...patch,
  }
}

export function runFor(s: GameState, seconds: number, dt = 0.1): void {
  for (let t = 0; t < seconds - 1e-9; t += dt) tick(s, dt)
}

export function timeToAllAsleep(s: GameState, maxSeconds = 120, dt = 0.1): number {
  for (let t = 0; t < maxSeconds; t += dt) {
    tick(s, dt)
    if (s.houses.every((h) => h.sleep >= 100)) return s.time
  }
  return Infinity
}

console.log('== task 1: stages and rng ==')
{
  assert.equal(stageOf(0), 'awake')
  assert.equal(stageOf(39.9), 'awake')
  assert.equal(stageOf(40), 'drowsy')
  assert.equal(stageOf(74.9), 'drowsy')
  assert.equal(stageOf(75), 'nearly')
  assert.equal(stageOf(99.9), 'nearly')
  assert.equal(stageOf(100), 'asleep')
}
{
  const a = mulberry32(123)
  const b = mulberry32(123)
  const c = mulberry32(124)
  const seqA = [a(), a(), a(), a(), a()]
  const seqB = [b(), b(), b(), b(), b()]
  const seqC = [c(), c(), c(), c(), c()]
  assert.deepEqual(seqA, seqB, 'same seed -> same sequence')
  assert.notDeepEqual(seqA, seqC, 'different seed -> different sequence')
  for (const v of seqA) assert.ok(v >= 0 && v < 1, 'rng values in [0, 1)')
}

console.log('== task 2: sleep core, settling, mutators ==')
{
  const s = createGameState(lvl({ houses: [house({})] }), 7)
  approx(timeToAllAsleep(s), 38, 42, 'neutral quiet house falls asleep in ~40s')
}
{
  const s = createGameState(lvl({ houses: [house({})] }), 7)
  setShhh(s, { x: 800, y: 500 })
  approx(timeToAllAsleep(s), 12, 15, 'shhh roughly triples the fill rate (~13.3s)')
}
{
  const s = createGameState(lvl({ houses: [house({})], settleSeconds: 5 }), 7)
  runFor(s, 41)
  assert.equal(s.status, 'settling', 'settling starts when all houses asleep')
  runFor(s, 2)
  assert.ok(s.settleProgress > 1.5, 'settle progress accumulates')
  s.houses[0].sleep = 50 // simulate a wake mid-settling
  tick(s, 0.1)
  assert.equal(s.status, 'playing', 'a wake cancels settling')
  assert.equal(s.settleProgress, 0, 'settle progress resets')
  runFor(s, 30) // 50->100 at 2.5/s = 20s, + 5s settle
  assert.equal(s.status, 'complete', 'town re-settles and completes')
  setShhh(s, { x: 0, y: 0 })
  assert.equal(s.shhh, null, 'shhh is disabled after complete')
}
{
  const s = createGameState(lvl({ houses: [house({})], weatherOptions: ['clear'] }), 7)
  setWeather(s, 'rain')
  assert.equal(s.weather, 'clear', 'setWeather ignores weather the level does not offer')
}
{
  const s = createGameState(lvl({
    houses: [house({ hasWindowControl: true }), house({ id: 'h2', hasWindowControl: false })],
    streetlights: [{ id: 'sl', pos: { x: 400, y: 600 }, startsOn: true }],
  }), 7)
  toggleLight(s, 'sl')
  assert.equal(s.lights[0].on, false, 'toggleLight flips a light off')
  toggleLight(s, 'sl')
  assert.equal(s.lights[0].on, true, 'toggleLight flips it back on')
  toggleWindow(s, 'h')
  assert.equal(s.houses[0].windowOpen, true, 'toggleWindow opens a controllable window')
  toggleWindow(s, 'h2')
  assert.equal(s.houses[1].windowOpen, false, 'houses without window control never toggle')
}

console.log('== task 3: noise pipeline and hysteresis ==')
{
  // one bark within earshot reverses progress (bark 22 at 150px: eff 17.6 >> base 2.5)
  const s = createGameState(lvl({ houses: [house({ windowStartsOpen: true })] }), 7)
  runFor(s, 20)
  const before = s.houses[0].sleep
  spawnDisturbance(s, 'bark', { x: 950, y: 500 })
  runFor(s, 1)
  assert.ok(s.houses[0].sleep < before, 'a bark reverses sleep progress')
}
{
  // closed window attenuates 0.4x
  const open = createGameState(lvl({ houses: [house({ windowStartsOpen: true })] }), 7)
  const closed = createGameState(lvl({ houses: [house({})] }), 7)
  for (const s of [open, closed]) {
    runFor(s, 10)
    spawnDisturbance(s, 'bark', { x: 950, y: 500 })
    runFor(s, 1.2)
  }
  assert.ok(closed.houses[0].sleep > open.houses[0].sleep, 'closed window blocks more noise')
}
{
  // rain masking floor fully absorbs a distant owl (12 at 300px = 6 <= MASK_RAIN 6)
  const s = createGameState(lvl({ houses: [house({ windowStartsOpen: true })], startWeather: 'rain' }), 7)
  runFor(s, 10)
  const before = s.houses[0].sleep
  spawnDisturbance(s, 'owl', { x: 1100, y: 500 })
  tick(s, 0.5)
  approx(s.houses[0].sleep - before, 0.5 * 2.4, 0.5 * 2.6, 'rain fully masks the distant owl (full BASE_RATE)')
  assert.ok(s.disturbances[0].masked, 'masked flag set for rendering smaller ripples')
}
{
  // hysteresis: wake only above personal threshold; knockdown to 60, never 0
  const mkAsleep = (traits: TraitId[]) => {
    const s = createGameState(lvl({ houses: [house({ traits })] }), 7)
    s.houses[0].sleep = 100
    s.houses[0].windowOpen = true
    return s
  }
  // owl at 50px: eff ~11.7 — above base threshold 10, below deepSleeper's 20
  const normal = mkAsleep([])
  spawnDisturbance(normal, 'owl', { x: 850, y: 500 })
  tick(normal, 0.1)
  assert.equal(normal.houses[0].sleep, 60, 'wake knocks sleep to 60, not 0')
  assert.equal(normal.houses[0].wokeAt, normal.time, 'wokeAt recorded for the view')
  const deep = mkAsleep(['deepSleeper'])
  spawnDisturbance(deep, 'owl', { x: 850, y: 500 })
  tick(deep, 0.1)
  assert.equal(deep.houses[0].sleep, 100, 'deepSleeper sleeps through the owl')
  // gate at 300px: eff ~7 — below base 10, above lightSleeper's 5
  const light = mkAsleep(['lightSleeper'])
  spawnDisturbance(light, 'gate', { x: 1100, y: 500 })
  tick(light, 0.1)
  assert.equal(light.houses[0].sleep, 60, 'lightSleeper wakes to smaller noises')
  const normal2 = mkAsleep([])
  spawnDisturbance(normal2, 'gate', { x: 1100, y: 500 })
  tick(normal2, 0.1)
  assert.equal(normal2.houses[0].sleep, 100, 'normal sleeper sleeps through the gate')
}
{
  // shhh attenuates a source inside its circle (factor 0.2)
  const s = createGameState(lvl({ houses: [house({ windowStartsOpen: true })] }), 7)
  runFor(s, 10)
  const before = s.houses[0].sleep
  spawnDisturbance(s, 'bark', { x: 950, y: 500 })
  setShhh(s, { x: 950, y: 500 }) // covers the bark AND the house (150px away)
  runFor(s, 1)
  // eff = 17.6 * 0.2 = 3.5; rate = 2.5 + 5 (calm) - 3.5 = +4/s
  assert.ok(s.houses[0].sleep > before, 'shhh turns a bad bark into net progress')
}

console.log('== task 4: trait modifiers ==')
function fillRate(s: GameState): number {
  runFor(s, 5)
  return s.houses[0].sleep / 5
}
{
  const lit = () => lvl({
    houses: [house({ traits: ['needsLight'] })],
    streetlights: [{ id: 'sl', pos: { x: 900, y: 550 }, startsOn: true }], // 112px from house
  })
  approx(fillRate(createGameState(lit(), 7)), 3.8, 4.2, 'needsLight + lit light nearby: ~4/s')
  const dark = createGameState(lit(), 7)
  toggleLight(dark, 'sl')
  approx(fillRate(dark), 0.3, 0.7, 'needsLight in the dark: slow but still positive (recoverable)')
}
{
  const near = () => lvl({
    houses: [house({ traits: ['lovesDark'] })],
    streetlights: [{ id: 'sl', pos: { x: 900, y: 550 }, startsOn: true }],
  })
  approx(fillRate(createGameState(near(), 7)), -0.1, 0.1, 'lovesDark under a lit light: stalls at ~0/s')
  const dark = createGameState(near(), 7)
  toggleLight(dark, 'sl')
  approx(fillRate(dark), 3.3, 3.7, 'lovesDark in darkness: ~3.5/s')
}
{
  const s = createGameState(lvl({ houses: [house({ traits: ['rainSleeper'] })], startWeather: 'rain' }), 7)
  approx(fillRate(s), 4.3, 4.7, 'rainSleeper in rain: ~4.5/s')
}
{
  approx(fillRate(createGameState(lvl({ houses: [house({ traits: ['freshAir'], windowStartsOpen: true })] }), 7)),
    3.8, 4.2, 'freshAir with open window: ~4/s')
  approx(fillRate(createGameState(lvl({ houses: [house({ traits: ['freshAir'] })] }), 7)),
    1.3, 1.7, 'freshAir with closed window: ~1.5/s')
}
{
  approx(fillRate(createGameState(lvl({ houses: [house({ traits: ['quietHouse'], windowStartsOpen: true })] }), 7)),
    0.8, 1.2, 'quietHouse with open window: ~1/s')
  // quietHouse noise sensitivity: eff x1.5 makes a masked-for-others noise still sting
  const s = createGameState(lvl({ houses: [house({ traits: ['quietHouse'] })] }), 7)
  runFor(s, 10)
  const plain = createGameState(lvl({ houses: [house({})] }), 7)
  runFor(plain, 10)
  spawnDisturbance(s, 'bark', { x: 950, y: 500 })
  spawnDisturbance(plain, 'bark', { x: 950, y: 500 })
  runFor(s, 1.2)
  runFor(plain, 1.2)
  assert.ok(s.houses[0].sleep < plain.houses[0].sleep, 'quietHouse suffers more from the same bark')
}
{
  // stormWorrier: distant thunder wakes them; deepSleeper behind a closed window sleeps through
  const mkAsleep = (traits: TraitId[], open: boolean) => {
    const s = createGameState(lvl({ houses: [house({ traits })], startWeather: 'rain', thunder: true }), 7)
    s.houses[0].sleep = 100
    s.houses[0].windowOpen = open
    return s
  }
  const worrier = mkAsleep(['stormWorrier'], true)
  spawnDisturbance(worrier, 'thunder', { x: 800, y: 100 })
  tick(worrier, 0.1)
  assert.equal(worrier.houses[0].sleep, 60, 'stormWorrier wakes on thunder')
  const deep = mkAsleep(['deepSleeper'], false)
  spawnDisturbance(deep, 'thunder', { x: 800, y: 100 })
  tick(deep, 0.1)
  assert.equal(deep.houses[0].sleep, 100, 'deepSleeper behind closed window sleeps through thunder')
}

console.log('== task 5: the car ==')
{
  const near = house({ id: 'near', pos: { x: 800, y: 620 }, windowStartsOpen: true }) // 80px above road
  const far = house({ id: 'far', pos: { x: 800, y: 200 } })
  const s = createGameState(lvl({ houses: [near, far] }), 7)
  runFor(s, 10)
  const nearBefore = s.houses[0].sleep
  const farBefore = s.houses[1].sleep
  spawnCar(s)
  assert.ok(s.car !== null, 'car state set')
  assert.ok(s.car!.x < 0 || s.car!.x > SCENE_W, 'car spawns off-screen (visible approach before it arrives)')
  const d = s.disturbances.find((d) => d.type === 'car')
  assert.ok(d !== undefined && d.pos.y === ROAD_Y, 'car noise source travels on the road')
  runFor(s, 4.6) // 2000px at 240px/s: mid-town around t+4.2s
  assert.ok(s.houses[0].sleep < nearBefore, 'roadside house loses sleep as the car passes')
  const mid = s.disturbances.find((d) => d.type === 'car')
  assert.ok(mid !== undefined && Math.abs(mid.pos.x - s.car!.x) < 1, 'noise source follows the car')
  runFor(s, 5)
  assert.equal(s.car, null, 'car despawns after crossing')
  assert.ok(!s.disturbances.some((d) => d.type === 'car'), 'car noise removed with it')
  assert.ok(s.houses[1].sleep > farBefore + 5, 'distant house keeps making progress through the whole crossing')
}

console.log('== task 6: scheduler, dog, thunder ==')
const busy = () => lvl({
  thunder: true,
  dog: { pos: { x: 1150, y: 620 } },
  houses: [house({})],
  schedule: [
    { type: 'bark', minGap: 8, maxGap: 12, firstAt: 2 }, // no pos: barks at the dog
    { type: 'cans', pos: { x: 400, y: 400 }, minGap: 9, maxGap: 14, firstAt: 3 },
    { type: 'thunder', minGap: 20, maxGap: 30, firstAt: 5 },
    { type: 'car', minGap: 25, maxGap: 35, firstAt: 10 },
  ],
})
function spawnLog(level: LevelDef, seed: number, seconds: number, wet: boolean): string[] {
  const s = createGameState(level, seed)
  if (wet) setWeather(s, 'rain')
  const log: string[] = []
  let seen = 0
  for (let t = 0; t < seconds; t += 0.1) {
    tick(s, 0.1)
    for (const d of s.disturbances) {
      if (d.id > seen) { seen = d.id; log.push(`${d.type}@${s.time.toFixed(1)}`) }
    }
    const severe = s.disturbances.filter((d) => DISTURBANCE_SPECS[d.type].severe)
    assert.ok(severe.length <= 1,
      `severe disturbances overlap at t=${s.time.toFixed(1)}: ${severe.map((d) => d.type).join(',')}`)
  }
  return log
}
{
  const a = spawnLog(busy(), 11, 180, true)
  const b = spawnLog(busy(), 11, 180, true)
  assert.deepEqual(a, b, 'same seed -> identical disturbance timeline')
  const c = spawnLog(busy(), 12, 180, true)
  assert.notDeepEqual(a, c, 'different seed -> different timeline')
  assert.ok(a.some((e) => e.startsWith('bark@')), 'dog barks on schedule')
  assert.ok(a.some((e) => e.startsWith('car@')), 'cars spawn on schedule')
  assert.ok(a.some((e) => e.startsWith('thunder@')), 'thunder fires during rain')
  const thunders = a.filter((e) => e.startsWith('thunder@')).map((e) => Number(e.split('@')[1]))
  for (let i = 1; i < thunders.length; i++) {
    assert.ok(thunders[i] - thunders[i - 1] >= 20, `thunder cooldown >= 20s (${thunders[i - 1]} -> ${thunders[i]})`)
  }
}
{
  const dry = spawnLog(busy(), 11, 180, false) // weather stays 'clear'
  assert.ok(!dry.some((e) => e.startsWith('thunder@')), 'no thunder without rain')
}
{
  const s = createGameState(busy(), 11)
  runFor(s, 2.5)
  const bark = s.disturbances.find((d) => d.type === 'bark')
  assert.ok(bark !== undefined && bark.pos.x === 1150 && bark.pos.y === 620, 'posless bark spawns at the dog')
}
{
  // night 10: no thunder during the first 2s of settling (brief: no unfair disasters)
  const finale: LevelDef = { ...busy(), night: 10, schedule: [{ type: 'thunder', minGap: 1, maxGap: 1, firstAt: 0.2 }] }
  const s = createGameState(finale, 11)
  setWeather(s, 'rain')
  s.houses[0].sleep = 100
  tick(s, 0.1)
  assert.equal(s.status, 'settling')
  for (let i = 0; i < 18; i++) { // settleProgress stays < 2
    tick(s, 0.1)
    assert.ok(!s.disturbances.some((d) => d.type === 'thunder'),
      `no thunder in first 2s of night-10 settling (t=${s.time.toFixed(1)})`)
  }
}

console.log('check:sim OK')
