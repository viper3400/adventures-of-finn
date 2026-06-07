import { GROUND_HEIGHT, WORLD_HEIGHT } from "../../constants";
import type { StageDefinition } from "../../types";

const stage6: StageDefinition = {
  name: "Stage 6",
  spawn: {
    x: 120,
    surfaceY: WORLD_HEIGHT - GROUND_HEIGHT,
  },
  platforms: [
    { id: 1, x: 200, y: WORLD_HEIGHT - 180, w: 110, h: 20 },
    { id: 2, x: 350, y: WORLD_HEIGHT - 300, w: 110, h: 20 },
    { id: 3, x: 510, y: WORLD_HEIGHT - 420, w: 110, h: 20 },
    { id: 4, x: 710, y: WORLD_HEIGHT - 300, w: 130, h: 20 },
    { id: 5, x: 910, y: WORLD_HEIGHT - 190, w: 130, h: 20 },
    { id: 6, x: 1080, y: WORLD_HEIGHT - 340, w: 110, h: 20 },
  ],
  goal: { platform: 6, offsetX: 82, width: 64, height: 64 },
  objective: {
    type: "transport",
    collectibleVisual: {
      assetPath: "/assets/socks.svg",
      width: 40,
      height: 40,
    },
    store: {
      platform: "ground",
      offsetX: 600,
      assetPath: "/assets/laundry-washer.svg",
      width: 110,
      height: 110,
    },
    collectibles: [
      { platform: 1, offsetX: 50 },
      { platform: 2, offsetX: 50 },
      { platform: 3, offsetX: 50 },
      { platform: 4, offsetX: 65 },
      { platform: 5, offsetX: 65 },
      { platform: 6, offsetX: 50 },
    ],
  },
  hazards: [
    {
      id: "final-gap",
      kind: "kill",
      zone: {
        x: 650,
        y: WORLD_HEIGHT - 18,
        width: 100,
        height: 18,
      },
    },
  ],
  decor: [
    {
      id: "laundry-sign",
      visual: {
        assetPath: "/assets/store.svg",
        width: 130,
        height: 130,
      },
      position: {
        x: 1120,
        y: 130,
      },
      alpha: 0.22,
    },
  ],
};

export default stage6;
