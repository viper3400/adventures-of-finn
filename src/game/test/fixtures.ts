import type {
  CollectObjective,
  LevelDefinition,
  PlatformConfig,
  StageDefinition,
} from "../types";

function createPlatform(id: number, x = 100, y = 500): PlatformConfig {
  return {
    id,
    x,
    y,
    w: 180,
    h: 24,
  };
}

function createCollectObjective(): CollectObjective {
  return {
    type: "collect",
    collectibleVisual: {
      assetPath: "/collectible.svg",
      width: 32,
      height: 32,
    },
    collectibles: [{ platform: 1, offsetX: 40 }],
  };
}

export function createStage(
  overrides: Partial<StageDefinition> = {},
): StageDefinition {
  return {
    name: "Stage 1",
    spawn: {
      x: 200,
      surfaceY: 500,
    },
    platforms: [createPlatform(1)],
    goal: {
      platform: 1,
      offsetX: 90,
      width: 64,
      height: 64,
    },
    objective: createCollectObjective(),
    ...overrides,
  };
}

export function createLevel(
  id: string,
  stageCount = 2,
  overrides: Partial<LevelDefinition> = {},
): LevelDefinition {
  return {
    id,
    name: `Level ${id}`,
    intro: { speech: `${id} intro` },
    completion: { speech: `${id} complete` },
    timing: {
      failSeconds: 60,
      hurrySeconds: 15,
    },
    stages: Array.from({ length: stageCount }, (_, index) =>
      createStage({ name: `Stage ${index + 1}` }),
    ),
    ...overrides,
  };
}
