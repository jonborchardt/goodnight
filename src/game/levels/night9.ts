import type { LevelDef } from '../types'

// Night 9 — Everyone Is Different. Three rows, eight houses, every lever
// live. The owl starts on the hill; two of its five perches are safe.
export const NIGHT9: LevelDef = {
  night: 9,
  title: 'Everyone Is Different',
  hint: 'You know them all by now.',
  settleSeconds: 10,
  weatherOptions: ['clear', 'rain'],
  startWeather: 'clear',
  thunder: false,
  owl: {
    perches: [
      { x: 700, y: 380 },   // 0: start — bothers the second row
      { x: 250, y: 560 },   // 1: over brick-corner (quietHouse) — bad
      { x: 1100, y: 640 },  // 2: near the road — blocks clean car shhh-ing
      { x: 60, y: 300 },    // 3: far west tree — safe
      { x: 1590, y: 200 },  // 4: far east treetop — safe (≈361px from farmhouse: no stall even window-open)
    ],
    start: 0,
  },
  houses: [
    // front row
    { id: 'brick-corner', label: 'Brick Corner House', pos: { x: 280, y: 625 }, color: '#c98a5b', variant: 'tall', traits: ['quietHouse'], hasWindowControl: true, windowStartsOpen: true },
    { id: 'red-tiny', label: 'Tiny Red House', pos: { x: 720, y: 610 }, color: '#c85a54', variant: 'tiny', traits: ['needsLight'], hasWindowControl: false },
    { id: 'blue-tall', label: 'Tall Blue House', pos: { x: 1150, y: 560 }, color: '#5b7fa6', variant: 'tall', traits: ['rainSleeper', 'lovesDark'], hasWindowControl: false },
    // second row
    { id: 'yellow-cottage', label: 'Yellow Cottage', pos: { x: 480, y: 460 }, color: '#e9c46a', variant: 'cottage', traits: ['lovesDark', 'lightSleeper'], hasWindowControl: false },
    { id: 'willow-cottage', label: 'Willow Cottage', pos: { x: 900, y: 455 }, color: '#7fa66b', variant: 'cottage', traits: ['rainSleeper'], hasWindowControl: false },
    { id: 'farmhouse', label: 'Farmhouse', pos: { x: 1340, y: 460 }, color: '#ddc9a3', variant: 'farm', traits: ['freshAir'], hasWindowControl: true, windowStartsOpen: false },
    // third row
    { id: 'chimney-house', label: 'Chimney House', pos: { x: 650, y: 345 }, color: '#8f7bb5', variant: 'chimney', traits: ['deepSleeper'], hasWindowControl: false },
    { id: 'gray-gable', label: 'Gray Gable', pos: { x: 1080, y: 340 }, color: '#8d99ae', variant: 'tall', traits: ['quietHouse'], hasWindowControl: true, windowStartsOpen: true },
  ],
  streetlights: [
    { id: 'sl-red', pos: { x: 780, y: 655 }, startsOn: true },   // keep ON: red-tiny needsLight
    { id: 'sl-blue', pos: { x: 1210, y: 645 }, startsOn: true }, // turn OFF: blue-tall lovesDark
    { id: 'sl-hill', pos: { x: 400, y: 520 }, startsOn: true },  // turn OFF: yellow-cottage lovesDark (100px; 331px from red-tiny — no cross-coverage)
  ],
  schedule: [
    { type: 'car', minGap: 30, maxGap: 30, firstAt: 16 },
    { type: 'gate', pos: { x: 1250, y: 500 }, minGap: 20, maxGap: 20, firstAt: 9 },
  ],
}
