import { GROUND_HEIGHT, WORLD_HEIGHT } from "../../constants";
import type { StageDefinition } from "../../types";

const stage5: StageDefinition = {
  name: "Stage 5",
  spawn: {
    x: 120,
    surfaceY: WORLD_HEIGHT - GROUND_HEIGHT,
  },
  platforms: [
    { id: 1, x: 180, y: WORLD_HEIGHT - 150, w: 120, h: 18 },
    { id: 2, x: 340, y: WORLD_HEIGHT - 250, w: 120, h: 18 },
    { id: 3, x: 500, y: WORLD_HEIGHT - 350, w: 120, h: 18 },
    { id: 4, x: 700, y: WORLD_HEIGHT - 450, w: 120, h: 18 },
    { id: 5, x: 900, y: WORLD_HEIGHT - 330, w: 120, h: 18 },
    { id: 6, x: 1080, y: WORLD_HEIGHT - 210, w: 110, h: 18 },
  ],
  goal: { platform: 4, offsetX: 88, width: 64, height: 64 },
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
        offsetX: 44,
        fleeTargets: [
          { platform: 3, offsetX: 30 },
          { platform: 5, offsetX: 78 },
        ],
      },
      {
        platform: 2,
        offsetX: 62,
        fleeTargets: [
          { platform: 6, offsetX: 30 },
          { platform: 4, offsetX: 94 },
        ],
      },
      {
        platform: 4,
        offsetX: 28,
        fleeTargets: [
          { platform: 2, offsetX: 16 },
          { platform: 1, offsetX: 84 },
        ],
      },
      {
        platform: 5,
        offsetX: 48,
        fleeTargets: [
          { platform: 3, offsetX: 88 },
          { platform: 6, offsetX: 66 },
        ],
      },
    ],
  },
  checkpoints: [
    {
      id: "spire",
      label: "Spire",
      spawn: {
        x: 760,
        surfaceY: WORLD_HEIGHT - 450,
      },
    },
  ],
};

export default stage5;
