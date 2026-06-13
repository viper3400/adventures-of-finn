import { describe, expect, it } from "vitest";

import { createLevel } from "../test/fixtures";
import { createGameFlowController } from "./state-flow";

describe("createGameFlowController", () => {
  const levels = [createLevel("one", 2), createLevel("two", 2)];

  it("moves through title, menu, intro, and playing states", () => {
    const controller = createGameFlowController(levels);

    expect(controller.start({ levelIndex: 1, stageIndex: 1 }, true)).toEqual([
      { type: "showTitleScreen" },
    ]);
    expect(controller.advanceTransition()).toEqual([
      { type: "showStartupMenu" },
    ]);
    expect(controller.continueGame()).toEqual([
      { type: "hideTransition" },
      { type: "loadStage", stage: { levelIndex: 1, stageIndex: 1 } },
      { type: "showLevelIntro", levelIndex: 1 },
    ]);
    expect(controller.advanceTransition()).toEqual([
      { type: "hideTransition" },
    ]);
    expect(controller.isPlaying()).toBe(true);
  });

  it("starts a new game from the first stage", () => {
    const controller = createGameFlowController(levels);

    controller.start({ levelIndex: 1, stageIndex: 1 }, true);
    controller.advanceTransition();

    expect(controller.startNewGame()).toEqual([
      { type: "hideTransition" },
      { type: "loadStage", stage: { levelIndex: 0, stageIndex: 0 } },
      { type: "showLevelIntro", levelIndex: 0 },
    ]);
  });

  it("advances stage-to-stage inside the same level without transitions", () => {
    const controller = createGameFlowController(levels);

    controller.start();
    controller.advanceTransition();
    controller.startNewGame();
    controller.advanceTransition();

    expect(controller.advanceFromGoal()).toEqual([
      { type: "loadStage", stage: { levelIndex: 0, stageIndex: 1 } },
    ]);
  });

  it("shows level completion before loading the next level", () => {
    const controller = createGameFlowController(levels);

    controller.start();
    controller.advanceTransition();
    controller.startNewGame();
    controller.advanceTransition();
    controller.advanceFromGoal();

    expect(controller.advanceFromGoal()).toEqual([
      { type: "showLevelComplete", levelIndex: 0 },
    ]);
    expect(controller.advanceTransition()).toEqual([
      { type: "hideTransition" },
      { type: "loadStage", stage: { levelIndex: 1, stageIndex: 0 } },
      { type: "showLevelIntro", levelIndex: 1 },
    ]);
  });

  it("shows level completion, then game completion, then returns to title after the final stage", () => {
    const controller = createGameFlowController([
      createLevel("one", 1),
      createLevel("two", 1),
    ]);

    controller.start({ levelIndex: 1, stageIndex: 0 }, true);
    controller.advanceTransition();
    controller.continueGame();
    controller.advanceTransition();

    expect(controller.advanceFromGoal()).toEqual([
      { type: "showLevelComplete", levelIndex: 1 },
    ]);
    expect(controller.advanceTransition()).toEqual([
      { type: "hideTransition" },
      { type: "showGameComplete", levelIndex: 1 },
    ]);
    expect(controller.advanceTransition()).toEqual([
      { type: "showTitleScreen" },
    ]);
  });

  it("handles level failure and game-over restart paths", () => {
    const controller = createGameFlowController(levels);

    controller.start();
    controller.advanceTransition();
    controller.startNewGame();
    controller.advanceTransition();

    expect(
      controller.failLevel({ levelIndex: 0, stageIndex: 0 }, false, 2),
    ).toEqual([
      {
        type: "showLevelFailure",
        levelIndex: 0,
        gameOver: false,
        livesRemaining: 2,
      },
    ]);
    expect(controller.advanceTransition()).toEqual([
      { type: "hideTransition" },
      { type: "loadStage", stage: { levelIndex: 0, stageIndex: 0 } },
      { type: "showLevelIntro", levelIndex: 0 },
    ]);

    expect(
      controller.failLevel({ levelIndex: 0, stageIndex: 0 }, true, 3),
    ).toEqual([
      {
        type: "showLevelFailure",
        levelIndex: 0,
        gameOver: true,
        livesRemaining: 3,
      },
    ]);
  });

  it("returns no effects for invalid-state actions", () => {
    const controller = createGameFlowController(levels);

    expect(controller.advanceTransition()).toEqual([]);
    expect(controller.startNewGame()).toEqual([]);
    expect(controller.continueGame()).toEqual([]);
    expect(controller.advanceFromGoal()).toEqual([]);
  });

  it("skips forward across stage and level boundaries", () => {
    const controller = createGameFlowController(levels);

    controller.start();

    expect(controller.skipForward()).toEqual([
      { type: "hideTransition" },
      { type: "loadStage", stage: { levelIndex: 0, stageIndex: 1 } },
    ]);
    expect(controller.skipForward()).toEqual([
      { type: "showLevelComplete", levelIndex: 0 },
    ]);
  });
});
