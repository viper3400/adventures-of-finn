import { GROUND_HEIGHT, WORLD_HEIGHT } from "../../constants";
import type { StageDefinition } from "../../types";

const stage1: StageDefinition = {
  name: "Wohnzimmer-Deko",
  spawn: {
    x: 120,
    surfaceY: WORLD_HEIGHT - GROUND_HEIGHT,
  },
  platforms: [
    { id: 1, x: 210, y: WORLD_HEIGHT - 185, w: 170, h: 20 },
    { id: 2, x: 470, y: WORLD_HEIGHT - 330, w: 130, h: 20 },
    { id: 3, x: 690, y: WORLD_HEIGHT - 175, w: 170, h: 20 },
    { id: 4, x: 940, y: WORLD_HEIGHT - 355, w: 180, h: 20 },
  ],
  goal: { platform: 4, offsetX: 126, width: 64, height: 64 },
  objective: {
    type: "transport",
    collectibleVisual: {
      assetPath: "/assets/party-hat.svg",
      width: 44,
      height: 44,
    },
    store: {
      platform: "ground",
      offsetX: 1080,
      assetPath: "/assets/party-table.svg",
      width: 128,
      height: 106,
    },
    collectibles: [
      { platform: "ground", offsetX: 240 },
      { platform: 1, offsetX: 88 },
      { platform: 2, offsetX: 62 },
      { platform: 3, offsetX: 92 },
    ],
  },
};

export default stage1;
