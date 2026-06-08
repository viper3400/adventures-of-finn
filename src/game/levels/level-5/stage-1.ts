import { GROUND_HEIGHT, WORLD_HEIGHT } from "../../constants";
import type { StageDefinition } from "../../types";

const stage1: StageDefinition = {
  name: "Kissenplatz",
  spawn: {
    x: 120,
    surfaceY: WORLD_HEIGHT - GROUND_HEIGHT,
  },
  platforms: [
    { id: 1, x: 220, y: WORLD_HEIGHT - 155, w: 180, h: 20 },
    { id: 2, x: 430, y: WORLD_HEIGHT - 240, w: 150, h: 20 },
    { id: 3, x: 640, y: WORLD_HEIGHT - 300, w: 140, h: 20 },
    { id: 4, x: 830, y: WORLD_HEIGHT - 250, w: 180, h: 20 },
  ],
  goal: { platform: 4, offsetX: 132, width: 64, height: 64 },
  objective: {
    type: "transport",
    collectibleVisual: {
      assetPath: "/assets/pillow.svg",
      width: 46,
      height: 36,
    },
    store: {
      platform: "ground",
      offsetX: 1020,
      assetPath: "/assets/cozy-sofa.svg",
      width: 132,
      height: 108,
    },
    collectibles: [
      { platform: "ground", offsetX: 260 },
      { platform: 1, offsetX: 90 },
      { platform: 2, offsetX: 78 },
      { platform: 3, offsetX: 72 },
    ],
  },
};

export default stage1;
