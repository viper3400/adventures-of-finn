# Game Notes For Coding Agents

This file describes the current state of the game implementation and the assumptions that should be preserved unless intentionally changed.

## Project Shape

- Runtime entrypoint: [src/main.ts](/Users/Jan/Documents/Development/pixijs/first/first-p/src/main.ts:1)
- Main game bootstrap and orchestration: [src/game/game.ts](/Users/Jan/Documents/Development/pixijs/first/first-p/src/game/game.ts:1)
- Runtime modules live in `src/game/runtime/`:
  - `assets.ts`: shared asset loading
  - `input.ts`: keyboard input state and debug actions
  - `player.ts`: player sprite setup and movement/physics
  - `state-flow.ts`: explicit gameplay flow state machine for intros, active play, and level completion
  - `stage-runtime.ts`: stage loading, platforms, collectibles, goal, store, debug labels
  - `ui.ts`: HUD and transition overlay
- Shared tuning constants: [src/game/constants.ts](/Users/Jan/Documents/Development/pixijs/first/first-p/src/game/constants.ts:1)
- Level definitions: [src/game/levels/index.ts](/Users/Jan/Documents/Development/pixijs/first/first-p/src/game/levels/index.ts:1)
- Shared types: [src/game/types.ts](/Users/Jan/Documents/Development/pixijs/first/first-p/src/game/types.ts:1)

## Game Summary

- The game is a side-view platformer built with PixiJS v8.
- The main character is a dog sprite loaded from `public/assets/image_comic.png`.
- The game is level-based.
- The progression model is:
  - a level contains one or more stages
  - each stage has its own spawn point, platforms, collectibles, and goal
- Each stage owns a typed `objective`:
  - `collect`: pickups count immediately on contact
  - `transport`: pickups must be carried to a store before they count
- The current content is:
  - `Level 1`
  - `Stage 1` to `Stage 6`
  - `Level 2`
  - `Stage 1` to `Stage 6`
- After the last stage of the last level, progression loops back to the first stage of the first level.

## Controls

- Move left: `ArrowLeft` or `A`
- Move right: `ArrowRight` or `D`
- Jump: `Space`, `W`, or `ArrowUp`
- Toggle platform debug labels: `L`
- Jump to the next stage immediately for debugging: `S`

## World Model

- The game uses a virtual world, not raw browser pixels.
- Virtual world size:
  - `WORLD_WIDTH = 1280`
  - `WORLD_HEIGHT = 720`
- The Pixi canvas resizes with the window, but the world is scaled and centered inside the viewport.
- The bottom ground platform is extended on wide screens so it visually fills the full visible width.

## Player Model

- Visual sprite size is controlled by:
  - `PLAYER_WIDTH`
  - `PLAYER_HEIGHT`
- Collision is not based on the full sprite bounds.
- Landing is based on a small paw contact zone:
  - `PLAYER_FEET_WIDTH`
  - `PLAYER_FEET_HEIGHT`
  - `PLAYER_FEET_OFFSET_Y`
- Standing stability is based on a forward-biased support point:
  - `PLAYER_SUPPORT_OFFSET_X`
- This means:
  - the dog can only land when the paw zone overlaps a platform
  - the dog can only continue standing if the support point is still above the platform

## Physics And Motion

- Gravity, jump power, and move speed are defined in `constants.ts`.
- The dog tilts while airborne using:
  - `AIR_TILT_FACTOR`
  - `AIR_TILT_LIMIT`
- The dog eases back to flat on landing using:
  - `GROUND_TILT_SMOOTHING`
- The dog is clamped horizontally inside the world bounds.
- When it runs into the left or right edge, the visual sprite gets a small bounce effect using:
  - `EDGE_BOUNCE_DISTANCE`
  - `EDGE_BOUNCE_SMOOTHING`

## Level System

- Level data lives in `src/game/levels/`.
- Each level has its own folder with an `index.ts` plus one file per stage.
- Each level is defined by the `LevelDefinition` type.
- Each level owns structured transition content:
  - `intro`
  - `completion`
- Each stage is defined by the `StageDefinition` type.
- Each stage owns its objective-owned collectible presentation and placement:
  - `objective.collectibleVisual`
  - `objective.collectibles`
- Transport stages additionally define `objective.store`.
- Level data is validated at startup:
  - level ids and names must be present
  - levels must contain at least one stage
  - stage names must be present
  - platform ids must be unique within a stage
  - platforms, goals, collectibles, and stores must resolve to positive dimensions
  - moving platform motion values must resolve to positive distance and speed
  - anchored goal/store/collectible references must point at real platforms
- Stages may additionally declare:
  - `checkpoints`
  - `hazards`
  - `decor`
  - `presentation`
- The active stage is loaded by `loadStage()` in `src/game/runtime/stage-runtime.ts`.
- Stage loading currently:
  - updates spawn position
  - destroys old floating platform graphics
  - destroys old collectible graphics
  - destroys old decor sprites
  - rebuilds current stage platforms
  - rebuilds current stage collectibles
  - resolves checkpoint and hazard data for the active stage
  - redraws the goal marker
  - updates the level label
  - resets the player to spawn
- Goal completion advances to the next stage inside the same level first.
- If the current stage is the last stage of the current level, goal completion advances to the first stage of the next level.
- Progression is persisted in browser `localStorage` as the furthest reached stage.
- Reloading the game resumes from the saved stage instead of always restarting at level 1 stage 1.
- On boot, the game shows a dedicated title screen using `public/assets/title.png` and waits for `Space`.
- After the title screen, the game shows a startup menu that lets the player begin a new run from level 1 or continue from saved progress.
- Before a new level starts, the game shows a full-screen intro with the level number and level name, and waits for `Space`.
- After the last stage of a level, the game shows a `Level geschafft!` screen before advancing, and waits for `Space`.
- The title screen and the level transition screens are driven from `src/game/runtime/ui.ts`.
- Runtime progression is explicit:
  - `boot`
  - `title`
  - `menu`
  - `levelIntro`
  - `playing`
  - `levelComplete`
- Transition visibility no longer determines gameplay flow by itself; `src/game/runtime/state-flow.ts` is the source of truth.

## Goal System

- A goal area is represented as a rectangular zone in level data.
- The goal starts closed.
- While closed, it stays visually closed but does not physically block the dog.
- The goal opens only after all collectibles in the current stage are collected or delivered.
- When the player's paw zone intersects an open goal, the game advances to the next level.
- The goal is drawn as:
  - closed: red gate with bars
  - open: green gate

## Collectibles

- Each stage defines its own collectible count in level data.
- Treats are rendered from the current stage's configured SVG asset.
- Pickup is based on overlap with the dog's visible body bounds.
- In `collect` mode, touching a treat consumes it immediately.
- In `transport` mode, the dog carries one item at a time in its mouth and only gets credit after touching the store.

## HUD

- A simple text label shows the current level name, current stage name, treat progress, and goal state.
- HUD text is attached to `app.stage`, not `gameWorld`, so it does not scale with the world.

## Important Current Behaviors

- The player spawns already standing on the ground. Spawn height is aligned to the paw landing logic, not a hardcoded sprite center.
- Stage spawns are defined as `spawn.x` plus `spawn.surfaceY`.
- Falling below the world resets the player to the current level spawn.
- The ground platform is special:
  - it is stored as `platforms[0]`
  - it has runtime id `ground`
  - resize logic mutates its `x` and `width`
- Floating platforms are rebuilt when levels change.
- Floating platforms use numeric ids inside each stage definition.
- Floating platforms may optionally declare `motion.horizontal` and/or `motion.vertical` in level data.
- Anchored goals, stores, and collectibles follow moving platforms at runtime.
- Pressing `L` toggles debug labels that show each platform id and its `x/y` position.

## If You Change Physics

- Keep the distinction between:
  - visual sprite size
  - paw landing zone
  - support point
- If you change player art size, verify:
  - spawn height
  - landing snap
  - support point feel near edges
  - left/right clamp feel
  - edge bounce feel

## If You Change Level Logic

- Prefer editing `src/game/levels.ts` instead of hardcoding positions in `game.ts`.
- If you add new level features, extend `LevelDefinition` first.
- Prefer reusing the shared schema primitives in `types.ts`:
  - `SpawnPointDefinition`
  - `RectZoneDefinition`
  - `VisualDefinition`
- If you add collectibles, enemies, hazards, or checkpoints, they should probably become level data, not ad hoc state inside the ticker callback.

## Suggested Next Refactors

- Move respawn handling into the state-flow module if death/failure states become more complex than an instant reset.
- Add a small developer-facing reset-progress action if faster test iteration becomes important.
- Extend state-flow for pause/menu/checkpoint flows before adding hazards or dialogue-heavy sequences.

## Agent Guidance

- Treat this project as a gameplay prototype with increasingly structured code.
- Preserve current feel unless the user explicitly asks for gameplay changes.
- When changing physics, mention which constants were tuned.
- When changing level structure, update this file if the architecture or gameplay rules materially change.
