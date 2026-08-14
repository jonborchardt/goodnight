# Goodnight, Little Town — Zen Redesign (authoritative addendum)

Date: 2026-08-13
Status: approved (user-approved in session; supersedes conflicting sections of BOTH the design spec and the product brief — where this document speaks, it wins)

## Why

Mid-build user redirect: the scheduler-driven game felt like an action game. The redesign makes it zen and diagnostic — a town you *read and gently tune*, not a wave defense. Approved pillars:

1. **Discovery, not execution.** The player cannot know the right configuration up front. They flip a light / open a window / change weather *during* the night and the affected houses answer with body language within a beat or two. There is no "read the traits, set all switches, win" answer key to execute.
2. **Stall, never drain.** A wrong setting or ambient noise can only stop an awake house's progress, never reverse it. Formally: while `sleep < 100`, net rate clamps to ≥ 0. Asleep houses can still be *woken* by a spike over their personal threshold (existing knockdown-to-60 hysteresis) — that is the only regression in the game.
3. **Telegraphed events only.** No random wakers. The disturbance schedule is deterministic (fixed gaps, `minGap === maxGap`) and upcoming events are visibly telegraphed (see Telegraphs). Event roster per night is small: the car (shhh ritual), distant thunder on rainy nights, authored dog barks on dog nights. Random bark/cans/tv wakers are cut.
4. **The owl is the wildcard.** A persistent perched soft-noise actor. Shhh-ing it (or shhh-ing anything whose circle covers it) flushes it to a *random* new perch from the night's authored perch list — maybe better, maybe worse: a deliberate gamble. Because Shhh is an area, an owl perched near the road can make the car un-shhh-able without also flushing the owl. Sometimes the right play is to leave it be.
5. **Grid of houses.** Levels grow from one front row to 2–3 rows (village-on-a-slope, back rows y-offset higher; same house art, no scaling needed). Adjacency is the puzzle fabric: shared streetlights, road proximity, owl perches, neighbor noise.

## Sim changes (additive or narrow; all under the existing check:sim TDD gate)

The Plan-1 shared contract remains valid except where amended here. Plans after the redesign MAY modify `src/game/` (Plan 1's freeze bound Plan 2 only); every change lands with check:sim assert coverage and must keep the completability gate green.

1. **Stall floor** — in `tick`, for houses with `sleep < 100`: `rate = max(0, rate)`. (Amends the Plan-1 task-3 asserts that expected bark-reverses-progress; those asserts are rewritten to assert the stall floor instead.)
2. **Owl actor**
   - `LevelDef.owl?: { perches: Vec2[]; start: number }` (start = index into perches).
   - `GameState.owl: { perch: number; pos: Vec2; movedAt: number } | null` (contract field; view renders and animates from it).
   - Owl emits a continuous noise source at `pos` with `OWL_LOUDNESS = 8` (same falloff/window/masking pipeline; it can stall close neighbors and can wake a `lightSleeper` next door — that's the puzzle).
   - Relocation: when a Shhh placement/drag transitions to covering `owl.pos`, the owl immediately relocates to a different rng-chosen perch (`movedAt = time` for the view's flight animation). One flush per coverage-transition, not per tick. Deterministic per seed.
3. **Per-house rate exposure** — `HouseState.rate: number`, written every tick (net rate after clamp, 0 for asleep houses). Additive; powers reactive body language in the view without duplicating sim math.
4. **Telegraph exposure** — `GameState.nextAt: number[]` (already exists internally) is promoted to a readable contract field alongside `level.schedule`; the view derives "next car in N s" countdowns from `nextAt[i] - time`.
5. **Scheduler** — unchanged code; levels simply author `minGap === maxGap` (and `firstAt`) for fixed rhythms. Severe cooldown/retry logic stays (harmless with a sparse roster).

Everything else in the sim (noise pipeline, traits, thresholds, settling, weather, windows, lights, car, completability gate) is unchanged.

## View changes

1. **Reactive body language** (`House.tsx` + scene.css): three read states from `hs.rate` + `stageOf`:
   - *filling* (rate > 0.5): current calm art.
   - *stalled* (awake/drowsy/nearly and rate ≈ 0 for ≥ 2 s): restless cues — curtain flick / candle flicker loop. This is the "something here is wrong" signal.
   - *reaction pulse*: when a house's rate visibly improves within ~1 s of a player toggle, a one-shot contented settle pulse (brief window-glow ease); when it worsens, a brief stir. Implemented by watching `rate` deltas in the view (no sim events needed).
   No text, no icons, no meters — the town is the interface.
2. **Owl** (`Owl.tsx`): perched silhouette + soft continuous mini-ripple; on `movedAt` change, CSS flight transition to the new perch. Its ripple marks it as a noise source without alarming.
3. **Telegraphs**: car headlights already precede arrival (CAR_MARGIN); add a soft edge-glow cue ~2 s before a scheduled car/bark/thunder fires (derived from `nextAt`). Subtle — a breath, not an alarm.
4. **Grid layout**: pure level data — back rows at smaller y (e.g. rows at y ≈ 560 / 440 / 330), houses overlap naturally; road with the car stays at the front row (`ROAD_Y`). No scene-code change required beyond render order (paint back rows first — sort houses by `pos.y` ascending when mapping).

## Night arc (replaces both prior tables; same 10-night count, same settle/pacing targets)

| Night | Title / teaches | Grid | New | Notes |
|---|---|---|---|---|
| 1 | A Quiet Start — houses drift; one stalls until you discover its light preference | 3, 1 row | discovery, lights | 1–2 min |
| 2 | The Late Car — road rhythm, hold-shhh ritual | 4, 1 row | car telegraph | ~2 min |
| 3 | Fresh Air — window discovery, quietHouse vs freshAir | 5, 1 row | windows | 2–3 min |
| 4 | Rainy Night — weather as a global tradeoff | 5, 1 row | weather | 2–3 min |
| 5 | The Owl — the gamble; owl + car interference | 5, 1 row | owl | 2–3 min |
| 6 | The Second Row — adjacency conflicts around shared lights | 6, 2 rows | grid | 2–3 min |
| 7 | Storm — rain masks but thunders; stormWorrier | 6, 2 rows | thunder | ~3 min |
| 8 | The Dog — authored telegraphed barks layered with the car | 7, 2 rows | dog barks | ~3 min |
| 9 | Everyone Is Different — full mixed grid, owl + car + weather | 8, 3 rows | combinations | 3–4 min |
| 10 | Goodnight, Little Town — finale; busy open, calming close; extended ending + lone-window joke | 9, 3 rows | everything | 4–5 min |

Difficulty ramps by configuration complexity (houses, conflicting adjacencies, fewer spare resources) — never by event density.

## Unchanged

Win condition/flow/state machine, ending sequence boundary, HUD, title/progress, interaction scheme (tap vs hold), accessibility rules (no color-only signals, playable muted), persistence, audio plan (Plan 5), Pages deploy, Definition of Done checklist (with "no impossible randomness" now trivially true).
