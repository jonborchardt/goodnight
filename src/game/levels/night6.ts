import type { LevelDef } from '../types'

// Night 6 — The Second Row. First two-row grid. Discoveries: sl-front stays
// on (needsLight red-tiny), sl-hill goes off (lovesDark yellow-cottage).
// The hill gate (fixed 20s) creaks between the rows; the car keeps its rhythm.
export const NIGHT6: LevelDef = {
  night: 6,
  title: 'The Second Row',
  hint: 'New neighbors up the hill.',
  settleSeconds: 7,
  weatherOptions: ['clear', 'rain'],
  startWeather: 'clear',
  thunder: false,
  houses: [
    // front row
    { id: 'brick-corner', label: 'Brick Corner House', pos: { x: 300, y: 625 }, color: '#c98a5b', variant: 'tall', traits: ['quietHouse'], hasWindowControl: true, windowStartsOpen: true },
    { id: 'red-tiny', label: 'Tiny Red House', pos: { x: 760, y: 610 }, color: '#c85a54', variant: 'tiny', traits: ['needsLight'], hasWindowControl: false },
    { id: 'blue-tall', label: 'Tall Blue House', pos: { x: 1200, y: 560 }, color: '#5b7fa6', variant: 'tall', traits: [], hasWindowControl: false },
    // second row
    { id: 'yellow-cottage', label: 'Yellow Cottage', pos: { x: 520, y: 460 }, color: '#e9c46a', variant: 'cottage', traits: ['lovesDark'], hasWindowControl: false },
    { id: 'willow-cottage', label: 'Willow Cottage', pos: { x: 980, y: 455 }, color: '#7fa66b', variant: 'cottage', traits: ['rainSleeper'], hasWindowControl: false },
    { id: 'chimney-house', label: 'Chimney House', pos: { x: 1420, y: 450 }, color: '#8f7bb5', variant: 'chimney', traits: ['deepSleeper'], hasWindowControl: false },
  ],
  streetlights: [
    { id: 'sl-front', pos: { x: 820, y: 655 }, startsOn: true }, // keep ON: red-tiny needsLight (75px away)
    { id: 'sl-hill', pos: { x: 440, y: 510 }, startsOn: true },  // turn OFF: yellow-cottage lovesDark (94px away; 335px from red-tiny — no cross-coverage)
  ],
  schedule: [
    { type: 'gate', pos: { x: 700, y: 500 }, minGap: 20, maxGap: 20, firstAt: 9 },
    { type: 'car', minGap: 26, maxGap: 26, firstAt: 15 },
  ],
}
