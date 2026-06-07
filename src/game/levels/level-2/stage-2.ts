import { GROUND_HEIGHT, WORLD_HEIGHT } from "../../constants";
import type { StageDefinition } from "../../types";

const stage2: StageDefinition = {
  name: "Stage 2",
  spawn: {
    x: 120,
    surfaceY: WORLD_HEIGHT - GROUND_HEIGHT,
  },
  platforms: [
    { id: 1, x: 240, y: WORLD_HEIGHT - 170, w: 130, h: 20 },
    { id: 2, x: 430, y: WORLD_HEIGHT - 290, w: 130, h: 20 },
    { id: 3, x: 650, y: WORLD_HEIGHT - 220, w: 140, h: 20 },
    { id: 4, x: 860, y: WORLD_HEIGHT - 340, w: 140, h: 20 },
    { id: 5, x: 1030, y: WORLD_HEIGHT - 200, w: 120, h: 20 },
  ],
  goal: { platform: 4, offsetX: 105, width: 64, height: 64 },
  objective: {
    type: "transport",
    collectibleVisual: {
      assetPath: "/assets/socks.svg",
      width: 40,
      height: 40,
    },
    store: {
      platform: "ground",
      offsetX: 130,
      assetPath: "/assets/laundry-washer.svg",
      width: 110,
      height: 110,
    },
    collectibles: [
      { platform: 1, offsetX: 70 },
      { platform: 2, offsetX: 70 },
      { platform: 3, offsetX: 70 },
      { platform: 4, offsetX: 70 },
      { platform: 5, offsetX: 50 },
    ],
  },
  checkpoints: [
    {
      id: "delivery-top",
      label: "Top Route",
      spawn: {
        x: 720,
        surfaceY: WORLD_HEIGHT - 220,
      },
    },
  ],
};

export default stage2;
