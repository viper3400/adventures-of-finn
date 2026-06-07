import {
  getStageCollectibles,
  getStageObjectiveType,
  getStageStore,
} from "../level-schema";
import type { LevelDefinition, PlatformId, StageDefinition } from "../types";

function stageLabel(level: LevelDefinition, stage: StageDefinition): string {
  return `level "${level.id}" stage "${stage.name}"`;
}

function assertPlatformExists(
  level: LevelDefinition,
  stage: StageDefinition,
  platformId: PlatformId,
  usage: string,
): void {
  if (platformId === "ground") {
    return;
  }

  const exists = stage.platforms.some((platform) => platform.id === platformId);
  if (!exists) {
    throw new Error(
      `Invalid ${usage} anchor "${platformId}" in ${stageLabel(level, stage)}`,
    );
  }
}

function validateStage(level: LevelDefinition, stage: StageDefinition): void {
  if (getStageCollectibles(stage).length === 0) {
    throw new Error(`Missing collectibles in ${stageLabel(level, stage)}`);
  }

  assertPlatformExists(level, stage, stage.goal.platform, "goal");
  getStageCollectibles(stage).forEach((collectible, index) => {
    assertPlatformExists(
      level,
      stage,
      collectible.platform,
      `collectible[${index}]`,
    );
  });

  const store = getStageStore(stage);
  if (getStageObjectiveType(stage) === "transport" && !store) {
    throw new Error(
      `Transport stage missing store in ${stageLabel(level, stage)}`,
    );
  }
  if (store) {
    assertPlatformExists(level, stage, store.platform, "store");
  }

  const checkpointIds = new Set<string>();
  stage.checkpoints?.forEach((checkpoint) => {
    if (checkpointIds.has(checkpoint.id)) {
      throw new Error(
        `Duplicate checkpoint "${checkpoint.id}" in ${stageLabel(level, stage)}`,
      );
    }
    checkpointIds.add(checkpoint.id);
  });

  stage.hazards?.forEach((hazard) => {
    if (hazard.zone.width <= 0 || hazard.zone.height <= 0) {
      throw new Error(
        `Hazard "${hazard.id}" must have positive dimensions in ${stageLabel(level, stage)}`,
      );
    }
  });
}

export function validateLevels(levels: LevelDefinition[]): LevelDefinition[] {
  const levelIds = new Set<string>();

  levels.forEach((level) => {
    if (levelIds.has(level.id)) {
      throw new Error(`Duplicate level id "${level.id}"`);
    }
    levelIds.add(level.id);

    level.stages.forEach((stage) => validateStage(level, stage));
  });

  return levels;
}
