import { describe, expect, it } from "vitest";

import {
  getAnchorPlatformBounds,
  getGroundBounds,
  getStandingY,
  isGoalOpen,
  isWithinChaseTriggerRadius,
  playerReachesGoal,
  playerTouchesCollectible,
  playerTouchesStore,
  resolveAnchoredCollectible,
  resolveAnchoredGoal,
  resolveAnchoredStore,
  resolveChaseTrigger,
} from "./stage-logic";

describe("stage-logic helpers", () => {
  const platform = { id: 1 as const, x: 200, y: 500, width: 180, height: 24 };

  it("resolves standing Y and anchored positions", () => {
    expect(getStandingY(500)).toBe(465);
    expect(
      resolveAnchoredGoal(platform, {
        platform: 1,
        offsetX: 90,
        width: 64,
        height: 64,
      }),
    ).toEqual({
      x: 258,
      y: 436,
      width: 64,
      height: 64,
    });
    expect(
      resolveAnchoredCollectible(
        platform,
        { assetPath: "/collectible.svg", width: 32, height: 32 },
        { platform: 1, offsetX: 40 },
      ),
    ).toEqual({
      x: 240,
      y: 476,
      width: 32,
      height: 32,
    });
    expect(
      resolveAnchoredStore(platform, {
        platform: 1,
        offsetX: 60,
        width: 80,
        height: 90,
        assetPath: "/store.svg",
      }),
    ).toEqual({
      x: 220,
      y: 410,
      width: 80,
      height: 90,
      assetPath: "/store.svg",
    });
  });

  it("computes goal, collectible, and store overlap predicates", () => {
    const collectible = { x: 240, y: 476, width: 32, height: 32 };
    const store = {
      x: 220,
      y: 410,
      width: 80,
      height: 90,
      assetPath: "/store.svg",
    };
    const goal = { x: 258, y: 436, width: 64, height: 64 };

    expect(isGoalOpen(3, 3)).toBe(true);
    expect(isGoalOpen(2, 3)).toBe(false);
    expect(playerTouchesCollectible(240, 476, collectible)).toBe(true);
    expect(playerTouchesStore(240, 455, store)).toBe(true);
    expect(playerReachesGoal(290, 465, goal)).toBe(true);
  });

  it("resolves chase flee and escape progression", () => {
    expect(resolveChaseTrigger({ fleeTargetIndex: 0 }, 2)).toEqual({
      type: "flee",
      nextFleeTargetIndex: 1,
    });
    expect(resolveChaseTrigger({ fleeTargetIndex: 1 }, 2)).toEqual({
      type: "flee",
      nextFleeTargetIndex: 2,
    });
    expect(resolveChaseTrigger({ fleeTargetIndex: 2 }, 2)).toEqual({
      type: "escape",
    });
  });

  it("checks chase trigger radius and platform anchor resolution", () => {
    expect(isWithinChaseTriggerRadius(100, 100, 190, 100, 90)).toBe(true);
    expect(isWithinChaseTriggerRadius(100, 100, 191, 100, 90)).toBe(false);

    const ground = getGroundBounds(0, 680, 1280);
    expect(
      getAnchorPlatformBounds("ground", [platform], {
        id: "ground",
        ...ground,
      }),
    ).toEqual({ id: "ground", ...ground });
    expect(
      getAnchorPlatformBounds(1, [platform], { id: "ground", ...ground }),
    ).toEqual(platform);
  });
});
