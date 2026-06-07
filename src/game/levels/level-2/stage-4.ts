import { GROUND_HEIGHT, WORLD_HEIGHT } from "../../constants";
import type { StageDefinition } from "../../types";

const stage4: StageDefinition = {
  name: "Stage 4",
  spawn: {
    x: 130,
    surfaceY: WORLD_HEIGHT - GROUND_HEIGHT,
  },
  platforms: [
    {
      id: 1,
      x: 210,
      y: WORLD_HEIGHT - 250,
      w: 120,
      h: 20,
      motion: {
        vertical: {
          distance: 120,
          speed: 90,
        },
      },
    },
    { id: 2, x: 390, y: WORLD_HEIGHT - 320, w: 130, h: 20 },
    {
      id: 3,
      x: 600,
      y: WORLD_HEIGHT - 210,
      w: 120,
      h: 20,
      motion: {
        horizontal: {
          distance: 180,
          speed: 110,
        },
      },
    },
    { id: 4, x: 760, y: WORLD_HEIGHT - 360, w: 120, h: 20 },
    { id: 5, x: 950, y: WORLD_HEIGHT - 470, w: 140, h: 20 },
    { id: 6, x: 1090, y: WORLD_HEIGHT - 280, w: 100, h: 20 },
  ],
  goal: { platform: 6, offsetX: 72, width: 64, height: 64 },
  objective: {
    type: "transport",
    collectibleVisual: {
      assetPath: "/assets/socks.svg",
      width: 40,
      height: 40,
    },
    store: {
      platform: "ground",
      offsetX: 1110,
      assetPath: "/assets/laundry-washer.svg",
      width: 110,
      height: 110,
    },
    collectibles: [
      { platform: 1, offsetX: 55 },
      { platform: 2, offsetX: 65 },
      { platform: 3, offsetX: 55 },
      { platform: 4, offsetX: 55 },
      { platform: 5, offsetX: 70 },
    ],
  },
};

export default stage4;
