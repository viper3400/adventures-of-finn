import { GROUND_HEIGHT, WORLD_HEIGHT } from "../../constants";
import type { StageDefinition } from "../../types";

const stage5: StageDefinition = {
  name: "Stage 5",
  spawn: {
    x: 125,
    surfaceY: WORLD_HEIGHT - GROUND_HEIGHT,
  },
  platforms: [
    { id: 1, x: 220, y: WORLD_HEIGHT - 160, w: 120, h: 20 },
    { id: 2, x: 380, y: WORLD_HEIGHT - 260, w: 120, h: 20 },
    { id: 3, x: 540, y: WORLD_HEIGHT - 360, w: 120, h: 20 },
    { id: 4, x: 720, y: WORLD_HEIGHT - 460, w: 120, h: 20 },
    { id: 5, x: 910, y: WORLD_HEIGHT - 340, w: 130, h: 20 },
    { id: 6, x: 1080, y: WORLD_HEIGHT - 210, w: 110, h: 20 },
  ],
  goal: { platform: 4, offsetX: 92, width: 64, height: 64 },
  objective: {
    type: "transport",
    collectibleVisual: {
      assetPath: "/assets/socks.svg",
      width: 40,
      height: 40,
    },
    store: {
      platform: 6,
      offsetX: 55,
      assetPath: "/assets/laundry-washer.svg",
      width: 92,
      height: 92,
    },
    collectibles: [
      { platform: "ground", offsetX: 430 },
      { platform: 1, offsetX: 55 },
      { platform: 2, offsetX: 55 },
      { platform: 3, offsetX: 55 },
      { platform: 5, offsetX: 65 },
    ],
  },
  checkpoints: [
    {
      id: "loft-return",
      label: "Return",
      spawn: {
        x: 770,
        surfaceY: WORLD_HEIGHT - 460,
      },
    },
  ],
};

export default stage5;
