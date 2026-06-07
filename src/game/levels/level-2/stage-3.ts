import { GROUND_HEIGHT, WORLD_HEIGHT } from "../../constants";
import type { StageDefinition } from "../../types";

const stage3: StageDefinition = {
  name: "Stage 3",
  spawn: {
    x: 140,
    surfaceY: WORLD_HEIGHT - GROUND_HEIGHT,
  },
  platforms: [
    { id: 1, x: 260, y: WORLD_HEIGHT - 150, w: 130, h: 20 },
    { id: 2, x: 470, y: WORLD_HEIGHT - 260, w: 120, h: 20 },
    { id: 3, x: 660, y: WORLD_HEIGHT - 370, w: 120, h: 20 },
    { id: 4, x: 880, y: WORLD_HEIGHT - 280, w: 140, h: 20 },
    { id: 5, x: 1040, y: WORLD_HEIGHT - 410, w: 120, h: 20 },
  ],
  goal: { platform: 5, offsetX: 92, width: 64, height: 64 },
  objective: {
    type: "transport",
    collectibleVisual: {
      assetPath: "/assets/socks.svg",
      width: 40,
      height: 40,
    },
    store: {
      platform: 1,
      offsetX: 95,
      assetPath: "/assets/laundry-washer.svg",
      width: 100,
      height: 100,
    },
    collectibles: [
      { platform: "ground", offsetX: 520 },
      { platform: 2, offsetX: 55 },
      { platform: 3, offsetX: 55 },
      { platform: 4, offsetX: 75 },
      { platform: 5, offsetX: 55 },
    ],
  },
  hazards: [
    {
      id: "delivery-gap",
      kind: "kill",
      zone: {
        x: 575,
        y: WORLD_HEIGHT - 18,
        width: 110,
        height: 18,
      },
    },
  ],
};

export default stage3;
