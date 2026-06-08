import { GROUND_HEIGHT, WORLD_HEIGHT } from "../../constants";
import type { StageDefinition } from "../../types";

const stage4: StageDefinition = {
  name: "Kuechenlicht",
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
          speed: 80,
        },
      },
    },
    { id: 2, x: 405, y: WORLD_HEIGHT - 325, w: 120, h: 18 },
    {
      id: 3,
      x: 600,
      y: WORLD_HEIGHT - 235,
      w: 120,
      h: 18,
      motion: {
        horizontal: {
          distance: 150,
          speed: 95,
        },
      },
    },
    { id: 4, x: 805, y: WORLD_HEIGHT - 390, w: 120, h: 18 },
    {
      id: 5,
      x: 1000,
      y: WORLD_HEIGHT - 270,
      w: 120,
      h: 18,
      motion: {
        vertical: {
          distance: 120,
          speed: 85,
        },
      },
    },
  ],
  goal: { platform: 4, offsetX: 88, width: 64, height: 64 },
  objective: {
    type: "transport",
    collectibleVisual: {
      assetPath: "/assets/lamp.svg",
      width: 40,
      height: 40,
    },
    store: {
      platform: "ground",
      offsetX: 1110,
      assetPath: "/assets/cozy-sofa.svg",
      width: 132,
      height: 108,
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
      id: "kitchen-light-gap",
      kind: "kill",
      zone: {
        x: 740,
        y: WORLD_HEIGHT - 18,
        width: 100,
        height: 18,
      },
    },
  ],
};

export default stage4;
