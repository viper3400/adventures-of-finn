import { GROUND_HEIGHT, WORLD_HEIGHT } from "../../constants";
import type { StageDefinition } from "../../types";

const stage4: StageDefinition = {
  name: "Balkonballons",
  spawn: {
    x: 120,
    surfaceY: WORLD_HEIGHT - GROUND_HEIGHT,
  },
  platforms: [
    {
      id: 1,
      x: 210,
      y: WORLD_HEIGHT - 235,
      w: 120,
      h: 18,
      motion: {
        vertical: {
          distance: 110,
          speed: 85,
        },
      },
    },
    { id: 2, x: 400, y: WORLD_HEIGHT - 320, w: 120, h: 18 },
    {
      id: 3,
      x: 590,
      y: WORLD_HEIGHT - 225,
      w: 120,
      h: 18,
      motion: {
        horizontal: {
          distance: 170,
          speed: 100,
        },
      },
    },
    { id: 4, x: 790, y: WORLD_HEIGHT - 380, w: 120, h: 18 },
    {
      id: 5,
      x: 980,
      y: WORLD_HEIGHT - 255,
      w: 120,
      h: 18,
      motion: {
        vertical: {
          distance: 120,
          speed: 90,
        },
      },
    },
  ],
  goal: { platform: 4, offsetX: 88, width: 64, height: 64 },
  objective: {
    type: "transport",
    collectibleVisual: {
      assetPath: "/assets/balloon.svg",
      width: 44,
      height: 56,
    },
    store: {
      platform: "ground",
      offsetX: 1120,
      assetPath: "/assets/party-table.svg",
      width: 128,
      height: 106,
    },
    collectibles: [
      { platform: 1, offsetX: 60 },
      { platform: 2, offsetX: 60 },
      { platform: 3, offsetX: 60 },
      { platform: 4, offsetX: 60 },
      { platform: 5, offsetX: 60 },
    ],
  },
  hazards: [
    {
      id: "balcony-gap",
      kind: "kill",
      zone: {
        x: 730,
        y: WORLD_HEIGHT - 18,
        width: 100,
        height: 18,
      },
    },
  ],
};

export default stage4;
