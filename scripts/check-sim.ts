import assert from 'node:assert/strict'
import type { GameState, HouseDef, LevelDef, TraitId, Vec2 } from '../src/game/types'
import { stageOf } from '../src/game/types'
import { mulberry32 } from '../src/game/rng'
import {
  createGameState, tick, setShhh, setWeather, toggleLight, toggleWindow,
  SCENE_W, ROAD_Y,
} from '../src/game/sim'

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

console.log('check:sim OK')
