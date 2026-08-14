import type { LevelDef } from '../types'

// Night 5 — The Owl. perches[0] starts beside the lightSleeper chimney
// house; perches[1] hangs over the road (blocks clean car shhh-ing);
// perches[2] bothers the willow cottage; perches[3] and [4] are safe trees.
// Flushing is a genuine gamble with 2-in-4 good outcomes.
export const NIGHT5: LevelDef = {
  night: 5,
  title: 'The Owl',
  hint: 'An owl. Shhh it and it moves — somewhere.',
  settleSeconds: 6,
  weatherOptions: ['clear', 'rain'],
  startWeather: 'clear',
  thunder: false,
  owl: {
    perches: [
      { x: 1330, y: 470 },  // 0: beside chimney-house (lightSleeper) — the starting problem
      { x: 800, y: 640 },   // 1: over the road — interferes with car shhh-ing
      { x: 560, y: 520 },   // 2: over willow-cottage — mildly bad
      { x: 120, y: 330 },   // 3: far west tree — safe
      { x: 1540, y: 300 },  // 4: far east tree — safe
    ],
    start: 0,
  },
  houses: [
    { id: 'brick-corner', label: 'Brick Corner House', pos: { x: 280, y: 625 }, color: '#c98a5b', variant: 'tall', traits: ['quietHouse'], hasWindowControl: true, windowStartsOpen: false },
    { id: 'willow-cottage', label: 'Willow Cottage', pos: { x: 620, y: 600 }, color: '#7fa66b', variant: 'cottage', traits: ['rainSleeper'], hasWindowControl: false },
    { id: 'red-tiny', label: 'Tiny Red House', pos: { x: 940, y: 610 }, color: '#c85a54', variant: 'tiny', traits: ['needsLight'], hasWindowControl: false },
    { id: 'farmhouse', label: 'Farmhouse', pos: { x: 1180, y: 595 }, color: '#ddc9a3', variant: 'farm', traits: ['freshAir'], hasWindowControl: true, windowStartsOpen: false },
    { id: 'chimney-house', label: 'Chimney House', pos: { x: 1400, y: 560 }, color: '#8f7bb5', variant: 'chimney', traits: ['lightSleeper'], hasWindowControl: false },
  ],
  streetlights: [
    { id: 'sl-mid', pos: { x: 1000, y: 655 }, startsOn: true }, // pre-set correct (needsLight)
  ],
  schedule: [
    { type: 'car', minGap: 28, maxGap: 28, firstAt: 14 },
  ],
}
