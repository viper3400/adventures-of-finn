import { GROUND_HEIGHT, WORLD_HEIGHT } from "../../constants";
import type { StageDefinition } from "../../types";

const stage6: StageDefinition = {
  name: "Stage 6",
  spawn: {
    x: 130,
    surfaceY: WORLD_HEIGHT - GROUND_HEIGHT,
  },
  platforms: [
    { id: 1, x: 200, y: WORLD_HEIGHT - 180, w: 120, h: 18 },
    { id: 2, x: 390, y: WORLD_HEIGHT - 310, w: 130, h: 18 },
    { id: 3, x: 590, y: WORLD_HEIGHT - 430, w: 130, h: 18 },
    { id: 4, x: 810, y: WORLD_HEIGHT - 300, w: 130, h: 18 },
    { id: 5, x: 1010, y: WORLD_HEIGHT - 180, w: 130, h: 18 },
  ],
  goal: { platform: 3, offsetX: 94, width: 64, height: 64 },
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
        offsetX: 38,
        fleeTargets: [
          { platform: 4, offsetX: 86 },
          { platform: "ground", offsetX: 680 },
        ],
      },
      {
        platform: 2,
        offsetX: 74,
        fleeTargets: [
          { platform: 5, offsetX: 84 },
          { platform: 1, offsetX: 82 },
        ],
      },
      {
        platform: 3,
        offsetX: 66,
        fleeTargets: [
          { platform: 2, offsetX: 24 },
          { platform: 4, offsetX: 30 },
        ],
      },
      {
        platform: 5,
        offsetX: 32,
        fleeTargets: [
          { platform: "ground", offsetX: 1080 },
          { platform: 2, offsetX: 96 },
        ],
      },
    ],
    triggerRadius: 155,
    fleeSpeed: 340,
    escapeSpeed: 460,
  },
};

export default stage6;
