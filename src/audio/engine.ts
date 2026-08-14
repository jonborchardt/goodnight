// src/audio/engine.ts — 100% synthesized Web Audio. No assets, no React.
import type { GameState } from '../game/types';

export type AmbienceSnapshot = {
  weather: GameState['weather'];
  asleepFraction: number; // 0..1, fraction of houses with sleep >= 100
  shhhActive: boolean;
};
export type DisturbanceType = GameState['disturbances'][number]['type'];

const MASTER_LEVEL = 0.35; // global constraint: master <= 0.4 — keep it cozy
const MUTE_KEY = 'goodnight.muted';

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let muted = localStorage.getItem(MUTE_KEY) === 'true';

// ambience graph (built in initAudio)
let ambienceFilter: BiquadFilterNode | null = null; // shhh muffling
let nightGain: GainNode | null = null;
let rainGain: GainNode | null = null;
let windGain: GainNode | null = null;

function noiseBuffer(kind: 'white' | 'brown'): AudioBuffer {
  const c = ctx!;
  const buf = c.createBuffer(1, c.sampleRate * 2, c.sampleRate);
  const data = buf.getChannelData(0);
  let last = 0;
  for (let i = 0; i < data.length; i++) {
    const white = Math.random() * 2 - 1;
    if (kind === 'white') {
      data[i] = white;
    } else {
      last = (last + 0.02 * white) / 1.02; // leaky integrator -> brown noise
      data[i] = last * 3.5;
    }
  }
  return buf;
}

function loopedNoise(kind: 'white' | 'brown'): AudioBufferSourceNode {
  const src = ctx!.createBufferSource();
  src.buffer = noiseBuffer(kind);
  src.loop = true;
  src.start();
  return src;
}

export function isMuted(): boolean {
  return muted;
}

export function setMuted(m: boolean): void {
  muted = m;
  localStorage.setItem(MUTE_KEY, String(m));
  if (ctx && master) {
    master.gain.setTargetAtTime(m ? 0 : MASTER_LEVEL, ctx.currentTime, 0.05);
  }
}

export function initAudio(): void {
  if (ctx) return; // idempotent
  ctx = new AudioContext();
  master = ctx.createGain();
  master.gain.value = muted ? 0 : MASTER_LEVEL;
  master.connect(ctx.destination);
  buildAmbience();
  if (import.meta.env.DEV) {
    (window as any).__audio = { ctx, master, nightGain, rainGain, windGain, ambienceFilter };
  }
}

function buildAmbience(): void {
  const c = ctx!;
  // Shared muffle filter: everything ambient passes through it, then master.
  ambienceFilter = c.createBiquadFilter();
  ambienceFilter.type = 'lowpass';
  ambienceFilter.frequency.value = 18000; // wide open when no shhh
  ambienceFilter.Q.value = 0.5;
  ambienceFilter.connect(master!);

  // Layer 1 — night: very quiet filtered brown noise, always on.
  nightGain = c.createGain();
  nightGain.gain.value = 0; // ramped up by updateAmbience
  const nightFilter = c.createBiquadFilter();
  nightFilter.type = 'lowpass';
  nightFilter.frequency.value = 400;
  nightFilter.Q.value = 0.7;
  loopedNoise('brown').connect(nightFilter);
  nightFilter.connect(nightGain);
  nightGain.connect(ambienceFilter);

  // Layer 2 — rain: band-passed white noise.
  rainGain = c.createGain();
  rainGain.gain.value = 0;
  const rainFilter = c.createBiquadFilter();
  rainFilter.type = 'bandpass';
  rainFilter.frequency.value = 1800;
  rainFilter.Q.value = 0.7;
  loopedNoise('white').connect(rainFilter);
  rainFilter.connect(rainGain);
  rainGain.connect(ambienceFilter);

  // Layer 3 — wind: low-passed white noise, filter slowly modulated by an LFO.
  windGain = c.createGain();
  windGain.gain.value = 0;
  const windFilter = c.createBiquadFilter();
  windFilter.type = 'lowpass';
  windFilter.frequency.value = 300;
  windFilter.Q.value = 1.0;
  const lfo = c.createOscillator();
  lfo.frequency.value = 0.1; // one slow gust cycle per 10 s
  const lfoDepth = c.createGain();
  lfoDepth.gain.value = 150; // filter sweeps 150..450 Hz
  lfo.connect(lfoDepth);
  lfoDepth.connect(windFilter.frequency);
  lfo.start();
  loopedNoise('white').connect(windFilter);
  windFilter.connect(windGain);
  windGain.connect(ambienceFilter);

  scheduleCricket();
}

// Occasional synth cricket blip, routed through nightGain so ducking/mute apply.
function scheduleCricket(): void {
  setTimeout(() => {
    if (ctx && nightGain) {
      const t = ctx.currentTime;
      for (let p = 0; p < 3; p++) {
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = 4400;
        const g = ctx.createGain();
        g.gain.setValueAtTime(0, t + p * 0.06);
        g.gain.linearRampToValueAtTime(0.35, t + p * 0.06 + 0.005); // pre-nightGain level
        g.gain.exponentialRampToValueAtTime(0.001, t + p * 0.06 + 0.03);
        osc.connect(g);
        g.connect(nightGain);
        osc.start(t + p * 0.06);
        osc.stop(t + p * 0.06 + 0.05);
      }
    }
    scheduleCricket();
  }, 4000 + Math.random() * 5000); // every 4–9 s
}

// Called every sim tick (~10 Hz). Cheap: only setTargetAtTime on gains/filter.
export function updateAmbience(s: AmbienceSnapshot): void {
  if (!ctx || !nightGain || !rainGain || !windGain || !ambienceFilter) return;
  const t = ctx.currentTime;
  // "You can hear the town falling asleep": duck ambience as houses sleep.
  const duck = 1 - 0.7 * Math.min(1, Math.max(0, s.asleepFraction));
  nightGain.gain.setTargetAtTime(0.06 * duck, t, 0.3);
  rainGain.gain.setTargetAtTime((s.weather === 'rain' ? 0.14 : 0) * duck, t, 0.5);
  windGain.gain.setTargetAtTime((s.weather === 'wind' ? 0.09 : 0) * duck, t, 0.5);
  // Shhh muffles the world: gentle low-pass while held.
  ambienceFilter.frequency.setTargetAtTime(s.shhhActive ? 700 : 18000, t, 0.15);
}
