import { GROUND_HEIGHT, WORLD_HEIGHT } from "../../constants";
import type { StageDefinition } from "../../types";

const stage6: StageDefinition = {
  name: "Kuschelecke",
  spawn: {
    x: 120,
    surfaceY: WORLD_HEIGHT - GROUND_HEIGHT,
  },
  platforms: [
    { id: 1, x: 210, y: WORLD_HEIGHT - 165, w: 150, h: 20 },
    { id: 2, x: 410, y: WORLD_HEIGHT - 235, w: 130, h: 20 },
    { id: 3, x: 590, y: WORLD_HEIGHT - 290, w: 130, h: 20 },
    { id: 4, x: 760, y: WORLD_HEIGHT - 235, w: 150, h: 20 },
    {
      id: 5,
      x: 950,
      y: WORLD_HEIGHT - 185,
      w: 135,
      h: 20,
      motion: {
        horizontal: {
          distance: 90,
          speed: 70,
        },
      },
    },
    { id: 6, x: 1130, y: WORLD_HEIGHT - 240, w: 90, h: 20 },
  ],
  goal: { platform: 6, offsetX: 68, width: 64, height: 64 },
  objective: {
    type: "transport",
    collectibleVisual: {
      assetPath: "/assets/teddy.svg",
      width: 40,
      height: 44,
    },
    store: {
      platform: "ground",
      offsetX: 250,
      assetPath: "/assets/cozy-sofa.svg",
      width: 136,
      height: 110,
    },
    collectibles: [
      { platform: 1, offsetX: 66 },
      { platform: 2, offsetX: 58 },
      { platform: 3, offsetX: 58 },
      { platform: 4, offsetX: 72 },
      { platform: 5, offsetX: 68 },
      { platform: 6, offsetX: 40 },
    ],
  },
  checkpoints: [
    {
      id: "soft-finish",
      label: "Ruheplatz",
      spawn: {
        x: 800,
        surfaceY: WORLD_HEIGHT - 235,
      },
    },
  ],
};

export default stage6;
