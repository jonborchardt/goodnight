import type { LevelDef } from '../types'

// ponytail: single debug level so the sim compiles and check:sim has a target.
// Plans 3-4 replace this file's content with the 10 authored nights.
const DEBUG_LEVEL: LevelDef = {
  night: 1,
  title: 'Debug Night',
  hint: 'Hold anywhere to shhh. (Temporary debug level.)',
  settleSeconds: 5,
  weatherOptions: ['clear', 'wind', 'rain'],
  startWeather: 'clear',
  thunder: true,
  dog: { pos: { x: 1150, y: 620 } },
  houses: [
    { id: 'h1', label: 'Yellow Cottage', pos: { x: 300, y: 560 }, color: '#e8c96a', variant: 'cottage', traits: ['lovesDark', 'lightSleeper'], hasWindowControl: false },
    { id: 'h2', label: 'Tiny Red House', pos: { x: 620, y: 580 }, color: '#d1685e', variant: 'tiny', traits: ['needsLight'], hasWindowControl: false },
    { id: 'h3', label: 'Blue House', pos: { x: 940, y: 540 }, color: '#6a8fd1', variant: 'tall', traits: ['rainSleeper', 'freshAir'], hasWindowControl: true, windowStartsOpen: true },
    { id: 'h4', label: 'Farmhouse', pos: { x: 1300, y: 560 }, color: '#b8d16a', variant: 'farm', traits: ['deepSleeper', 'quietHouse'], hasWindowControl: true },
  ],
  streetlights: [
    { id: 'l1', pos: { x: 460, y: 600 }, startsOn: true },  // near the lovesDark cottage: turn it off
    { id: 'l2', pos: { x: 700, y: 600 }, startsOn: false }, // near the needsLight house: turn it on
  ],
  schedule: [
    { type: 'bark', minGap: 14, maxGap: 22, firstAt: 6 },          // at the dog
    { type: 'owl', pos: { x: 200, y: 300 }, minGap: 20, maxGap: 35, firstAt: 10 },
    { type: 'car', minGap: 30, maxGap: 45, firstAt: 15 },
    { type: 'thunder', minGap: 25, maxGap: 40, firstAt: 20 },      // only fires if the bot picks rain
  ],
}

export const LEVELS: LevelDef[] = [DEBUG_LEVEL]
