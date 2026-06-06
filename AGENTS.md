# Game Notes For Coding Agents

This file describes the current state of the game implementation and the assumptions that should be preserved unless intentionally changed.

## Project Shape

- Runtime entrypoint: [src/main.ts](/Users/Jan/Documents/Development/pixijs/first/first-p/src/main.ts:1)
- Main game bootstrap and loop: [src/game/game.ts](/Users/Jan/Documents/Development/pixijs/first/first-p/src/game/game.ts:34)
- Shared tuning constants: [src/game/constants.ts](/Users/Jan/Documents/Development/pixijs/first/first-p/src/game/constants.ts:1)
- Level definitions: [src/game/levels.ts](/Users/Jan/Documents/Development/pixijs/first/first-p/src/game/levels.ts:1)
- Shared types: [src/game/types.ts](/Users/Jan/Documents/Development/pixijs/first/first-p/src/game/types.ts:1)

## Game Summary

- The game is a side-view platformer built with PixiJS v8.
- The main character is a dog sprite loaded from `public/assets/image_comic.png`.
- The game is level-based.
- Each level has:
  - a spawn point
  - a list of floating platforms
  - 5 collectible treats
  - a goal area that advances to the next level after all treats are collected
- Levels currently loop back to level 1 after the last level.

## Controls

- Move left: `ArrowLeft` or `A`
- Move right: `ArrowRight` or `D`
- Jump: `Space`, `W`, or `ArrowUp`

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

- Level data lives in `src/game/levels.ts`.
- Each level is defined by the `LevelDefinition` type.
- The active level is loaded by `loadLevel()` in `src/game/game.ts`.
- Level loading currently:
  - updates spawn position
  - destroys old floating platform graphics
  - destroys old collectible graphics
  - rebuilds current level platforms
  - rebuilds current level collectibles
  - redraws the goal marker
  - updates the level label
  - resets the player to spawn

## Goal System

- A goal area is represented as a rectangular zone in level data.
- The goal starts closed.
- While closed, it blocks the dog from passing through it.
- The goal opens only after all 5 treats in the current level are collected.
- When the player's paw zone intersects an open goal, the game advances to the next level.
- The goal is drawn as:
  - closed: red gate with bars
  - open: green gate

## Collectibles

- Every level currently defines exactly 5 treats in level data.
- Treats are rendered as yellow circular pickups.
- Pickup is based on overlap with the dog's visible body bounds.
- Collecting a treat updates the HUD and may open the goal.

## HUD

- A simple text label shows the current level name, treat progress, and goal state.
- HUD text is attached to `app.stage`, not `gameWorld`, so it does not scale with the world.

## Important Current Behaviors

- The player spawns already standing on the ground. Spawn height is aligned to the paw landing logic, not a hardcoded sprite center.
- Falling below the world resets the player to the current level spawn.
- The ground platform is special:
  - it is stored as `platforms[0]`
  - resize logic mutates its `x` and `width`
- Floating platforms are rebuilt when levels change.

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
- If you add collectibles, enemies, hazards, or checkpoints, they should probably become level data, not ad hoc state inside the ticker callback.

## Suggested Next Refactors

- Split player movement/physics from `src/game/game.ts` into a dedicated player module.
- Split level/world rendering into a world module.
- Split HUD into its own module.
- Add explicit level completion state instead of immediately switching levels on goal overlap.

## Agent Guidance

- Treat this project as a gameplay prototype with increasingly structured code.
- Preserve current feel unless the user explicitly asks for gameplay changes.
- When changing physics, mention which constants were tuned.
- When changing level structure, update this file if the architecture or gameplay rules materially change.
