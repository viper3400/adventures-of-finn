import { GROUND_HEIGHT, WORLD_HEIGHT } from "../../constants";
import type { StageDefinition } from "../../types";

const stage1: StageDefinition = {
  name: "Stage 1",
  spawn: {
    x: 100,
    surfaceY: WORLD_HEIGHT - GROUND_HEIGHT,
  },
  platforms: [
    { id: 1, x: 190, y: WORLD_HEIGHT - 170, w: 130, h: 18 },
    { id: 2, x: 410, y: WORLD_HEIGHT - 290, w: 140, h: 18 },
    { id: 3, x: 660, y: WORLD_HEIGHT - 210, w: 130, h: 18 },
    { id: 4, x: 860, y: WORLD_HEIGHT - 340, w: 140, h: 18 },
    { id: 5, x: 1040, y: WORLD_HEIGHT - 230, w: 120, h: 18 },
  ],
  goal: { platform: 5, offsetX: 88, width: 64, height: 64 },
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
        offsetX: 42,
        fleeTargets: [
          { platform: 3, offsetX: 42 },
          { platform: 4, offsetX: 96 },
        ],
      },
      {
        platform: 2,
        offsetX: 80,
        fleeTargets: [
          { platform: 4, offsetX: 40 },
          { platform: "ground", offsetX: 980 },
        ],
      },
      {
        platform: 3,
        offsetX: 82,
        fleeTargets: [
          { platform: 1, offsetX: 94 },
          { platform: "ground", offsetX: 1120 },
        ],
      },
      {
        platform: 4,
        offsetX: 70,
        fleeTargets: [
          { platform: 2, offsetX: 42 },
          { platform: 3, offsetX: 24 },
        ],
      },
    ],
  },
};

export default stage1;
