import { describe, expect, it } from "vitest";

import { createLevel } from "../test/fixtures";
import { createProgressionController } from "./progression";

describe("createProgressionController", () => {
  const levels = [createLevel("one", 3), createLevel("two", 2)];

  it("defaults to level 1 stage 1 when storage is empty", () => {
    const controller = createProgressionController(levels);

    expect(controller.hasStoredProgression()).toBe(false);
    expect(controller.getResumeStage()).toEqual({
      levelIndex: 0,
      stageIndex: 0,
    });
  });

  it("resumes from the stored level but starts at stage 1 of that level", () => {
    window.localStorage.setItem(
      "first-p:progression",
      JSON.stringify({ levelIndex: 1, stageIndex: 1 }),
    );

    const controller = createProgressionController(levels);

    expect(controller.hasStoredProgression()).toBe(true);
    expect(controller.getResumeStage()).toEqual({
      levelIndex: 1,
      stageIndex: 0,
    });
  });

  it("ignores invalid or corrupt storage", () => {
    window.localStorage.setItem("first-p:progression", "{oops");
    expect(createProgressionController(levels).hasStoredProgression()).toBe(
      false,
    );

    window.localStorage.setItem(
      "first-p:progression",
      JSON.stringify({ levelIndex: 99, stageIndex: 99 }),
    );
    expect(createProgressionController(levels).hasStoredProgression()).toBe(
      false,
    );
  });

  it("records only later stages and never regresses progression", () => {
    const controller = createProgressionController(levels);

    controller.recordReachedStage({ levelIndex: 0, stageIndex: 1 });
    controller.recordReachedStage({ levelIndex: 0, stageIndex: 0 });
    controller.recordReachedStage({ levelIndex: 1, stageIndex: 1 });

    expect(controller.getResumeStage()).toEqual({
      levelIndex: 1,
      stageIndex: 0,
    });
    expect(
      JSON.parse(window.localStorage.getItem("first-p:progression") ?? "null"),
    ).toEqual({
      levelIndex: 1,
      stageIndex: 1,
    });
  });

  it("clears in-memory and stored progression on reset", () => {
    const controller = createProgressionController(levels);

    controller.recordReachedStage({ levelIndex: 1, stageIndex: 1 });
    controller.resetProgression();

    expect(controller.hasStoredProgression()).toBe(false);
    expect(controller.getResumeStage()).toEqual({
      levelIndex: 0,
      stageIndex: 0,
    });
    expect(window.localStorage.getItem("first-p:progression")).toBeNull();
  });
});
