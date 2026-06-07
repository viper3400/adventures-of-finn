import { GROUND_HEIGHT, WORLD_HEIGHT } from "../../constants";
import type { StageDefinition } from "../../types";

const stage2: StageDefinition = {
  name: "Stage 2",
  mode: "collect",
  spawnX: 120,
  spawnSurfaceY: WORLD_HEIGHT - GROUND_HEIGHT,
  collectibleVisual: {
    assetPath: "/assets/sausage.svg",
    width: 40,
    height: 40,
  },
  platforms: [
    { id: 1, x: 170, y: WORLD_HEIGHT - 120, w: 120, h: 18 },
    { id: 2, x: 360, y: WORLD_HEIGHT - 200, w: 140, h: 18 },
    { id: 3, x: 590, y: WORLD_HEIGHT - 300, w: 130, h: 18 },
    { id: 4, x: 810, y: WORLD_HEIGHT - 380, w: 120, h: 18 },
    { id: 5, x: 1010, y: WORLD_HEIGHT - 250, w: 170, h: 18 },
    { id: 6, x: 840, y: WORLD_HEIGHT - 140, w: 110, h: 18 },
  ],
  goal: { platform: 5, offsetX: 117, width: 64, height: 64 },
  collectibles: [
    { platform: "ground", offsetX: 405 },
    { platform: 1, offsetX: 60 },
    { platform: 2, offsetX: 70 },
    { platform: 3, offsetX: 65 },
    { platform: 4, offsetX: 80 },
    { platform: 6, offsetX: 10 },
  ],
};

export default stage2;
