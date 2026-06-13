import { describe, expect, it } from "vitest";

import { createLevel, createStage } from "../test/fixtures";
import { LEVELS } from ".";
import { validateLevels } from "./validation";

describe("validateLevels", () => {
  it("accepts the production level fixtures", () => {
    expect(() => validateLevels(LEVELS)).not.toThrow();
  });

  it("accepts a minimal valid fixture", () => {
    expect(() => validateLevels([createLevel("valid", 1)])).not.toThrow();
  });

  it("rejects duplicate level ids, empty names, invalid timing, and empty stage lists", () => {
    expect(() =>
      validateLevels([createLevel("same"), createLevel("same")]),
    ).toThrow('Duplicate level id "same"');
    expect(() =>
      validateLevels([createLevel("blank", 1, { name: "   " })]),
    ).toThrow('Level name is required for "blank"');
    expect(() =>
      validateLevels([
        createLevel("timing", 1, { timing: { failSeconds: 0 } }),
      ]),
    ).toThrow('Level "timing" timing values must be positive');
    expect(() =>
      validateLevels([createLevel("empty", 0, { stages: [] })]),
    ).toThrow('Level "empty" must define at least one stage');
  });

  it("rejects duplicate platform ids, bad anchors, and non-positive dimensions", () => {
    expect(() =>
      validateLevels([
        createLevel("dupe", 1, {
          stages: [
            createStage({
              platforms: [
                { id: 1, x: 0, y: 0, w: 100, h: 20 },
                { id: 1, x: 0, y: 0, w: 100, h: 20 },
              ],
            }),
          ],
        }),
      ]),
    ).toThrow('Duplicate platform "1" in level "dupe" stage "Stage 1"');

    expect(() =>
      validateLevels([
        createLevel("anchor", 1, {
          stages: [
            createStage({
              goal: { platform: 9, offsetX: 0, width: 64, height: 64 },
            }),
          ],
        }),
      ]),
    ).toThrow('Invalid goal anchor "9" in level "anchor" stage "Stage 1"');

    expect(() =>
      validateLevels([
        createLevel("dims", 1, {
          stages: [
            createStage({
              platforms: [{ id: 1, x: 0, y: 0, w: 0, h: 20 }],
            }),
          ],
        }),
      ]),
    ).toThrow(
      'Platform "1" must have positive dimensions in level "dims" stage "Stage 1"',
    );
  });

  it("rejects invalid platform motion values", () => {
    expect(() =>
      validateLevels([
        createLevel("motion", 1, {
          stages: [
            createStage({
              platforms: [
                {
                  id: 1,
                  x: 0,
                  y: 0,
                  w: 100,
                  h: 20,
                  motion: { horizontal: { distance: 0, speed: 50 } },
                },
              ],
            }),
          ],
        }),
      ]),
    ).toThrow(
      'Platform "1" horizontal motion must be positive in level "motion" stage "Stage 1"',
    );
  });

  it("rejects missing collectibles, invalid transport stores, and invalid chase config", () => {
    expect(() =>
      validateLevels([
        createLevel("collectibles", 1, {
          stages: [
            createStage({
              objective: {
                type: "collect",
                collectibleVisual: {
                  assetPath: "/collectible.svg",
                  width: 32,
                  height: 32,
                },
                collectibles: [],
              },
            }),
          ],
        }),
      ]),
    ).toThrow('Missing collectibles in level "collectibles" stage "Stage 1"');

    expect(() =>
      validateLevels([
        createLevel("store", 1, {
          stages: [
            createStage({
              objective: {
                type: "transport",
                collectibleVisual: {
                  assetPath: "/collectible.svg",
                  width: 32,
                  height: 32,
                },
                collectibles: [{ platform: 1, offsetX: 20 }],
                store: {
                  platform: 1,
                  offsetX: 80,
                  width: 0,
                  height: 64,
                  assetPath: "/store.svg",
                },
              },
            }),
          ],
        }),
      ]),
    ).toThrow(
      'Store must have positive dimensions in level "store" stage "Stage 1"',
    );

    expect(() =>
      validateLevels([
        createLevel("chase", 1, {
          stages: [
            createStage({
              objective: {
                type: "chase",
                collectibleVisual: {
                  assetPath: "/crow.svg",
                  width: 48,
                  height: 36,
                },
                collectibles: [
                  {
                    platform: 1,
                    offsetX: 20,
                    fleeTargets: [{ platform: 1, offsetX: 60 }],
                  },
                ],
              },
            }),
          ],
        }),
      ]),
    ).toThrow(
      'Chase collectible[0] needs at least 2 flee targets in level "chase" stage "Stage 1"',
    );
  });

  it("rejects duplicate checkpoint ids and invalid hazard dimensions", () => {
    expect(() =>
      validateLevels([
        createLevel("checkpoint", 1, {
          stages: [
            createStage({
              checkpoints: [
                { id: "a", spawn: { x: 100, surfaceY: 500 } },
                { id: "a", spawn: { x: 120, surfaceY: 500 } },
              ],
            }),
          ],
        }),
      ]),
    ).toThrow('Duplicate checkpoint "a" in level "checkpoint" stage "Stage 1"');

    expect(() =>
      validateLevels([
        createLevel("hazard", 1, {
          stages: [
            createStage({
              hazards: [
                {
                  id: "h",
                  kind: "kill",
                  zone: { x: 0, y: 0, width: 0, height: 20 },
                },
              ],
            }),
          ],
        }),
      ]),
    ).toThrow(
      'Hazard "h" must have positive dimensions in level "hazard" stage "Stage 1"',
    );
  });
});
