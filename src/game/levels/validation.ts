import {
  getStageCollectibles,
  getStageCollectibleVisual,
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
  if (!stage.name.trim()) {
    throw new Error(`Stage name is required in level "${level.id}"`);
  }

  if (stage.spawn.surfaceY <= 0) {
    throw new Error(`Invalid spawn surface in ${stageLabel(level, stage)}`);
  }

  if (stage.goal.width <= 0 || stage.goal.height <= 0) {
    throw new Error(
      `Goal must have positive dimensions in ${stageLabel(level, stage)}`,
    );
  }

  const platformIds = new Set<number>();
  stage.platforms.forEach((platform) => {
    if (platformIds.has(platform.id)) {
      throw new Error(
        `Duplicate platform "${platform.id}" in ${stageLabel(level, stage)}`,
      );
    }
    platformIds.add(platform.id);

    if (platform.w <= 0 || platform.h <= 0) {
      throw new Error(
        `Platform "${platform.id}" must have positive dimensions in ${stageLabel(level, stage)}`,
      );
    }

    if (platform.motion?.horizontal) {
      if (
        platform.motion.horizontal.distance <= 0 ||
        platform.motion.horizontal.speed <= 0
      ) {
        throw new Error(
          `Platform "${platform.id}" horizontal motion must be positive in ${stageLabel(level, stage)}`,
        );
      }
    }

    if (platform.motion?.vertical) {
      if (
        platform.motion.vertical.distance <= 0 ||
        platform.motion.vertical.speed <= 0
      ) {
        throw new Error(
          `Platform "${platform.id}" vertical motion must be positive in ${stageLabel(level, stage)}`,
        );
      }
    }
  });

  if (getStageCollectibles(stage).length === 0) {
    throw new Error(`Missing collectibles in ${stageLabel(level, stage)}`);
  }

  assertPlatformExists(level, stage, stage.goal.platform, "goal");
  const collectibleVisual = getStageCollectibleVisual(stage);
  if (collectibleVisual.width <= 0 || collectibleVisual.height <= 0) {
    throw new Error(
      `Collectible visual must have positive dimensions in ${stageLabel(level, stage)}`,
    );
  }
  const chaseObjective =
    stage.objective.type === "chase" ? stage.objective : null;
  getStageCollectibles(stage).forEach((collectible, index) => {
    assertPlatformExists(
      level,
      stage,
      collectible.platform,
      `collectible[${index}]`,
    );

    if (chaseObjective) {
      const fleeTargets = chaseObjective.collectibles[index]?.fleeTargets ?? [];
      if (fleeTargets.length < 2) {
        throw new Error(
          `Chase collectible[${index}] needs at least 2 flee targets in ${stageLabel(level, stage)}`,
        );
      }

      fleeTargets.forEach((target, targetIndex) => {
        assertPlatformExists(
          level,
          stage,
          target.platform,
          `collectible[${index}].fleeTargets[${targetIndex}]`,
        );
      });
    }
  });

  if (chaseObjective) {
    if (
      (chaseObjective.triggerRadius !== undefined &&
        chaseObjective.triggerRadius <= 0) ||
      (chaseObjective.fleeSpeed !== undefined &&
        chaseObjective.fleeSpeed <= 0) ||
      (chaseObjective.escapeSpeed !== undefined &&
        chaseObjective.escapeSpeed <= 0)
    ) {
      throw new Error(
        `Chase settings must be positive in ${stageLabel(level, stage)}`,
      );
    }
  }

  const store = getStageStore(stage);
  if (getStageObjectiveType(stage) === "transport" && !store) {
    throw new Error(
      `Transport stage missing store in ${stageLabel(level, stage)}`,
    );
  }
  if (store) {
    assertPlatformExists(level, stage, store.platform, "store");
    if (store.width <= 0 || store.height <= 0) {
      throw new Error(
        `Store must have positive dimensions in ${stageLabel(level, stage)}`,
      );
    }
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
    if (!level.id.trim()) {
      throw new Error("Level id is required");
    }
    if (levelIds.has(level.id)) {
      throw new Error(`Duplicate level id "${level.id}"`);
    }
    levelIds.add(level.id);

    if (!level.name.trim()) {
      throw new Error(`Level name is required for "${level.id}"`);
    }

    if (level.timing.failSeconds <= 0) {
      throw new Error(`Level "${level.id}" timing values must be positive`);
    }

    if (
      level.timing.hurrySeconds !== undefined &&
      (level.timing.hurrySeconds <= 0 ||
        level.timing.hurrySeconds >= level.timing.failSeconds)
    ) {
      throw new Error(
        `Level "${level.id}" hurry timing must be between 0 and fail time`,
      );
    }

    if (!level.stages.length) {
      throw new Error(`Level "${level.id}" must define at least one stage`);
    }

    level.stages.forEach((stage) => validateStage(level, stage));
  });

  return levels;
}
