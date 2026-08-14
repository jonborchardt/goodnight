import type { LevelDef } from '../types'

// Night 7 — Storm. thunder: true + a deterministic thunder entry (24s while
// raining). Rain swallows the 16s gate for closed windows and blunts it
// elsewhere, and speeds the two rainSleepers, but thunder always re-wakes
// the stormWorriers (red-tiny, willow-cottage) by +15, unconditionally —
// windows can't stop it, only recovery between rumbles. Clear skies are
// slower to settle but spare the worriers the jolt entirely. Both paths
// are solvable.
export const NIGHT7: LevelDef = {
  night: 7,
  title: 'Storm',
  hint: 'Rain drowns the little noises. Storms are another matter.',
  settleSeconds: 8,
  weatherOptions: ['clear', 'rain'],
  startWeather: 'clear',
  thunder: true,
  houses: [
    // front row
    { id: 'brick-corner', label: 'Brick Corner House', pos: { x: 290, y: 625 }, color: '#c98a5b', variant: 'tall', traits: ['quietHouse'], hasWindowControl: true, windowStartsOpen: false },
    { id: 'red-tiny', label: 'Tiny Red House', pos: { x: 820, y: 605 }, color: '#c85a54', variant: 'tiny', traits: ['needsLight', 'stormWorrier'], hasWindowControl: true, windowStartsOpen: true },
    { id: 'farmhouse', label: 'Farmhouse', pos: { x: 1150, y: 595 }, color: '#ddc9a3', variant: 'farm', traits: ['rainSleeper'], hasWindowControl: false },
    // second row
    { id: 'yellow-cottage', label: 'Yellow Cottage', pos: { x: 350, y: 460 }, color: '#e9c46a', variant: 'cottage', traits: ['lovesDark'], hasWindowControl: false },
    { id: 'willow-cottage', label: 'Willow Cottage', pos: { x: 560, y: 455 }, color: '#7fa66b', variant: 'cottage', traits: ['stormWorrier'], hasWindowControl: true, windowStartsOpen: true },
    { id: 'chimney-house', label: 'Chimney House', pos: { x: 1400, y: 455 }, color: '#8f7bb5', variant: 'chimney', traits: ['deepSleeper'], hasWindowControl: false },
  ],
  streetlights: [
    { id: 'sl-red', pos: { x: 880, y: 655 }, startsOn: true },  // keep ON: red-tiny needsLight
    { id: 'sl-hill', pos: { x: 400, y: 520 }, startsOn: true }, // turn OFF: yellow-cottage lovesDark
  ],
  schedule: [
    { type: 'gate', pos: { x: 700, y: 680 }, minGap: 16, maxGap: 16, firstAt: 7 },
    { type: 'thunder', minGap: 24, maxGap: 24, firstAt: 25 },
  ],
}
