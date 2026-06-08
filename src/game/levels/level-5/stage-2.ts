import { GROUND_HEIGHT, WORLD_HEIGHT } from "../../constants";
import type { StageDefinition } from "../../types";

const stage2: StageDefinition = {
  name: "Hausschuh-Flur",
  spawn: {
    x: 110,
    surfaceY: WORLD_HEIGHT - GROUND_HEIGHT,
  },
  platforms: [
    { id: 1, x: 200, y: WORLD_HEIGHT - 150, w: 115, h: 18 },
    { id: 2, x: 365, y: WORLD_HEIGHT - 235, w: 110, h: 18 },
    { id: 3, x: 525, y: WORLD_HEIGHT - 150, w: 100, h: 18 },
    { id: 4, x: 690, y: WORLD_HEIGHT - 245, w: 115, h: 18 },
    { id: 5, x: 865, y: WORLD_HEIGHT - 150, w: 100, h: 18 },
    { id: 6, x: 1040, y: WORLD_HEIGHT - 225, w: 120, h: 18 },
  ],
  goal: { platform: 6, offsetX: 84, width: 64, height: 64 },
  objective: {
    type: "transport",
    collectibleVisual: {
      assetPath: "/assets/slippers.svg",
      width: 52,
      height: 34,
    },
    store: {
      platform: 1,
      offsetX: 72,
      assetPath: "/assets/cozy-sofa.svg",
      width: 124,
      height: 100,
    },
    collectibles: [
      { platform: 2, offsetX: 55 },
      { platform: 3, offsetX: 50 },
      { platform: 4, offsetX: 55 },
      { platform: 5, offsetX: 50 },
      { platform: 6, offsetX: 60 },
    ],
  },
};

export default stage2;
