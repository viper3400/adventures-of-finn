import { GROUND_HEIGHT, WORLD_HEIGHT } from "../../constants";
import type { StageDefinition } from "../../types";

const stage5: StageDefinition = {
  name: "Party-Ecke",
  spawn: {
    x: 125,
    surfaceY: WORLD_HEIGHT - GROUND_HEIGHT,
  },
  platforms: [
    { id: 1, x: 220, y: WORLD_HEIGHT - 165, w: 120, h: 18 },
    { id: 2, x: 390, y: WORLD_HEIGHT - 265, w: 120, h: 18 },
    { id: 3, x: 560, y: WORLD_HEIGHT - 365, w: 120, h: 18 },
    { id: 4, x: 740, y: WORLD_HEIGHT - 465, w: 120, h: 18 },
    { id: 5, x: 930, y: WORLD_HEIGHT - 345, w: 130, h: 18 },
    { id: 6, x: 1090, y: WORLD_HEIGHT - 225, w: 110, h: 18 },
  ],
  goal: { platform: 4, offsetX: 90, width: 64, height: 64 },
  objective: {
    type: "transport",
    collectibleVisual: {
      assetPath: "/assets/garland.svg",
      width: 66,
      height: 50,
    },
    store: {
      platform: 6,
      offsetX: 56,
      assetPath: "/assets/party-table.svg",
      width: 120,
      height: 98,
    },
    collectibles: [
      { platform: "ground", offsetX: 420 },
      { platform: 1, offsetX: 55 },
      { platform: 2, offsetX: 55 },
      { platform: 3, offsetX: 55 },
      { platform: 5, offsetX: 65 },
    ],
  },
  checkpoints: [
    {
      id: "party-corner",
      label: "Party-Ecke",
      spawn: {
        x: 790,
        surfaceY: WORLD_HEIGHT - 465,
      },
    },
  ],
};

export default stage5;
