import { GROUND_HEIGHT, WORLD_HEIGHT } from "../../constants";
import type { StageDefinition } from "../../types";

const stage3: StageDefinition = {
  name: "Leseecke",
  spawn: {
    x: 135,
    surfaceY: WORLD_HEIGHT - GROUND_HEIGHT,
  },
  platforms: [
    { id: 1, x: 240, y: WORLD_HEIGHT - 165, w: 150, h: 20 },
    { id: 2, x: 420, y: WORLD_HEIGHT - 250, w: 130, h: 20 },
    { id: 3, x: 580, y: WORLD_HEIGHT - 315, w: 130, h: 20 },
    { id: 4, x: 760, y: WORLD_HEIGHT - 250, w: 140, h: 20 },
    { id: 5, x: 940, y: WORLD_HEIGHT - 170, w: 150, h: 20 },
  ],
  goal: { platform: 5, offsetX: 110, width: 64, height: 64 },
  objective: {
    type: "transport",
    collectibleVisual: {
      assetPath: "/assets/book.svg",
      width: 40,
      height: 40,
    },
    store: {
      platform: "ground",
      offsetX: 180,
      assetPath: "/assets/cozy-sofa.svg",
      width: 120,
      height: 98,
    },
    collectibles: [
      { platform: 2, offsetX: 62 },
      { platform: 3, offsetX: 62 },
      { platform: 4, offsetX: 70 },
      { platform: 5, offsetX: 78 },
    ],
  },
};

export default stage3;
