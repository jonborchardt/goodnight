# Build: Goodnight, Little Town

> **⚠️ PARTIALLY SUPERSEDED (2026-08-13):** a mid-build user redirect replaced the action-leaning parts of this design. [2026-08-13-zen-redesign.md](2026-08-13-zen-redesign.md) is now the top authority: discovery-based play (no readable answer key), stall-never-drain, telegraphed-only deterministic events, the owl gamble actor, grid-of-houses layouts, and a revised night arc. Where this brief conflicts with the addendum, the addendum wins.

I want you to design and implement a complete small game called **Goodnight, Little Town**.

I will provide the technical constraints, framework, repository details, and implementation requirements separately. This prompt defines the **game itself**, especially the player experience, core mechanics, level progression, pacing, feedback, and definition of done.

Treat the game design below as the product specification. You can improve small details when necessary to make the game more fun, legible, or cohesive, but do not substantially expand the scope.

The goal is a **small, polished, charming game that can realistically be built quickly**, not a large simulation.

The final game should feel like a complete experience rather than a mechanics demo.

A first-time player should take roughly **20 to 30 minutes** to complete all 10 levels.

---

# High-Level Concept

The player is watching over a tiny town at night.

Their goal is simple:

> **Help every little house fall asleep, then keep the entire town asleep long enough for the night to settle.**

The town is represented as a small illustrated nighttime scene containing a handful of houses, roads, streetlights, trees, clouds, animals, and other environmental objects.

Each house contains unseen residents with slightly different sleeping preferences.

Some houses sleep easily in darkness.

Some need a nearby streetlight.

Some enjoy rain.

Some need silence.

Some like an open window and cool air.

Some are easily disturbed by barking dogs, cars, thunder, wind, or nearby activity.

The player does not directly control the people inside the houses.

Instead, the player **creates the conditions in which the town can sleep.**

That distinction is central to the game.

The player should gradually learn the personality of the town through observation.

---

# Core Emotional Target

The game should feel:

* cozy
* quiet
* slightly funny
* gently strategic
* satisfying rather than stressful
* increasingly systemic
* visually understandable without much text

The central satisfaction comes from watching a noisy, glowing town slowly become dark and peaceful.

The most important emotional moment is the transition from:

> several lights on, noises happening, player scrambling around

to:

> one last house...

to:

> click

to:

> every window dark, the sounds fade, stars appear, and the entire town is asleep.

That moment should feel rewarding every level.

---

# Core Gameplay Loop

Every level follows the same basic loop.

1. The level begins with several houses awake.
2. The player observes what is preventing them from sleeping.
3. The player manipulates the environment.
4. Houses gradually become sleepier when their conditions are favorable.
5. Houses can wake back up when conditions become unfavorable or disturbances occur.
6. The player eventually gets every house asleep simultaneously.
7. The player must then maintain that state for a short period.
8. The level completes with a peaceful visual/audio payoff.
9. The next night begins.

The player should be **actively doing something throughout the level**, but the game should never become frantic twitch gameplay.

The primary challenge is understanding and managing a small interconnected system.

---

# House State

Every house has a hidden sleep value from roughly:

`0 = fully awake`

to:

`100 = asleep`

The exact numeric implementation is not important to the player.

The player should never need to see a numerical sleep meter unless there is a compelling visual reason.

Instead, communicate state through the house itself.

Possible stages:

### Fully awake

* bright windows
* obvious movement or sound
* maybe curtains moving
* perhaps a tiny silhouette

### Getting sleepy

* light becomes dimmer
* movement slows
* sound gets quieter

### Nearly asleep

* one small light remains
* gentle visual indication

### Asleep

* windows go dark
* perhaps a tiny `zzz`
* chimney smoke or other motion becomes calm
* house becomes visually quiet

A house that wakes should do so clearly enough that the player notices.

---

# The Primary Mechanic: Shhh

The player's first and most important ability is a **quieting field**.

The player presses/holds or otherwise activates a circular region around the pointer or touch location.

While the field is active:

* noises inside the field are reduced
* disturbances have less effect
* houses inside the field become calmer
* appropriate houses gain sleepiness

Visually, this should feel like gently pressing quietness onto part of the town.

Possible presentation:

* subtle translucent circle
* soft vignette
* particles slowing
* sound becoming muffled
* grass/tree movement reducing slightly

Do not make this feel like a weapon, spell attack, or force field.

It is effectively the player saying:

> **Shhhhhhh.**

The field should be intentionally too small to cover the entire town.

That forces the player to decide where their attention is most useful.

---

# Disturbances

The town periodically generates disturbances.

Examples:

* barking dog
* passing car
* motorcycle
* owl
* garbage cans falling
* crying baby
* television
* wind gust
* thunder
* squeaky gate
* cat knocking something over

Disturbances should be visible in the world.

When appropriate, noise should travel outward as subtle visible ripples so the player understands which houses are affected.

Do not overwhelm the player with disturbances.

They are there to create motion, timing, and small crises.

The game should remain cozy.

---

# Environmental Mechanics

Environmental systems should be introduced gradually across the 10 levels.

Do not give the player everything immediately.

Each new system should initially be extremely easy to understand.

The final few levels combine systems introduced earlier.

---

# Streetlights

Individual streetlights can be switched on and off.

Streetlights influence nearby houses rather than the whole map.

Different houses may have different preferences.

Examples:

* one house wants total darkness
* another contains a child who prefers a nearby light
* another is indifferent

The player should infer these preferences primarily from reaction.

Example:

The player switches off a streetlight.

One nearby house quickly becomes sleepier.

Another house suddenly turns its bedroom light back on.

The player should think:

> Oh. That house wants the streetlight.

This discovery process is important.

Do not simply present the player with a large list of explicit attributes.

---

# Weather / Ambient Sound

The player eventually gains limited influence over the nighttime weather or ambient conditions.

Keep this very small.

For example:

* Clear
* Wind
* Rain

Weather affects the town globally.

Rain can behave partly like white noise.

For example:

* rain masks intermittent small noises
* some houses sleep better during rain
* some houses dislike rain
* thunder can occasionally accompany heavier weather
* open windows make rain/noise more noticeable

The goal is not realistic weather simulation.

Weather is another understandable lever in the sleep puzzle.

---

# Silence vs White Noise

Not every house should prefer pure silence.

Some houses sleep best with:

* complete quiet
* rain
* gentle wind
* another constant ambient sound

Constant noise can partially mask sudden disturbances.

This should create interesting decisions.

Example:

Rain may make four houses easier to keep asleep because it masks the dog and traffic.

But one house hates storms.

Therefore:

> rain is neither universally good nor universally bad.

That is the kind of simple systemic interaction we want.

---

# Windows

Later levels introduce windows that can be opened or closed.

Each house should have at most one relevant window control.

Open windows generally mean:

* cooler
* more outside noise
* more exposure to rain/wind

Closed windows generally mean:

* warmer
* quieter
* less weather exposure

Again, avoid making this a detailed temperature simulation.

Windows are simply another local environmental lever.

---

# House Preferences

Every house should have a small personality.

However, keep the underlying model extremely simple.

A house should generally care about only **one or two major things**.

Examples:

### Yellow Cottage

Likes:

* darkness
* quiet

Hates:

* barking

### Blue House

Likes:

* rain
* cool air

Hates:

* nearby streetlight

### Tiny Red House

Likes:

* streetlight on

Hates:

* thunder

### Farmhouse

Likes:

* open window
* gentle wind

Hates:

* traffic

Do not turn this into a complex Sims-style needs system.

The charm comes from each house having just enough personality that the player starts recognizing it.

---

# Teaching Through Reaction

Whenever possible, teach through **cause and effect**, not instructional text.

Example:

Player turns off the streetlight.

The nearby yellow house visibly relaxes and begins dimming.

The blue house's bedroom light suddenly comes back on.

That interaction teaches more effectively than:

> Blue House prefers Light: +2.

The game should encourage the player to say:

> "Oh, THAT house likes the rain."

or:

> "I need to leave that light on."

This feeling of learning the town is one of the central rewards.

---

# Level Structure

Build **10 distinct levels/nights**.

The entire experience should take a typical new player **at least 20 minutes**, ideally around 20 to 30 minutes.

That means levels should average roughly 2 to 3 minutes, with early tutorial levels somewhat shorter and later levels longer.

Do not artificially pad the game with long timers.

Duration should come from:

* observation
* experimentation
* discovering preferences
* managing disturbances
* coordinating multiple systems

Each level should feel meaningfully different.

---

# Night 1: Shhh

## Purpose

Teach the fundamental loop.

## Town

Approximately 4 houses.

## Mechanics

Only:

* house sleep
* simple noise disturbances
* player's Shhh field

Use only one or two disturbance types.

For example:

* dog barking
* occasional car

## Difficulty

Very easy.

The player should discover the controls almost immediately.

## Desired experience

The player learns:

> Noise keeps houses awake.

> Quiet helps them fall asleep.

## Completion

All houses asleep simultaneously.

Maintain the entire town asleep for approximately **5 seconds**.

Then finish the level.

Target playtime:

**1 to 2 minutes.**

---

# Night 2: The Streetlight

## Purpose

Introduce local environmental controls.

## Town

Approximately 5 houses.

Add 2 or 3 streetlights.

## New mechanic

Streetlights toggle on/off.

Most houses prefer darkness.

At least one house prefers having a nearby streetlight on.

Make this preference obvious through reaction.

## Puzzle

The player initially assumes turning every light off is correct.

Then discovers one particular house will not settle unless its nearby streetlight remains on.

## Disturbances

Keep disturbances simple.

## Target playtime

**2 minutes.**

---

# Night 3: Different Sleepers

## Purpose

Teach that houses have individual preferences.

## Town

5 or 6 houses.

## Mechanics

* Shhh
* streetlights
* several different house preferences

Some houses should respond differently to the same environment.

Introduce at most two preference dimensions.

Do not yet introduce weather or windows.

## Player realization

The intended realization is:

> There isn't one perfect condition for the whole town.

## Target playtime

**2 to 3 minutes.**

---

# Night 4: Rainy Night

## Purpose

Introduce weather and white noise.

## New mechanic

Weather control:

* clear
* rain

Optionally gentle wind if implementation is trivial, but two states are enough.

## Behavior

Rain:

* provides constant ambient sound
* masks some small disturbances
* helps several houses
* annoys at least one house

## Puzzle

The player should initially see rain as either helpful or harmful, then discover it creates a tradeoff.

Perhaps rain makes traffic nearly irrelevant but causes one sensitive house to stay awake.

The player may need to use Shhh strategically near that house while benefiting from rain elsewhere.

## Target playtime

**2 to 3 minutes.**

---

# Night 5: Open the Window

## Purpose

Introduce windows.

## New mechanic

Several houses have windows that can be toggled open/closed.

## Effects

Open:

* cooler
* more outside sound/weather

Closed:

* quieter
* warmer

Do not introduce visible temperature numbers.

Communicate reactions through the houses.

## Example puzzle

One house likes rain but only when its window is open.

Another house beside the road must keep its window closed because traffic wakes it.

## Target playtime

**2 to 3 minutes.**

---

# Night 6: The Dog

## Purpose

Introduce a persistent spatial disturbance.

## Town

6 or 7 houses.

There is a dog positioned somewhere in the town.

The dog occasionally barks.

Its sound primarily affects nearby houses.

The player cannot permanently remove the dog.

Instead they must manage its impact.

Possibilities:

* use Shhh when it barks
* use rain to mask it
* close windows near it
* arrange lighting/weather so nearby houses are already deeply asleep

This level should demonstrate that multiple mechanics can solve the same problem.

There should not necessarily be one exact solution.

## Target playtime

**2 to 3 minutes.**

---

# Night 7: Storm

## Purpose

Create the first level that feels meaningfully dynamic.

## Mechanics

All previous mechanics.

Weather now includes occasional thunder.

Thunder produces a strong temporary disturbance.

Some houses are particularly sensitive to thunder.

Rain remains useful as white noise, creating a tradeoff:

> Rain is helping with ordinary noise, but it occasionally creates thunder.

The player should have to prepare houses rather than simply react after every event.

## Desired feeling

This is the first night where the player feels:

> I understand this town well enough to manage it.

## Target playtime

**3 minutes.**

---

# Night 8: The Late Car

## Purpose

Introduce timing and anticipation.

Cars periodically travel along the road.

Their noise affects houses based on distance and whether windows are open.

The player can see or hear a car approaching shortly before it reaches the houses.

This should create a small anticipatory moment:

> Close that window.

> Shhh the corner house.

> Here comes the car...

> okay, nobody woke up.

This is important because it makes the town feel alive without requiring complex simulation.

## Target playtime

**3 minutes.**

---

# Night 9: Everyone Is Different

## Purpose

Create the strongest systemic puzzle.

## Town

7 to 9 houses.

Each house should have a clear small personality.

Use combinations of:

* streetlight preference
* rain preference
* open/closed window preference
* sensitivity to dog
* sensitivity to traffic
* sensitivity to thunder

Do not give any house more than two or three relevant traits.

The challenge should come from interactions between houses, not from remembering a huge ruleset.

There should be multiple plausible ways to get the town asleep.

The player should feel like they have learned how the systems interact.

## Target playtime

**3 to 4 minutes.**

---

# Night 10: Goodnight, Little Town

This should feel like a finale rather than merely another random level.

## Town

Use the most visually complete version of the town.

Approximately 8 to 10 houses.

Bring back recognizable elements from previous nights:

* dog
* streetlights
* road
* rain
* windows
* thunder
* individual house personalities

The opening state should look somewhat chaotic:

* several lights on
* perhaps a car moving
* dog barking
* weather changing
* multiple houses struggling to settle

But the level must remain solvable without demanding perfect reflexes.

The player should progressively stabilize the town.

As more houses fall asleep, the level should itself feel calmer.

Reduce activity.

Reduce sound.

Make every remaining awake house increasingly noticeable.

Eventually there should be one last stubborn house.

The player solves its problem.

The final window goes dark.

Now require the player to maintain **the entire town asleep for roughly 10 seconds**.

During these 10 seconds:

* do not suddenly introduce unfair random disasters
* perhaps one minor disturbance occurs that the player can handle
* otherwise allow the player to experience the quiet

Then trigger the ending.

## Target playtime

**4 to 5 minutes.**

---

# Winning a Level

A level is not won the instant the final house falls asleep.

The town must remain fully asleep for a short **settling period**.

Early levels:

approximately 5 seconds.

Later levels:

approximately 8 to 10 seconds.

The player should clearly understand that the town is almost settled.

Consider representing this diegetically rather than with a giant progress bar.

Examples:

* moon slowly rising
* stars gradually appearing
* ambient music fading
* a subtle ring filling around the moon
* fireflies appearing
* sky becoming deeper blue

If the house wakes up during the settling period, the town is no longer settled and the player must restore quiet.

Do not punish the player excessively.

---

# Level Completion Sequence

Every level should have a satisfying pause after completion.

When the town successfully settles:

1. All windows are dark.
2. Environmental sounds become soft.
3. Stars brighten.
4. The Shhh effect disappears.
5. Perhaps a few little `zzz` indicators appear.
6. The moon or night sky gets a subtle visual payoff.
7. Display something minimal like:

> **Goodnight.**

Then transition to the next night.

Do not immediately yank the player into another level.

Allow roughly 2 to 4 seconds for the completed scene to breathe.

---

# Final Ending

Night 10 should have a slightly larger version of the level-complete sequence.

Once the entire town has remained asleep long enough:

* every window stays dark
* traffic disappears
* dog curls up and sleeps
* rain or wind becomes gentle
* stars become prominent
* moon reaches its final position
* music resolves
* perhaps tiny chimney smoke continues drifting

Show:

> **Goodnight, Little Town.**

Then perhaps:

> Everyone is finally asleep.

A very small joke is acceptable afterward.

For example, after several peaceful seconds:

A single tiny upstairs light clicks on.

Pause.

Then it clicks back off.

Do not undermine the emotional ending with a large joke.

---

# Difficulty Philosophy

This should not be a punishing game.

There is no need for:

* lives
* health
* hard failure screens
* scores
* stars
* combat
* currency
* upgrades
* complicated tutorials

If the town wakes back up, that is simply part of playing.

The challenge comes from managing the environment.

The player should rarely feel that they have "failed."

They should instead think:

> Ah, I see what happened.

Then try something different.

---

# Randomness

Use randomness sparingly.

Disturbances can have some timing variation.

However:

* the game must always remain solvable
* random events should not invalidate good player decisions
* avoid multiple severe disturbances firing simultaneously
* do not make the player wait indefinitely for favorable randomness

Prefer **controlled unpredictability**.

Randomness should make the town feel alive, not make the puzzle arbitrary.

---

# Visual Communication

The player should understand most things by looking at the scene.

Important state changes need clear visual feedback.

Examples:

When a house dislikes something:

* window brightens
* curtain moves
* tiny irritated motion
* sleep progression reverses

When a house likes something:

* light dims
* movement slows
* perhaps a tiny yawn/zzz

When noise travels:

* subtle circular ripple

When Shhh suppresses noise:

* ripple fades or slows

When rain masks noise:

* smaller disturbance ripple

Use animation wherever cheap and effective.

Simple scale, opacity, translation, particles, and sprite state changes are enough.

Do not create animation complexity merely for polish.

---

# Audio

If audio is feasible, it is disproportionately valuable for this game.

Prioritize:

* quiet nighttime ambience
* dog bark
* car passing
* rain
* wind
* thunder
* subtle house noises
* satisfying silence when houses sleep

The soundscape should progressively simplify as the player succeeds.

The player should almost be able to **hear the town falling asleep.**

If full audio production would threaten completion, use simple generated or synthesized sounds.

Do not sacrifice core gameplay for audio.

---

# UI

Keep conventional UI extremely minimal.

Ideally most interactions happen directly with objects in the town.

Examples:

Click:

* streetlight
* window
* weather object/control

Hold:

* Shhh

Avoid a large HUD.

It is acceptable to have:

* level/night number
* tiny weather selector
* restart button
* mute button

But the world itself should communicate most game state.

---

# Tutorialization

Do not begin with a large instruction modal.

Teach each new mechanic with:

1. a very short instruction
2. an obvious situation requiring that mechanic
3. immediate visual feedback

Example:

Night 2 begins.

Text briefly says:

> **Click a streetlight to turn it off.**

One house visibly struggles under a bright streetlight.

The player clicks it.

The house relaxes.

Done.

No multi-page tutorial.

---

# Pacing

Target approximate total first-play duration:

* Night 1: 1-2 min
* Night 2: ~2 min
* Night 3: 2-3 min
* Night 4: 2-3 min
* Night 5: 2-3 min
* Night 6: 2-3 min
* Night 7: ~3 min
* Night 8: ~3 min
* Night 9: 3-4 min
* Night 10: 4-5 min

A skilled replay may be considerably shorter.

That is fine.

Do not create arbitrary waits solely to hit the duration target.

---

# Scope Discipline

This project succeeds by being **small and finished**.

Do NOT expand it into:

* city building
* resource management
* character simulation
* inventory
* dialogue trees
* procedural towns
* progression currencies
* upgrade trees
* achievements
* online systems
* user accounts
* complex physics
* elaborate narrative sequences

If a feature does not directly improve:

> observing the town → changing its environment → helping houses sleep

it probably does not belong.

---

# Implementation Philosophy

Prefer simple systems that combine well.

A few composable variables are better than dozens of bespoke scripted interactions.

The game should broadly behave like:

```text
House sleep tendency =
    base sleepiness
  + preferred environmental conditions
  + quiet
  + helpful ambient sound
  - nearby disturbances
  - disliked environmental conditions
```

The exact implementation can differ.

The important property is that systems compose.

Rain should interact naturally with:

* windows
* noise
* house preferences

Streetlights should interact naturally with:

* distance
* house preferences

Noise should interact naturally with:

* distance
* windows
* Shhh
* rain/white noise

This allows a small amount of code/content to create many interesting situations.

---

# House Personality Design

Create a reusable set of house personality archetypes.

Examples:

### Deep Sleeper

Very forgiving once asleep.

### Light Sleeper

Easily disturbed by sudden sounds.

### Needs a Night Light

Prefers nearby streetlight on.

### Loves Darkness

Strongly dislikes streetlights.

### Rain Sleeper

Sleeps better during rain.

### Storm Worrier

Rain is okay but thunder wakes them.

### Fresh Air

Likes an open window.

### Quiet House

Needs window closed and low noise.

Reuse and combine these across levels.

Do not expose these as RPG-style classes.

They are internal design concepts.

---

# Make Houses Memorable

Where possible, make houses visually distinct enough that players recognize them across a level.

Examples:

* tiny red cottage
* tall blue house
* yellow farmhouse
* house with chimney
* house beside giant tree
* house near dog
* corner house

This allows the player to form spatial memories:

> The little blue house needs the light.

That is much better than:

> House #6 has preference A.

---

# Restart / Recovery

The player should always be able to recover.

Include an easy restart-level action.

But the game should rarely require restarting.

Avoid states where the player can permanently make a level impossible.

---

# Accessibility / Clarity

Do not rely exclusively on:

* color
* audio
* tiny text

Important state changes should have multiple cues when practical.

The game should remain understandable when muted.

The interaction targets should be generous.

Avoid requiring fast precision clicking.

---

# Required Complete Experience

Do not stop once the first mechanic works.

The deliverable is a **complete 10-night game**.

A completed implementation must contain:

* title/start state
* all 10 playable levels
* Shhh mechanic
* sleeping/waking houses
* disturbances
* streetlights
* weather / ambient sound mechanic
* windows
* house preferences
* increasing systemic interaction
* clear level win condition
* settling period
* level transitions
* final ending
* restart capability
* enough visual/audio feedback to understand the systems
* enough balancing that a first-time playthrough reasonably takes 20+ minutes

---

# Definition of Done

Do not consider the game complete merely because all features technically exist.

It is done when all of the following are true.

## Complete loop

A player can:

**start → learn → play Nights 1-10 → complete the final night → see the ending**

without developer intervention.

## Understandable

A new player can understand:

* which houses are awake
* which houses are asleep
* when something woke a house
* what the Shhh mechanic does
* what environmental controls can be manipulated
* when the entire town is close to winning
* when a level has been completed

without reading extensive instructions.

## 10 meaningful levels

There are actually 10 authored experiences.

They cannot simply be the same randomly generated level with more houses.

Each night introduces, explores, combines, or culminates mechanics in a deliberate way.

## Progression works

The complexity curve feels approximately like:

```text
Night 1
one mechanic

Night 2-3
learn local preferences

Night 4-5
add environmental systems

Night 6-8
combine systems and disturbances

Night 9
systemic mastery

Night 10
finale
```

## Duration

Perform at least one realistic first-time-style playthrough.

The intended complete experience should take **at least approximately 20 minutes** for someone who does not already know every solution.

If it is dramatically shorter, improve the level design rather than inserting arbitrary waiting.

## No tedious waiting

A player should rarely be staring at the screen waiting for a meter to fill with nothing meaningful to do.

## No impossible randomness

A reasonable player should always have a path to recovery.

## Final level feels final

Night 10 should clearly feel more substantial than Night 1.

## Satisfying completion

Getting the entire town asleep should produce a noticeable emotional and audiovisual payoff.

---

# Testing the Game

After implementing the game, actively play through the entire experience.

Do not only inspect the code.

Test:

### Night 1

Can a new player discover Shhh?

### Night 2

Is the streetlight preference understandable from reaction?

### Night 3

Does the player realize houses differ?

### Night 4

Can the player understand that rain can help?

### Night 5

Are window effects understandable?

### Night 6

Are there multiple reasonable ways to manage the dog?

### Night 7

Does thunder create tension without becoming annoying?

### Night 8

Can the player anticipate the car?

### Night 9

Does the combination feel clever rather than confusing?

### Night 10

Does the entire sequence feel like a finale?

Also test:

* can every level actually be completed?
* can the player recover if several houses wake?
* can environmental controls accidentally create an unwinnable state?
* does the settling timer reset correctly?
* are controls still usable during disturbances?
* do houses visually communicate changes clearly?
* does the game remain understandable with audio muted?

Fix issues you encounter.

---

# Priorities If Time Is Limited

If development time becomes constrained, prioritize in this order:

1. Complete playable 10-level arc
2. House sleep/wake behavior
3. Shhh mechanic
4. Strong environmental cause/effect
5. Distinct authored level puzzles
6. Streetlights
7. Rain / white noise
8. Windows
9. Disturbances
10. Strong final sequence
11. Animation polish
12. Audio polish
13. Decorative details

Do not build a beautiful Night 1 and leave Nights 6-10 unfinished.

A visually simpler **complete game** is substantially better than a polished prototype of the opening mechanics.

---

# Product Standard

The intended result should feel like a tiny game someone might discover on itch.io, play for 20 to 30 minutes, finish, and remember because the central idea was unusually coherent.

It should not feel like:

* a tech demo
* a generic idle game
* a collection of UI controls
* a simulation dashboard
* ten tutorial exercises

The fantasy should remain clear throughout:

> **It is late. This tiny town needs to sleep. You are helping everything become quiet enough for that to happen.**

Build the smallest version of that idea that still feels complete, authored, charming, and worth finishing.
