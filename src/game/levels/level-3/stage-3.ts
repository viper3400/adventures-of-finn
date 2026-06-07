import { GROUND_HEIGHT, WORLD_HEIGHT } from "../../constants";
import type { StageDefinition } from "../../types";

const stage3: StageDefinition = {
  name: "Stage 3",
  spawn: {
    x: 130,
    surfaceY: WORLD_HEIGHT - GROUND_HEIGHT,
  },
  platforms: [
    { id: 1, x: 220, y: WORLD_HEIGHT - 180, w: 140, h: 18 },
    { id: 2, x: 420, y: WORLD_HEIGHT - 330, w: 130, h: 18 },
    { id: 3, x: 640, y: WORLD_HEIGHT - 470, w: 140, h: 18 },
    { id: 4, x: 880, y: WORLD_HEIGHT - 330, w: 130, h: 18 },
    { id: 5, x: 1060, y: WORLD_HEIGHT - 210, w: 120, h: 18 },
  ],
  goal: { platform: 3, offsetX: 98, width: 64, height: 64 },
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
        offsetX: 70,
        fleeTargets: [
          { platform: 2, offsetX: 38 },
          { platform: 4, offsetX: 90 },
        ],
      },
      {
        platform: 2,
        offsetX: 84,
        fleeTargets: [
          { platform: 5, offsetX: 34 },
          { platform: 3, offsetX: 28 },
        ],
      },
      {
        platform: 4,
        offsetX: 34,
        fleeTargets: [
          { platform: 1, offsetX: 28 },
          { platform: 3, offsetX: 100 },
        ],
      },
      {
        platform: 5,
        offsetX: 56,
        fleeTargets: [
          { platform: 4, offsetX: 72 },
          { platform: 2, offsetX: 16 },
        ],
      },
    ],
  },
  hazards: [
    {
      id: "center-gap",
      kind: "kill",
      zone: {
        x: 560,
        y: WORLD_HEIGHT - 18,
        width: 100,
        height: 18,
      },
    },
  ],
};

export default stage3;
