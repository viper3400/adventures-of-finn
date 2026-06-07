import type { LevelDefinition } from "../types";

interface StageRef {
  levelIndex: number;
  stageIndex: number;
}

export type GameFlowState =
  | { kind: "boot" }
  | { kind: "title"; resumeStage: StageRef; hasStoredProgress: boolean }
  | { kind: "menu"; resumeStage: StageRef; hasStoredProgress: boolean }
  | { kind: "levelIntro"; stage: StageRef }
  | { kind: "playing"; stage: StageRef }
  | { kind: "levelComplete"; completedLevelIndex: number; nextStage: StageRef }
  | {
      kind: "levelFailed";
      failedLevelIndex: number;
      restartStage: StageRef;
      gameOver: boolean;
      livesRemaining: number;
    };

export type GameFlowEffect =
  | { type: "hideTransition" }
  | { type: "showTitleScreen" }
  | { type: "showStartupMenu" }
  | { type: "loadStage"; stage: StageRef }
  | { type: "showLevelIntro"; levelIndex: number }
  | { type: "showLevelComplete"; levelIndex: number }
  | {
      type: "showLevelFailure";
      levelIndex: number;
      gameOver: boolean;
      livesRemaining: number;
    };

export interface GameFlowController {
  getState(): GameFlowState;
  isPlaying(): boolean;
  start(initialStage?: StageRef, hasStoredProgress?: boolean): GameFlowEffect[];
  advanceTransition(): GameFlowEffect[];
  startNewGame(): GameFlowEffect[];
  continueGame(): GameFlowEffect[];
  advanceFromGoal(): GameFlowEffect[];
  failLevel(
    restartStage: StageRef,
    gameOver: boolean,
    livesRemaining: number,
  ): GameFlowEffect[];
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
      case "title":
      case "menu":
        return state.resumeStage;
      case "levelIntro":
      case "playing":
        return state.stage;
      case "levelComplete":
        return state.nextStage;
      case "levelFailed":
        return state.restartStage;
    }
  }

  return {
    getState(): GameFlowState {
      return state;
    },
    isPlaying(): boolean {
      return state.kind === "playing";
    },
    start(
      initialStage = { levelIndex: 0, stageIndex: 0 },
      hasStoredProgress = false,
    ): GameFlowEffect[] {
      state = { kind: "title", resumeStage: initialStage, hasStoredProgress };

      return [{ type: "showTitleScreen" }];
    },
    advanceTransition(): GameFlowEffect[] {
      switch (state.kind) {
        case "boot":
        case "menu":
        case "playing":
          return [];
        case "title": {
          state = {
            kind: "menu",
            resumeStage: state.resumeStage,
            hasStoredProgress: state.hasStoredProgress,
          };
          return [{ type: "showStartupMenu" }];
        }
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
        case "levelFailed": {
          const restartStage = state.restartStage;
          state = { kind: "levelIntro", stage: restartStage };
          return [
            { type: "hideTransition" },
            { type: "loadStage", stage: restartStage },
            { type: "showLevelIntro", levelIndex: restartStage.levelIndex },
          ];
        }
      }
    },
    startNewGame(): GameFlowEffect[] {
      if (state.kind !== "menu") {
        return [];
      }

      const firstStage = { levelIndex: 0, stageIndex: 0 };
      state = { kind: "levelIntro", stage: firstStage };

      return [
        { type: "hideTransition" },
        { type: "loadStage", stage: firstStage },
        { type: "showLevelIntro", levelIndex: firstStage.levelIndex },
      ];
    },
    continueGame(): GameFlowEffect[] {
      if (state.kind !== "menu") {
        return [];
      }

      const nextStage = state.hasStoredProgress
        ? state.resumeStage
        : { levelIndex: 0, stageIndex: 0 };
      state = { kind: "levelIntro", stage: nextStage };

      return [
        { type: "hideTransition" },
        { type: "loadStage", stage: nextStage },
        { type: "showLevelIntro", levelIndex: nextStage.levelIndex },
      ];
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
    failLevel(
      restartStage: StageRef,
      gameOver: boolean,
      livesRemaining: number,
    ): GameFlowEffect[] {
      const failedLevelIndex =
        state.kind === "playing"
          ? state.stage.levelIndex
          : restartStage.levelIndex;

      state = {
        kind: "levelFailed",
        failedLevelIndex,
        restartStage,
        gameOver,
        livesRemaining,
      };

      return [
        {
          type: "showLevelFailure",
          levelIndex: failedLevelIndex,
          gameOver,
          livesRemaining,
        },
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
