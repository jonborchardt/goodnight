import type { LevelDef } from '../types'

// Night 1 — A Quiet Start. Zero events. Two houses drift off on their own;
// the Yellow Cottage (lovesDark) stalls under its lit streetlight until the
// player experiments. Discovery through body language is the whole lesson.
export const NIGHT1: LevelDef = {
  night: 1,
  title: 'A Quiet Start',
  hint: 'The town is sleepy. If a house tosses and turns, try something.',
  settleSeconds: 5,
  weatherOptions: ['clear'],
  startWeather: 'clear',
  thunder: false,
  houses: [
    { id: 'yellow-cottage', label: 'Yellow Cottage', pos: { x: 380, y: 590 }, color: '#e9c46a', variant: 'cottage', traits: ['lovesDark'], hasWindowControl: false },
    { id: 'red-tiny', label: 'Tiny Red House', pos: { x: 820, y: 610 }, color: '#c85a54', variant: 'tiny', traits: [], hasWindowControl: false },
    { id: 'blue-tall', label: 'Tall Blue House', pos: { x: 1220, y: 560 }, color: '#5b7fa6', variant: 'tall', traits: [], hasWindowControl: false },
  ],
  streetlights: [
    { id: 'sl-west', pos: { x: 500, y: 655 }, startsOn: true }, // 130px from the lovesDark cottage — the night's one discovery
  ],
  schedule: [],
}
