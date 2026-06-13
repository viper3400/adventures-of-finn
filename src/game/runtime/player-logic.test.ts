import { describe, expect, it } from "vitest";

import { EDGE_BOUNCE_DISTANCE } from "../constants";
import {
  applyHorizontalWorldBounds,
  canLandOnPlatform,
  checkFeetOnPlatform,
  getLandingY,
  hasPlatformSupport,
} from "./player-logic";

describe("player-logic helpers", () => {
  const platform = { x: 200, y: 500, width: 180, height: 24 };

  it("detects feet overlap with a platform", () => {
    expect(
      checkFeetOnPlatform(240, getLandingY(platform.y) + 1, platform),
    ).toBe(true);
    expect(checkFeetOnPlatform(50, 50, platform)).toBe(false);
  });

  it("uses the forward-biased support point", () => {
    expect(hasPlatformSupport(240, platform, 1)).toBe(true);
    expect(hasPlatformSupport(375, platform, 1)).toBe(false);
    expect(hasPlatformSupport(375, platform, -1)).toBe(true);
  });

  it("allows landing only when descending from above the platform tolerance", () => {
    expect(canLandOnPlatform(450, 4, platform.y)).toBe(true);
    expect(canLandOnPlatform(505, 4, platform.y)).toBe(false);
    expect(canLandOnPlatform(450, -2, platform.y)).toBe(false);
  });

  it("clamps world bounds and applies edge bounce easing", () => {
    const leftBound = applyHorizontalWorldBounds(10, 0);
    expect(leftBound.playerX).toBe(75);
    expect(leftBound.edgeBounceOffsetX).toBeCloseTo(
      EDGE_BOUNCE_DISTANCE * 0.72,
      5,
    );
    expect(leftBound.renderedX).toBeCloseTo(79.32, 5);

    const rightBound = applyHorizontalWorldBounds(2_000, 0);
    expect(rightBound.playerX).toBe(1205);
    expect(rightBound.edgeBounceOffsetX).toBeCloseTo(
      -EDGE_BOUNCE_DISTANCE * 0.72,
      5,
    );
  });
});
