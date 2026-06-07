import type { LevelDefinition } from "../types";

interface StageRef {
  levelIndex: number;
  stageIndex: number;
}

export type GameFlowState =
  | { kind: "boot" }
  | { kind: "levelIntro"; stage: StageRef }
  | { kind: "playing"; stage: StageRef }
  | { kind: "levelComplete"; completedLevelIndex: number; nextStage: StageRef };

export type GameFlowEffect =
  | { type: "hideTransition" }
  | { type: "loadStage"; stage: StageRef }
  | { type: "showLevelIntro"; levelIndex: number }
  | { type: "showLevelComplete"; levelIndex: number };

export interface GameFlowController {
  getState(): GameFlowState;
  isPlaying(): boolean;
  start(): GameFlowEffect[];
  advanceTransition(): GameFlowEffect[];
  advanceFromGoal(): GameFlowEffect[];
  skipForward(): GameFlowEffect[];
}

export function createGameFlowController(
  levels: LevelDefinition[],
): GameFlowController {
  let state: GameFlowState = { kind: "boot" };

  function getNextStage(stage: StageRef): StageRef {
    const level = levels[stage.levelIndex];
    const hasNextStage = stage.stageIndex + 1 < level.stages.length;

    if (hasNextStage) {
      return {
        levelIndex: stage.levelIndex,
        stageIndex: stage.stageIndex + 1,
      };
    }

    return {
      levelIndex: (stage.levelIndex + 1) % levels.length,
      stageIndex: 0,
    };
  }

  function getCurrentStage(): StageRef {
    switch (state.kind) {
      case "boot":
        return { levelIndex: 0, stageIndex: 0 };
      case "levelIntro":
      case "playing":
        return state.stage;
      case "levelComplete":
        return state.nextStage;
    }
  }

  return {
    getState(): GameFlowState {
      return state;
    },
    isPlaying(): boolean {
      return state.kind === "playing";
    },
    start(): GameFlowEffect[] {
      const firstStage = { levelIndex: 0, stageIndex: 0 };
      state = { kind: "levelIntro", stage: firstStage };

      return [
        { type: "loadStage", stage: firstStage },
        { type: "showLevelIntro", levelIndex: firstStage.levelIndex },
      ];
    },
    advanceTransition(): GameFlowEffect[] {
      switch (state.kind) {
        case "boot":
        case "playing":
          return [];
        case "levelIntro": {
          const nextState = { kind: "playing", stage: state.stage } as const;
          state = nextState;
          return [{ type: "hideTransition" }];
        }
        case "levelComplete": {
          const nextStage = state.nextStage;
          state = { kind: "levelIntro", stage: nextStage };
          return [
            { type: "hideTransition" },
            { type: "loadStage", stage: nextStage },
            { type: "showLevelIntro", levelIndex: nextStage.levelIndex },
          ];
        }
      }
    },
    advanceFromGoal(): GameFlowEffect[] {
      if (state.kind !== "playing") {
        return [];
      }

      const currentStage = state.stage;
      const nextStage = getNextStage(currentStage);
      const isNextLevel = nextStage.levelIndex !== currentStage.levelIndex;

      if (!isNextLevel) {
        state = { kind: "playing", stage: nextStage };
        return [{ type: "loadStage", stage: nextStage }];
      }

      state = {
        kind: "levelComplete",
        completedLevelIndex: currentStage.levelIndex,
        nextStage,
      };

      return [
        { type: "showLevelComplete", levelIndex: currentStage.levelIndex },
      ];
    },
    skipForward(): GameFlowEffect[] {
      const nextStage = getNextStage(getCurrentStage());
      state = { kind: "playing", stage: nextStage };

      return [
        { type: "hideTransition" },
        { type: "loadStage", stage: nextStage },
      ];
    },
  };
}
