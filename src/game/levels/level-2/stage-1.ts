import { GROUND_HEIGHT, WORLD_HEIGHT } from "../../constants";
import type { StageDefinition } from "../../types";

const stage1: StageDefinition = {
  name: "Stage 1",
  spawn: {
    x: 120,
    surfaceY: WORLD_HEIGHT - GROUND_HEIGHT,
  },
  platforms: [
    { id: 1, x: 260, y: WORLD_HEIGHT - 150, w: 160, h: 20 },
    { id: 2, x: 520, y: WORLD_HEIGHT - 260, w: 140, h: 20 },
    { id: 3, x: 760, y: WORLD_HEIGHT - 190, w: 150, h: 20 },
    { id: 4, x: 930, y: WORLD_HEIGHT - 330, w: 170, h: 20 },
  ],
  goal: { platform: 4, offsetX: 135, width: 64, height: 64 },
  objective: {
    type: "transport",
    collectibleVisual: {
      assetPath: "/assets/socks.svg",
      width: 40,
      height: 40,
    },
    store: {
      platform: "ground",
      offsetX: 1040,
      assetPath: "/assets/laundry-washer.svg",
      width: 110,
      height: 110,
    },
    collectibles: [
      { platform: "ground", offsetX: 260 },
      { platform: 1, offsetX: 85 },
      { platform: 2, offsetX: 70 },
      { platform: 3, offsetX: 82 },
    ],
  },
};

export default stage1;
