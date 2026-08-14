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

function readMuted(): boolean {
  try {
    return localStorage.getItem(MUTE_KEY) === 'true';
  } catch {
    return false; // storage unavailable — default unmuted, nothing persists
  }
}
let muted = readMuted();

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
  try {
    localStorage.setItem(MUTE_KEY, String(m));
  } catch {
    /* storage unavailable - mute just won't persist */
  }
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
    (window as any).__audio = {
      ctx, master, nightGain, rainGain, windGain, ambienceFilter,
      playEvent, playSleepChime, playGoodnight, updateAmbience,
    };
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

// One sine/saw tone with an attack/decay envelope, optional frequency glide.
function tone(opts: {
  type: OscillatorType; freq: number; freqEnd?: number;
  at: number; attack: number; decay: number; peak: number;
  filter?: { type: BiquadFilterType; freq: number; q: number };
}): void {
  const c = ctx!;
  const osc = c.createOscillator();
  osc.type = opts.type;
  osc.frequency.setValueAtTime(opts.freq, opts.at);
  if (opts.freqEnd !== undefined) {
    osc.frequency.linearRampToValueAtTime(opts.freqEnd, opts.at + opts.attack + opts.decay);
  }
  const g = c.createGain();
  g.gain.setValueAtTime(0, opts.at);
  g.gain.linearRampToValueAtTime(opts.peak, opts.at + opts.attack);
  g.gain.exponentialRampToValueAtTime(0.001, opts.at + opts.attack + opts.decay);
  let head: AudioNode = osc;
  if (opts.filter) {
    const f = c.createBiquadFilter();
    f.type = opts.filter.type;
    f.frequency.value = opts.filter.freq;
    f.Q.value = opts.filter.q;
    head.connect(f);
    head = f;
  }
  head.connect(g);
  g.connect(master!);
  osc.start(opts.at);
  osc.stop(opts.at + opts.attack + opts.decay + 0.05);
}

// A finite noise burst through a filter with an envelope (car, thunder, tv).
function noiseBurst(opts: {
  kind: 'white' | 'brown'; at: number; duration: number;
  filter: { type: BiquadFilterType; freq: number; q: number; freqEnd?: number };
  attack: number; peak: number;
}): { gain: GainNode; filter: BiquadFilterNode } {
  const c = ctx!;
  const src = c.createBufferSource();
  src.buffer = noiseBuffer(opts.kind);
  src.loop = true;
  const f = c.createBiquadFilter();
  f.type = opts.filter.type;
  f.frequency.setValueAtTime(opts.filter.freq, opts.at);
  f.Q.value = opts.filter.q;
  if (opts.filter.freqEnd !== undefined) {
    f.frequency.linearRampToValueAtTime(opts.filter.freqEnd, opts.at + opts.duration / 2);
    f.frequency.linearRampToValueAtTime(opts.filter.freq, opts.at + opts.duration);
  }
  const g = c.createGain();
  g.gain.setValueAtTime(0, opts.at);
  g.gain.linearRampToValueAtTime(opts.peak, opts.at + opts.attack);
  g.gain.exponentialRampToValueAtTime(0.001, opts.at + opts.duration);
  src.connect(f);
  f.connect(g);
  g.connect(master!);
  src.start(opts.at);
  src.stop(opts.at + opts.duration + 0.05);
  return { gain: g, filter: f };
}

export function playEvent(type: DisturbanceType): void {
  if (!ctx || !master) return;
  const t = ctx.currentTime;
  switch (type) {
    case 'bark': // two short filtered saw bursts
      tone({ type: 'sawtooth', freq: 220, at: t, attack: 0.005, decay: 0.12, peak: 0.22,
             filter: { type: 'bandpass', freq: 900, q: 5 } });
      tone({ type: 'sawtooth', freq: 260, at: t + 0.18, attack: 0.005, decay: 0.12, peak: 0.22,
             filter: { type: 'bandpass', freq: 950, q: 5 } });
      break;
    case 'car': // rising-falling filtered noise swell, 2.5 s
      noiseBurst({ kind: 'white', at: t, duration: 2.5, attack: 1.0, peak: 0.15,
                   filter: { type: 'bandpass', freq: 300, q: 1.2, freqEnd: 900 } });
      break;
    case 'thunder': // long decaying brown-noise rumble
      noiseBurst({ kind: 'brown', at: t, duration: 3.5, attack: 0.02, peak: 0.35,
                   filter: { type: 'lowpass', freq: 120, q: 0.7 } });
      break;
    case 'owl': // two soft sine hoots
      tone({ type: 'sine', freq: 340, freqEnd: 320, at: t, attack: 0.03, decay: 0.22, peak: 0.12 });
      tone({ type: 'sine', freq: 300, freqEnd: 280, at: t + 0.35, attack: 0.03, decay: 0.25, peak: 0.12 });
      break;
    case 'cans': { // metallic FM clank, two hits
      for (const [dt, carrierHz] of [[0, 800], [0.15, 650]] as const) {
        const carrier = ctx.createOscillator();
        carrier.type = 'sine';
        carrier.frequency.value = carrierHz;
        const mod = ctx.createOscillator();
        mod.type = 'sine';
        mod.frequency.value = 560; // inharmonic ratio -> metallic
        const modDepth = ctx.createGain();
        modDepth.gain.value = 400; // FM index in Hz
        mod.connect(modDepth);
        modDepth.connect(carrier.frequency);
        const g = ctx.createGain();
        g.gain.setValueAtTime(0, t + dt);
        g.gain.linearRampToValueAtTime(0.2, t + dt + 0.005);
        g.gain.exponentialRampToValueAtTime(0.001, t + dt + 0.4);
        carrier.connect(g);
        g.connect(master);
        mod.start(t + dt); carrier.start(t + dt);
        mod.stop(t + dt + 0.45); carrier.stop(t + dt + 0.45);
      }
      break;
    }
    case 'gate': // slow squeaky sine sweep
      tone({ type: 'sine', freq: 900, freqEnd: 1300, at: t, attack: 0.1, decay: 0.7, peak: 0.08 });
      break;
    case 'tv': { // brief filtered chatter: band-passed noise, amplitude-wobbled
      const { gain } = noiseBurst({ kind: 'white', at: t, duration: 1.2, attack: 0.05, peak: 0.07,
                                    filter: { type: 'bandpass', freq: 1200, q: 2 } });
      const lfo = ctx.createOscillator();
      lfo.frequency.value = 6; // syllable-rate chatter
      const lfoDepth = ctx.createGain();
      lfoDepth.gain.value = 0.03;
      lfo.connect(lfoDepth);
      lfoDepth.connect(gain.gain);
      lfo.start(t);
      lfo.stop(t + 1.2);
      break;
    }
  }
}

// Soft two-note chime when a house reaches asleep. E5 -> B5, very quiet.
export function playSleepChime(): void {
  if (!ctx || !master) return;
  const t = ctx.currentTime;
  tone({ type: 'sine', freq: 659.25, at: t, attack: 0.02, decay: 0.6, peak: 0.08 });
  tone({ type: 'sine', freq: 987.77, at: t + 0.25, attack: 0.02, decay: 0.8, peak: 0.06 });
}

// Tiny resolving three-note motif on level complete: E5 -> D5 -> C5.
export function playGoodnight(): void {
  if (!ctx || !master) return;
  const t = ctx.currentTime;
  tone({ type: 'sine', freq: 659.25, at: t, attack: 0.03, decay: 0.5, peak: 0.09 });
  tone({ type: 'sine', freq: 587.33, at: t + 0.4, attack: 0.03, decay: 0.5, peak: 0.09 });
  tone({ type: 'sine', freq: 523.25, at: t + 0.8, attack: 0.03, decay: 1.5, peak: 0.1 });
}
