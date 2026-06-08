import { GROUND_HEIGHT, WORLD_HEIGHT } from "../../constants";
import type { StageDefinition } from "../../types";

const stage2: StageDefinition = {
  name: "Stage 2",
  spawn: {
    x: 120,
    surfaceY: WORLD_HEIGHT - GROUND_HEIGHT,
  },
  platforms: [
    { id: 1, x: 170, y: WORLD_HEIGHT - 150, w: 110, h: 18 },
    { id: 2, x: 330, y: WORLD_HEIGHT - 250, w: 110, h: 18 },
    { id: 3, x: 500, y: WORLD_HEIGHT - 360, w: 110, h: 18 },
    { id: 4, x: 690, y: WORLD_HEIGHT - 260, w: 110, h: 18 },
    { id: 5, x: 860, y: WORLD_HEIGHT - 150, w: 110, h: 18 },
    { id: 6, x: 1030, y: WORLD_HEIGHT - 270, w: 120, h: 18 },
  ],
  goal: { platform: 6, offsetX: 86, width: 64, height: 64 },
  objective: {
    type: "chase",
    collectibleVisual: {
      assetPath: "/assets/crow.svg",
      width: 72,
      height: 48,
    },
    collectibles: [
      {
        platform: 1,
        offsetX: 36,
        fleeTargets: [
          { platform: 3, offsetX: 44 },
          { platform: "ground", offsetX: 1040 },
        ],
      },
      {
        platform: 2,
        offsetX: 62,
        fleeTargets: [
          { platform: 4, offsetX: 58 },
          { platform: 5, offsetX: 70 },
        ],
      },
      {
        platform: 4,
        offsetX: 44,
        fleeTargets: [
          { platform: 2, offsetX: 22 },
          { platform: 3, offsetX: 72 },
        ],
      },
      {
        platform: 6,
        offsetX: 52,
        fleeTargets: [
          { platform: 5, offsetX: 18 },
          { platform: 1, offsetX: 76 },
        ],
      },
    ],
  },
  checkpoints: [
    {
      id: "zig-top",
      label: "High Step",
      spawn: {
        x: 540,
        surfaceY: WORLD_HEIGHT - 360,
      },
    },
  ],
};

export default stage2;
