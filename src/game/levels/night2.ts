import type { LevelDef } from '../types'

// Night 2 — The Late Car. Deterministic rhythm: a car every 26s, firstAt 12.
// Brick Corner (lightSleeper) sits nearest the road; the shhh-the-car ritual
// is the lesson. One lovesDark light discovery keeps hands busy between cars.
export const NIGHT2: LevelDef = {
  night: 2,
  title: 'The Late Car',
  hint: 'Headlights on the road. A held finger hushes them.',
  settleSeconds: 5,
  weatherOptions: ['clear'],
  startWeather: 'clear',
  thunder: false,
  houses: [
    { id: 'brick-corner', label: 'Brick Corner House', pos: { x: 300, y: 625 }, color: '#c98a5b', variant: 'tall', traits: ['lightSleeper'], hasWindowControl: false },
    { id: 'yellow-cottage', label: 'Yellow Cottage', pos: { x: 700, y: 585 }, color: '#e9c46a', variant: 'cottage', traits: ['lovesDark'], hasWindowControl: false },
    { id: 'red-tiny', label: 'Tiny Red House', pos: { x: 1050, y: 610 }, color: '#c85a54', variant: 'tiny', traits: [], hasWindowControl: false },
    { id: 'blue-tall', label: 'Tall Blue House', pos: { x: 1380, y: 560 }, color: '#5b7fa6', variant: 'tall', traits: [], hasWindowControl: false },
  ],
  streetlights: [
    { id: 'sl-west', pos: { x: 820, y: 655 }, startsOn: true }, // near the lovesDark cottage — discovery repeat
  ],
  schedule: [
    { type: 'car', minGap: 26, maxGap: 26, firstAt: 12 },
  ],
}
