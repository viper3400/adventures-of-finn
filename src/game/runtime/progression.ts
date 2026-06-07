import type { LevelDefinition } from "../types";

export interface StageRef {
  levelIndex: number;
  stageIndex: number;
}

export interface ProgressionController {
  getResumeStage(): StageRef;
  recordReachedStage(stage: StageRef): void;
}

interface PersistedProgression {
  levelIndex: number;
  stageIndex: number;
}

const STORAGE_KEY = "first-p:progression";

function isValidStageRef(levels: LevelDefinition[], stage: StageRef): boolean {
  const level = levels[stage.levelIndex];
  if (!level) {
    return false;
  }

  return stage.stageIndex >= 0 && stage.stageIndex < level.stages.length;
}

function getStageOrderIndex(
  levels: LevelDefinition[],
  stage: StageRef,
): number | null {
  if (!isValidStageRef(levels, stage)) {
    return null;
  }

  let orderIndex = 0;
  for (let levelIndex = 0; levelIndex < stage.levelIndex; levelIndex += 1) {
    orderIndex += levels[levelIndex].stages.length;
  }

  return orderIndex + stage.stageIndex;
}

function readStoredProgression(levels: LevelDefinition[]): StageRef | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const rawValue = window.localStorage.getItem(STORAGE_KEY);
    if (!rawValue) {
      return null;
    }

    const parsed = JSON.parse(rawValue) as PersistedProgression;
    const stage = {
      levelIndex: parsed.levelIndex,
      stageIndex: parsed.stageIndex,
    };

    return isValidStageRef(levels, stage) ? stage : null;
  } catch {
    return null;
  }
}

function writeStoredProgression(stage: StageRef): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(stage));
  } catch {
    // Ignore storage failures so gameplay still works in restricted contexts.
  }
}

export function createProgressionController(
  levels: LevelDefinition[],
): ProgressionController {
  const defaultStage = { levelIndex: 0, stageIndex: 0 };
  let bestStage = readStoredProgression(levels) ?? defaultStage;
  let bestStageOrderIndex =
    getStageOrderIndex(levels, bestStage) ??
    getStageOrderIndex(levels, defaultStage) ??
    0;

  return {
    getResumeStage(): StageRef {
      return bestStage;
    },
    recordReachedStage(stage: StageRef): void {
      const stageOrderIndex = getStageOrderIndex(levels, stage);
      if (stageOrderIndex === null || stageOrderIndex < bestStageOrderIndex) {
        return;
      }

      bestStage = stage;
      bestStageOrderIndex = stageOrderIndex;
      writeStoredProgression(stage);
    },
  };
}
