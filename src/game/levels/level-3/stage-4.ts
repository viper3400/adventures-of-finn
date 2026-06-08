import { GROUND_HEIGHT, WORLD_HEIGHT } from "../../constants";
import type { StageDefinition } from "../../types";

const stage4: StageDefinition = {
  name: "Stage 4",
  spawn: {
    x: 120,
    surfaceY: WORLD_HEIGHT - GROUND_HEIGHT,
  },
  platforms: [
    {
      id: 1,
      x: 200,
      y: WORLD_HEIGHT - 190,
      w: 130,
      h: 18,
      motion: {
        horizontal: {
          distance: 120,
          speed: 90,
        },
      },
    },
    { id: 2, x: 430, y: WORLD_HEIGHT - 320, w: 130, h: 18 },
    {
      id: 3,
      x: 660,
      y: WORLD_HEIGHT - 270,
      w: 130,
      h: 18,
      motion: {
        vertical: {
          distance: 150,
          speed: 80,
        },
      },
    },
    { id: 4, x: 900, y: WORLD_HEIGHT - 360, w: 130, h: 18 },
    { id: 5, x: 1080, y: WORLD_HEIGHT - 240, w: 110, h: 18 },
  ],
  goal: { platform: 4, offsetX: 92, width: 64, height: 64 },
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
          { platform: 3, offsetX: 28 },
          { platform: 5, offsetX: 48 },
        ],
      },
      {
        platform: 2,
        offsetX: 74,
        fleeTargets: [
          { platform: "ground", offsetX: 920 },
          { platform: 1, offsetX: 96 },
        ],
      },
      {
        platform: 3,
        offsetX: 82,
        fleeTargets: [
          { platform: 2, offsetX: 22 },
          { platform: "ground", offsetX: 1120 },
        ],
      },
      {
        platform: 5,
        offsetX: 34,
        fleeTargets: [
          { platform: 3, offsetX: 54 },
          { platform: 2, offsetX: 96 },
        ],
      },
    ],
    triggerRadius: 145,
  },
};

export default stage4;
