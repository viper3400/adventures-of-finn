import { GROUND_HEIGHT, WORLD_HEIGHT } from "../../constants";
import type { StageDefinition } from "../../types";

const stage3: StageDefinition = {
  name: "Kuechenweg",
  spawn: {
    x: 135,
    surfaceY: WORLD_HEIGHT - GROUND_HEIGHT,
  },
  platforms: [
    { id: 1, x: 210, y: WORLD_HEIGHT - 165, w: 145, h: 20 },
    { id: 2, x: 430, y: WORLD_HEIGHT - 345, w: 110, h: 20 },
    { id: 3, x: 610, y: WORLD_HEIGHT - 235, w: 140, h: 20 },
    { id: 4, x: 830, y: WORLD_HEIGHT - 435, w: 120, h: 20 },
    { id: 5, x: 1020, y: WORLD_HEIGHT - 255, w: 130, h: 20 },
  ],
  goal: { platform: 4, offsetX: 84, width: 64, height: 64 },
  objective: {
    type: "transport",
    collectibleVisual: {
      assetPath: "/assets/candle.svg",
      width: 38,
      height: 50,
    },
    store: {
      platform: "ground",
      offsetX: 1120,
      assetPath: "/assets/party-table.svg",
      width: 118,
      height: 96,
    },
    collectibles: [
      { platform: "ground", offsetX: 300 },
      { platform: 2, offsetX: 50 },
      { platform: 3, offsetX: 72 },
      { platform: 4, offsetX: 56 },
      { platform: 5, offsetX: 62 },
    ],
  },
  hazards: [
    {
      id: "kitchen-gap",
      kind: "kill",
      zone: {
        x: 510,
        y: WORLD_HEIGHT - 18,
        width: 120,
        height: 18,
      },
    },
  ],
};

export default stage3;
