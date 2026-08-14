import type { LevelDef } from '../types'

// Night 3 — Fresh Air. Windows are tonight's discovery:
//   Farmhouse (freshAir) stalls until its window is opened.
//   Brick Corner (quietHouse, road-adjacent, window open) stalls under every
//   car pass until closed. Lights are pre-set correctly; the car rhythm stays.
export const NIGHT3: LevelDef = {
  night: 3,
  title: 'Fresh Air',
  hint: 'Some windows want to be open. Some really do not.',
  settleSeconds: 5,
  weatherOptions: ['clear'],
  startWeather: 'clear',
  thunder: false,
  houses: [
    { id: 'brick-corner', label: 'Brick Corner House', pos: { x: 280, y: 630 }, color: '#c98a5b', variant: 'tall', traits: ['quietHouse'], hasWindowControl: true, windowStartsOpen: true },
    { id: 'yellow-cottage', label: 'Yellow Cottage', pos: { x: 620, y: 585 }, color: '#e9c46a', variant: 'cottage', traits: ['lovesDark'], hasWindowControl: false },
    { id: 'red-tiny', label: 'Tiny Red House', pos: { x: 900, y: 610 }, color: '#c85a54', variant: 'tiny', traits: ['needsLight'], hasWindowControl: false },
    { id: 'farmhouse', label: 'Farmhouse', pos: { x: 1170, y: 590 }, color: '#ddc9a3', variant: 'farm', traits: ['freshAir'], hasWindowControl: true, windowStartsOpen: false },
    { id: 'blue-tall', label: 'Tall Blue House', pos: { x: 1440, y: 555 }, color: '#5b7fa6', variant: 'tall', traits: [], hasWindowControl: false },
  ],
  streetlights: [
    { id: 'sl-west', pos: { x: 500, y: 655 }, startsOn: false }, // pre-set correct (lovesDark nearby)
    { id: 'sl-mid', pos: { x: 960, y: 655 }, startsOn: true },   // pre-set correct (needsLight red-tiny)
  ],
  schedule: [
    { type: 'car', minGap: 24, maxGap: 24, firstAt: 10 },
  ],
}
