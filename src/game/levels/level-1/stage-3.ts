import { GROUND_HEIGHT, WORLD_HEIGHT } from "../../constants";
import type { StageDefinition } from "../../types";

const stage3: StageDefinition = {
  name: "Stage 3",
  mode: "collect",
  spawnX: 150,
  spawnSurfaceY: WORLD_HEIGHT - GROUND_HEIGHT,
  collectibleVisual: {
    assetPath: "/assets/sausage.svg",
    width: 40,
    height: 40,
  },
  platforms: [
    { id: 1, x: 220, y: WORLD_HEIGHT - 160, w: 120, h: 18 },
    { id: 2, x: 430, y: WORLD_HEIGHT - 250, w: 120, h: 18 },
    { id: 3, x: 650, y: WORLD_HEIGHT - 340, w: 120, h: 18 },
    { id: 4, x: 860, y: WORLD_HEIGHT - 430, w: 120, h: 18 },
    { id: 5, x: 650, y: WORLD_HEIGHT - 550, w: 150, h: 18 },
    { id: 6, x: 380, y: WORLD_HEIGHT - 440, w: 110, h: 18 },
    { id: 7, x: 1020, y: WORLD_HEIGHT - 300, w: 130, h: 18 },
  ],
  goal: { platform: 5, offsetX: 50, width: 64, height: 64 },
  collectibles: [
    { platform: "ground", offsetX: 500 },
    { platform: 1, offsetX: 60 },
    { platform: 2, offsetX: 60 },
    { platform: 3, offsetX: 60 },
    { platform: 4, offsetX: 55 },
    { platform: 6, offsetX: 55 },
    { platform: 7, offsetX: 55 },
  ],
};

export default stage3;
