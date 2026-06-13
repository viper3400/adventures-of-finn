import { describe, expect, it } from "vitest";

import { createStage } from "./test/fixtures";
import {
  getStageCollectibles,
  getStageCollectibleVisual,
  getStageObjective,
  getStageObjectiveType,
  getStageStore,
  getTransitionContent,
} from "./level-schema";

describe("level-schema helpers", () => {
  it("returns the correct objective data for collect stages", () => {
    const stage = createStage();

    expect(getStageObjective(stage)).toBe(stage.objective);
    expect(getStageObjectiveType(stage)).toBe("collect");
    expect(getStageCollectibleVisual(stage)).toEqual(
      stage.objective.collectibleVisual,
    );
    expect(getStageCollectibles(stage)).toEqual(stage.objective.collectibles);
    expect(getStageStore(stage)).toBeNull();
  });

  it("returns the store for transport stages", () => {
    const stage = createStage({
      objective: {
        type: "transport",
        collectibleVisual: {
          assetPath: "/collectible.svg",
          width: 32,
          height: 32,
        },
        collectibles: [{ platform: 1, offsetX: 10 }],
        store: {
          platform: 1,
          offsetX: 60,
          width: 80,
          height: 80,
          assetPath: "/store.svg",
        },
      },
    });
    const transportObjective =
      stage.objective.type === "transport" ? stage.objective : null;

    expect(getStageObjectiveType(stage)).toBe("transport");
    expect(getStageStore(stage)).toEqual(transportObjective?.store ?? null);
  });

  it("fills missing transition title and subtitle with fallbacks", () => {
    expect(
      getTransitionContent(
        { speech: "Hi" },
        "Fallback Title",
        "Fallback Subtitle",
      ),
    ).toEqual({
      speech: "Hi",
      title: "Fallback Title",
      subtitle: "Fallback Subtitle",
    });
    expect(
      getTransitionContent(
        { speech: "Hi", title: "Custom", subtitle: "Specific" },
        "Fallback Title",
        "Fallback Subtitle",
      ),
    ).toEqual({
      speech: "Hi",
      title: "Custom",
      subtitle: "Specific",
    });
  });
});
