# Goodnight, Little Town — Design Spec

Date: 2026-08-13
Status: approved
Product brief: [2026-08-13-goodnight-little-town-product-brief.md](2026-08-13-goodnight-little-town-product-brief.md) — the authoritative game design. This spec covers the technical design and condenses the brief's requirements for implementation. Where they conflict, the brief wins.

## Summary

A cozy browser game: help every house in a tiny illustrated town fall asleep, then keep the town asleep through a settling period. 10 authored nights, 20–30 minutes for a first playthrough. Ships on GitHub Pages.

Stack (already scaffolded): TypeScript, React, MUI, Vite, npm. SVG scene (no canvas), synthesized Web Audio (no asset files), localStorage progress, responsive/mobile via pointer events and a scaled viewBox. No routing, no state library, no test framework.

## Architecture

Pure sim core + React view.

- `src/game/` — plain TypeScript, zero React imports. A `GameState` object and `tick(state, dt)` that advances it. Deterministic given its RNG; runnable headless for balance checks.
- Fixed ~10 Hz sim tick driven by `requestAnimationFrame` with an accumulator. React re-renders the scene from state each tick; visual smoothness comes from CSS transitions on SVG elements, not tick rate.
- `src/scene/` — SVG components (`TownScene`, `House`, `Streetlight`, `Dog`, `Car`, `Sky`, `RainLayer`, `Ripple`...). One `<svg>` with viewBox ≈ 1600×900, scaled to fit any screen.
- `src/ui/` — MUI shell: title screen, HUD (night number, weather toggle, restart, mute), transition overlays.
- `src/audio/` — Web Audio module, built last.
- `src/game/levels/` — one data file per night.

## Sim model

### House sleep

Each house has hidden `sleep` 0–100. Per tick:

```
Δsleep = baseRate
       + preference bonuses (satisfied likes)
       + calm bonus (inside Shhh field)
       - effectiveNoise at house
       - disliked-condition penalties
```

Four visual stages by threshold — awake (<40), drowsy (40–75), nearly asleep (75–99), asleep (100) — communicated entirely through the house art: window brightness, movement, a final small light, dark windows + zzz. No visible meters.

Hysteresis: an asleep house wakes only when a noise/condition spike exceeds its personal wake threshold (Deep Sleeper high, Light Sleeper low). Waking knocks `sleep` down partway (e.g. to ~60), never to zero. Waking must be visually obvious.

### Noise pipeline

Every disturbance is a point source with position, loudness, duration. For each house:

```
noise = Σ sources: loudness × distanceFalloff × windowFactor × shhhFactor
effectiveNoise = max(0, noise − maskingFloor)
```

- `windowFactor`: open window ≈ 1.0, closed ≈ 0.4.
- `shhhFactor`: source inside the Shhh circle is strongly attenuated (≈ 0.2).
- `maskingFloor`: ambient white noise from rain/wind. This single pipeline makes rain, windows, Shhh, and distance compose, per the brief.

Disturbances render as expanding ripple circles so the player sees which houses are affected; masked/shhh'd disturbances render smaller ripples.

### Preferences

Houses carry 1–3 trait tags from the brief's archetypes: `deepSleeper`, `lightSleeper`, `needsLight`, `lovesDark`, `rainSleeper`, `stormWorrier`, `freshAir`, `quietHouse`. Each tag is a small modifier function of the environment (streetlight proximity/state, weather, window state, noise). No per-house bespoke code; personality = tags + position + art variant.

### Environment

- Streetlights: per-light on/off toggles, influence nearby houses by distance.
- Weather: global state from the level's allowed set — `clear`, `wind`, `rain` (nights 7+ rain can produce occasional thunder: a strong, brief, global-ish disturbance with cooldown).
- Windows: per-house open/closed toggle where the level defines one.

### Shhh

While the pointer is held, a fixed-radius circle at the pointer position: attenuates noise sources inside it, adds a calm bonus to houses inside it. Radius deliberately covers only a fraction of the town. Presentation: soft translucent circle, slowed particles, muffled audio — gentle, not a weapon.

### Disturbance scheduler

Levels author recurring event types (dog bark, car, owl, cans, etc.) with intervals and bounded jitter. A global cooldown prevents two severe disturbances from overlapping. Randomness never invalidates good play; the game must always be recoverable.

## Levels

One data file per night: houses (position, palette/shape variant, traits, optional window), streetlights, allowed weather, disturbance schedule, settle duration, one-line hint text shown at night start (the entire tutorial system).

The 10 nights implement the brief's arc exactly:

| Night | Teaches / theme | Houses | New | Settle | Target |
|---|---|---|---|---|---|
| 1 Shhh | core loop, noise vs quiet | 4 | Shhh only | 5s | 1–2 min |
| 2 The Streetlight | local controls; one house needs its light ON | 5 | streetlights | 5s | ~2 min |
| 3 Different Sleepers | houses differ; no one perfect condition | 5–6 | mixed prefs | 5s | 2–3 min |
| 4 Rainy Night | rain as white-noise tradeoff | 5–6 | weather (clear/rain) | 6s | 2–3 min |
| 5 Open the Window | local weather/noise exposure | 6 | windows | 6s | 2–3 min |
| 6 The Dog | persistent spatial disturbance, multiple solutions | 6–7 | the dog | 7s | 2–3 min |
| 7 Storm | dynamic tradeoff: rain helps but thunders | 6–7 | thunder | 8s | ~3 min |
| 8 The Late Car | anticipation; visible approach | 7 | scheduled cars | 8s | ~3 min |
| 9 Everyone Is Different | systemic mastery, multiple solutions | 7–9 | combinations | 10s | 3–4 min |
| 10 Goodnight, Little Town | finale; chaotic open, calming close | 8–10 | everything | 10s | 4–5 min |

## Win condition & flow

State machine: `title → playing → settling → complete → next night` (night 10 → extended ending).

- Settling starts when all houses are asleep; shown diegetically (stars brighten, a ring fills around the moon). Any house waking cancels it; restore quiet and it restarts.
- Complete: windows dark, sounds soften, Shhh disabled, "**Goodnight.**" — 2–4 s of the scene breathing, then next night.
- Night 10 ending: dog curls up, traffic gone, stars prominent, "**Goodnight, Little Town.** / Everyone is finally asleep." Then the small joke: after a few quiet seconds one tiny upstairs light clicks on, pause, clicks off.
- Title screen: Continue + row of night numbers up to highest reached. Restart-night button always available in HUD.

## Interaction

Pointer events only (mouse and touch identical).

- Press-and-hold = Shhh at the pointer.
- Quick tap (<~250 ms) on a streetlight or window = toggle; longer press = Shhh.
- Oversized invisible hit-rects for generous touch targets.
- HUD (MUI, minimal): night number, weather toggle-button group (icon per state, only when the level allows weather), restart, mute.

Accessibility per the brief: no color-only or audio-only signals; the game must be fully playable muted; no fast precision clicking required.

## Persistence

`localStorage["goodnight.progress"] = { highestNight: number }`. Nothing else.

## Audio (built last)

Web Audio, all synthesized: looping filtered noise for ambience/rain/wind; short envelopes for bark, car, thunder, squeaks; soft chime on sleep. Master gain + mute persisted. Soundscape thins as houses sleep. Gameplay must never depend on audio.

## Build order

Per the brief's priority list: sim core → Shhh → house stages/art → Night 1 end-to-end → streetlights (N2) → prefs (N3) → weather (N4) → windows (N5) → dog (N6) → thunder (N7) → cars (N8) → N9–10 authoring → ending → audio → polish. A visually simple complete game beats a polished prototype.

## Testing

No test framework (user's call). Verification is playtesting:

- **Playwright MCP loop**: run `npm run dev`, drive the game in a real browser via the Playwright MCP server (available in this environment) — click streetlights, hold-to-Shhh via pointer events, screenshot house states, play each night to completion. This is the iterate-balance-verify loop during development.
- A headless sanity check may run the pure sim (`tick`) to confirm each authored level is completable and stays recoverable, since the core is React-free.
- Before calling it done: one realistic full first-time-style playthrough of all 10 nights against the brief's Definition of Done checklist (understandability, 20+ min duration, no tedious waiting, no impossible randomness, finale feels final).

## Out of scope

Everything on the brief's scope-discipline list: no building, resources, characters, inventory, dialogue, procedural towns, currencies, achievements, accounts, physics. No scores, lives, or failure screens. No routing, Redux, canvas, or image/audio asset files.
