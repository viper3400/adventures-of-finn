import { GROUND_HEIGHT, WORLD_HEIGHT } from "../../constants";
import type { StageDefinition } from "../../types";

const stage6: StageDefinition = {
  name: "Stage 6",
  spawn: {
    x: 120,
    surfaceY: WORLD_HEIGHT - GROUND_HEIGHT,
  },
  platforms: [
    { id: 1, x: 200, y: WORLD_HEIGHT - 170, w: 110, h: 18 },
    { id: 2, x: 360, y: WORLD_HEIGHT - 280, w: 110, h: 18 },
    { id: 3, x: 520, y: WORLD_HEIGHT - 390, w: 110, h: 18 },
    { id: 4, x: 700, y: WORLD_HEIGHT - 500, w: 120, h: 18 },
    { id: 5, x: 900, y: WORLD_HEIGHT - 400, w: 140, h: 18 },
    { id: 6, x: 1060, y: WORLD_HEIGHT - 250, w: 120, h: 18 },
  ],
  goal: { platform: 5, offsetX: 105, width: 64, height: 64 },
  objective: {
    type: "collect",
    collectibleVisual: {
      assetPath: "/assets/sausage.svg",
      width: 40,
      height: 40,
    },
    collectibles: [
      { platform: "ground", offsetX: 300 },
      { platform: 1, offsetX: 50 },
      { platform: 2, offsetX: 50 },
      { platform: 3, offsetX: 50 },
      { platform: 4, offsetX: 60 },
      { platform: 6, offsetX: 60 },
    ],
  },
  hazards: [
    {
      id: "late-gap",
      kind: "kill",
      zone: {
        x: 810,
        y: WORLD_HEIGHT - 18,
        width: 110,
        height: 18,
      },
    },
  ],
};

export default stage6;
