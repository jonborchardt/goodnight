import type { LevelDef } from '../types'

// Night 10 — Goodnight, Little Town. Every rhythm opens inside ~25s
// (deterministic, telegraphed, wide gaps) and the night calms as the town
// sleeps. The Last Lamp House (lovesDark + lightSleeper, window open, own
// light on, owl perched beside it) needs its window closed, its light off,
// the owl flushed, and a shhh through at least one bark — the finale beat.
export const NIGHT10: LevelDef = {
  night: 10,
  title: 'Goodnight, Little Town',
  hint: 'One last night. Everything you have learned.',
  settleSeconds: 10,
  weatherOptions: ['clear', 'rain'],
  startWeather: 'clear',
  thunder: true,
  dog: { pos: { x: 780, y: 668 } },
  owl: {
    perches: [
      { x: 950, y: 520 },   // 0: start — right beside the Last Lamp House
      { x: 420, y: 640 },   // 1: near the road west
      { x: 700, y: 300 },   // 2: third-row tree — mildly bad (near chimney)
      { x: 90, y: 280 },    // 3: far west — safe
      { x: 1540, y: 250 },  // 4: far east — safe
      { x: 1300, y: 420 },  // 5: second row east — mildly bad
    ],
    start: 0,
  },
  houses: [
    // front row
    { id: 'brick-corner', label: 'Brick Corner House', pos: { x: 250, y: 625 }, color: '#c98a5b', variant: 'tall', traits: ['quietHouse'], hasWindowControl: true, windowStartsOpen: true },
    { id: 'red-tiny', label: 'Tiny Red House', pos: { x: 560, y: 610 }, color: '#c85a54', variant: 'tiny', traits: ['needsLight', 'stormWorrier'], hasWindowControl: true, windowStartsOpen: false },
    { id: 'last-lamp', label: 'Last Lamp House', pos: { x: 900, y: 590 }, color: '#e0e3d0', variant: 'cottage', traits: ['lovesDark', 'lightSleeper'], hasWindowControl: true, windowStartsOpen: true },
    { id: 'blue-tall', label: 'Tall Blue House', pos: { x: 1250, y: 560 }, color: '#5b7fa6', variant: 'tall', traits: ['rainSleeper', 'lovesDark'], hasWindowControl: false },
    // second row
    { id: 'yellow-cottage', label: 'Yellow Cottage', pos: { x: 280, y: 455 }, color: '#e9c46a', variant: 'cottage', traits: ['lovesDark'], hasWindowControl: false },
    { id: 'willow-cottage', label: 'Willow Cottage', pos: { x: 800, y: 450 }, color: '#7fa66b', variant: 'cottage', traits: ['rainSleeper'], hasWindowControl: false },
    { id: 'farmhouse', label: 'Farmhouse', pos: { x: 1200, y: 460 }, color: '#ddc9a3', variant: 'farm', traits: ['freshAir'], hasWindowControl: true, windowStartsOpen: false },
    // third row
    { id: 'chimney-house', label: 'Chimney House', pos: { x: 600, y: 345 }, color: '#8f7bb5', variant: 'chimney', traits: ['deepSleeper'], hasWindowControl: false },
    { id: 'gray-gable', label: 'Gray Gable', pos: { x: 1050, y: 340 }, color: '#8d99ae', variant: 'tall', traits: ['lightSleeper'], hasWindowControl: false },
  ],
  streetlights: [
    { id: 'sl-red', pos: { x: 560, y: 655 }, startsOn: true },    // keep ON: red-tiny needsLight (45px; ≥344px from every lovesDark house)
    { id: 'sl-lamp', pos: { x: 960, y: 645 }, startsOn: true },   // turn OFF: last-lamp lovesDark+lightSleeper (81px)
    { id: 'sl-blue', pos: { x: 1310, y: 645 }, startsOn: true },  // turn OFF: blue-tall lovesDark (104px)
    { id: 'sl-hill', pos: { x: 250, y: 500 }, startsOn: true },   // turn OFF: yellow-cottage lovesDark (54px; 329px from red-tiny — no cross-coverage)
  ],
  schedule: [
    { type: 'bark', minGap: 34, maxGap: 34, firstAt: 5 },
    { type: 'car', minGap: 40, maxGap: 40, firstAt: 12 },
    { type: 'gate', pos: { x: 480, y: 500 }, minGap: 45, maxGap: 45, firstAt: 20 },
    { type: 'thunder', minGap: 40, maxGap: 40, firstAt: 30 },
  ],
}
