import type { LevelDef } from '../types'

// Night 4 — Rainy Night. First weather choice. Deterministic gate creaks
// (every 18s) are fully maskable by rain; two rainSleepers drift much
// faster under it. Clear remains solvable (shhh the gate, sit on the slow
// houses) so the bot and stubborn players are never stuck.
export const NIGHT4: LevelDef = {
  night: 4,
  title: 'Rainy Night',
  hint: 'The sky is a switch too.',
  settleSeconds: 6,
  weatherOptions: ['clear', 'rain'],
  startWeather: 'clear',
  thunder: false,
  houses: [
    { id: 'brick-corner', label: 'Brick Corner House', pos: { x: 290, y: 625 }, color: '#c98a5b', variant: 'tall', traits: ['quietHouse'], hasWindowControl: true, windowStartsOpen: false },
    { id: 'willow-cottage', label: 'Willow Cottage', pos: { x: 610, y: 600 }, color: '#7fa66b', variant: 'cottage', traits: ['rainSleeper'], hasWindowControl: false },
    { id: 'red-tiny', label: 'Tiny Red House', pos: { x: 890, y: 610 }, color: '#c85a54', variant: 'tiny', traits: ['needsLight'], hasWindowControl: false },
    { id: 'farmhouse', label: 'Farmhouse', pos: { x: 1160, y: 590 }, color: '#ddc9a3', variant: 'farm', traits: ['rainSleeper', 'freshAir'], hasWindowControl: true, windowStartsOpen: true },
    { id: 'blue-tall', label: 'Tall Blue House', pos: { x: 1430, y: 555 }, color: '#5b7fa6', variant: 'tall', traits: [], hasWindowControl: false },
  ],
  streetlights: [
    { id: 'sl-mid', pos: { x: 950, y: 655 }, startsOn: true }, // pre-set correct (needsLight)
  ],
  schedule: [
    { type: 'gate', pos: { x: 740, y: 680 }, minGap: 18, maxGap: 18, firstAt: 8 },
    { type: 'car', minGap: 30, maxGap: 30, firstAt: 20 },
  ],
}
