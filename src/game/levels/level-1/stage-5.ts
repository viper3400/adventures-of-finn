import { GROUND_HEIGHT, WORLD_HEIGHT } from "../../constants";
import type { StageDefinition } from "../../types";

const stage5: StageDefinition = {
  name: "Stage 5",
  spawn: {
    x: 130,
    surfaceY: WORLD_HEIGHT - GROUND_HEIGHT,
  },
  platforms: [
    { id: 1, x: 210, y: WORLD_HEIGHT - 150, w: 150, h: 18 },
    { id: 2, x: 450, y: WORLD_HEIGHT - 240, w: 120, h: 18 },
    { id: 3, x: 620, y: WORLD_HEIGHT - 360, w: 120, h: 18 },
    { id: 4, x: 820, y: WORLD_HEIGHT - 470, w: 140, h: 18 },
    { id: 5, x: 960, y: WORLD_HEIGHT - 290, w: 150, h: 18 },
    { id: 6, x: 1030, y: WORLD_HEIGHT - 150, w: 120, h: 18 },
  ],
  goal: { platform: 4, offsetX: 110, width: 64, height: 64 },
  objective: {
    type: "collect",
    collectibleVisual: {
      assetPath: "/assets/sausage.svg",
      width: 40,
      height: 40,
    },
    collectibles: [
      { platform: "ground", offsetX: 420 },
      { platform: 1, offsetX: 70 },
      { platform: 2, offsetX: 60 },
      { platform: 3, offsetX: 60 },
      { platform: 5, offsetX: 75 },
      { platform: 6, offsetX: 55 },
    ],
  },
  checkpoints: [
    {
      id: "high-climb",
      label: "High Climb",
      spawn: {
        x: 680,
        surfaceY: WORLD_HEIGHT - 360,
      },
    },
  ],
};

export default stage5;
