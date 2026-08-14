import type { LevelDef } from '../types'

// Night 8 — The Dog. Two interleaved fixed rhythms: bark 22s (firstAt 8),
// car 30s (firstAt 18). Willow Cottage (lightSleeper) lives beside the dog.
// Mitigations all work: shhh the telegraphed bark, close windows, or rain.
export const NIGHT8: LevelDef = {
  night: 8,
  title: 'The Dog',
  hint: 'The dog barks at nothing, on schedule.',
  settleSeconds: 8,
  weatherOptions: ['clear', 'rain'],
  startWeather: 'clear',
  thunder: false,
  dog: { pos: { x: 860, y: 668 } },
  houses: [
    // front row
    { id: 'brick-corner', label: 'Brick Corner House', pos: { x: 260, y: 625 }, color: '#c98a5b', variant: 'tall', traits: ['quietHouse'], hasWindowControl: true, windowStartsOpen: true },
    { id: 'willow-cottage', label: 'Willow Cottage', pos: { x: 700, y: 605 }, color: '#7fa66b', variant: 'cottage', traits: ['lightSleeper'], hasWindowControl: true, windowStartsOpen: true },
    { id: 'red-tiny', label: 'Tiny Red House', pos: { x: 1060, y: 610 }, color: '#c85a54', variant: 'tiny', traits: ['needsLight'], hasWindowControl: false },
    { id: 'blue-tall', label: 'Tall Blue House', pos: { x: 1380, y: 560 }, color: '#5b7fa6', variant: 'tall', traits: ['rainSleeper'], hasWindowControl: false },
    // second row
    { id: 'yellow-cottage', label: 'Yellow Cottage', pos: { x: 460, y: 460 }, color: '#e9c46a', variant: 'cottage', traits: ['lovesDark'], hasWindowControl: false },
    { id: 'farmhouse', label: 'Farmhouse', pos: { x: 900, y: 450 }, color: '#ddc9a3', variant: 'farm', traits: ['freshAir'], hasWindowControl: true, windowStartsOpen: false },
    { id: 'chimney-house', label: 'Chimney House', pos: { x: 1330, y: 450 }, color: '#8f7bb5', variant: 'chimney', traits: ['deepSleeper'], hasWindowControl: false },
  ],
  streetlights: [
    { id: 'sl-red', pos: { x: 1120, y: 655 }, startsOn: true },  // keep ON: red-tiny needsLight
    { id: 'sl-hill', pos: { x: 500, y: 520 }, startsOn: true },  // turn OFF: yellow-cottage lovesDark
  ],
  schedule: [
    { type: 'bark', minGap: 22, maxGap: 22, firstAt: 8 },
    { type: 'car', minGap: 30, maxGap: 30, firstAt: 18 },
  ],
}
