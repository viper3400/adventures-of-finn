import { GROUND_HEIGHT, WORLD_HEIGHT } from "../../constants";
import type { StageDefinition } from "../../types";

const stage4: StageDefinition = {
  name: "Stage 4",
  spawn: {
    x: 110,
    surfaceY: WORLD_HEIGHT - GROUND_HEIGHT,
  },
  platforms: [
    { id: 1, x: 180, y: WORLD_HEIGHT - 170, w: 120, h: 18 },
    { id: 2, x: 360, y: WORLD_HEIGHT - 280, w: 140, h: 18 },
    { id: 3, x: 560, y: WORLD_HEIGHT - 170, w: 120, h: 18 },
    { id: 4, x: 730, y: WORLD_HEIGHT - 310, w: 150, h: 18 },
    { id: 5, x: 960, y: WORLD_HEIGHT - 220, w: 130, h: 18 },
    { id: 6, x: 1090, y: WORLD_HEIGHT - 360, w: 110, h: 18 },
  ],
  goal: { platform: 6, offsetX: 82, width: 64, height: 64 },
  objective: {
    type: "collect",
    collectibleVisual: {
      assetPath: "/assets/sausage.svg",
      width: 40,
      height: 40,
    },
    collectibles: [
      { platform: "ground", offsetX: 340 },
      { platform: 1, offsetX: 60 },
      { platform: 2, offsetX: 70 },
      { platform: 3, offsetX: 60 },
      { platform: 4, offsetX: 80 },
      { platform: 5, offsetX: 65 },
    ],
  },
  hazards: [
    {
      id: "floor-gap",
      kind: "kill",
      zone: {
        x: 470,
        y: WORLD_HEIGHT - 18,
        width: 90,
        height: 18,
      },
    },
  ],
};

export default stage4;
