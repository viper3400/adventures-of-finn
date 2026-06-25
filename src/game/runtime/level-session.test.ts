import { describe, expect, it } from "vitest";

import { createLevel } from "../test/fixtures";
import { createLevelSessionController } from "./level-session";

describe("createLevelSessionController", () => {
  const levels = [createLevel("one"), createLevel("two")];

  it("applies difficulty multipliers to fail and hurry timers", () => {
    const controller = createLevelSessionController(levels);

    controller.setDifficulty("easy");
    controller.beginLevel(0);
    expect(controller.getTimeRemainingSeconds()).toBe(78);

    controller.setDifficulty("normal");
    controller.beginLevel(0);
    expect(controller.getTimeRemainingSeconds()).toBe(60);

    controller.setDifficulty("hard");
    controller.beginLevel(0);
    expect(controller.getTimeRemainingSeconds()).toBe(48);

    controller.setDifficulty("zen");
    controller.beginLevel(0);
    expect(controller.getTimeRemainingSeconds()).toBeNull();
    expect(controller.hasTimer()).toBe(false);
    expect(controller.hasLives()).toBe(false);
  });

  it("does not tick timers while not running", () => {
    const controller = createLevelSessionController(levels);

    controller.beginLevel(0);

    expect(controller.update(10_000)).toBeNull();
    expect(controller.getTimeRemainingSeconds()).toBe(60);
  });

  it("does not time out or spend lives in story mode", () => {
    const controller = createLevelSessionController(levels);

    controller.setDifficulty("zen");
    controller.beginLevel(1);
    controller.setRunning(true);

    expect(controller.update(600_000)).toBeNull();
    expect(controller.getLivesRemaining()).toBeNull();
    expect(controller.getTimeRemainingSeconds()).toBeNull();
    expect(controller.isHurry()).toBe(false);
    expect(controller.completeLevel()).toEqual({ elapsedSeconds: 600 });
  });

  it("enters hurry only while running and under the hurry threshold", () => {
    const controller = createLevelSessionController(levels);

    controller.beginLevel(0);
    expect(controller.isHurry()).toBe(false);

    controller.setRunning(true);
    controller.update(46_000);
    expect(controller.isHurry()).toBe(true);
  });

  it("removes one life and restarts the current level on non-terminal timeout", () => {
    const controller = createLevelSessionController(levels);

    controller.beginLevel(1);
    controller.setRunning(true);

    expect(controller.update(60_000)).toEqual({
      gameOver: false,
      livesRemaining: 2,
      restartLevelIndex: 1,
    });
    expect(controller.getLivesRemaining()).toBe(2);
    expect(controller.getCurrentLevelIndex()).toBe(1);
    expect(controller.getTimeRemainingSeconds()).toBe(60);
  });

  it("resets lives and restarts from level 1 after the final life is lost", () => {
    const controller = createLevelSessionController(levels);

    for (let livesLost = 0; livesLost < 2; livesLost += 1) {
      controller.beginLevel(1);
      controller.setRunning(true);
      controller.update(60_000);
    }

    controller.beginLevel(1);
    controller.setRunning(true);

    expect(controller.update(60_000)).toEqual({
      gameOver: true,
      livesRemaining: 3,
      restartLevelIndex: 0,
    });
    expect(controller.getLivesRemaining()).toBe(3);
    expect(controller.getCurrentLevelIndex()).toBe(0);
  });

  it("reports elapsed time when a level is completed", () => {
    const controller = createLevelSessionController(levels);

    controller.beginLevel(0);
    controller.setRunning(true);
    controller.update(12_500);

    expect(controller.completeLevel()).toEqual({ elapsedSeconds: 13 });
  });

  it("resets all run state", () => {
    const controller = createLevelSessionController(levels);

    controller.beginLevel(1);
    controller.setRunning(true);
    controller.update(15_000);
    controller.resetRun();

    expect(controller.getCurrentLevelIndex()).toBeNull();
    expect(controller.getLivesRemaining()).toBe(3);
    expect(controller.getTimeRemainingSeconds()).toBe(0);
    expect(controller.isHurry()).toBe(false);
  });
});
