import { GROUND_HEIGHT, WORLD_HEIGHT } from "../../constants";
import type { StageDefinition } from "../../types";

const stage1: StageDefinition = {
  name: "Stage 1",
  mode: "collect",
  spawnX: 100,
  spawnSurfaceY: WORLD_HEIGHT - GROUND_HEIGHT,
  collectibleVisual: {
    assetPath: "/assets/sausage.svg",
    width: 40,
    height: 40,
  },
  platforms: [
    { id: 1, x: 200, y: WORLD_HEIGHT - 150, w: 150, h: 20 },
    { id: 2, x: 450, y: WORLD_HEIGHT - 280, w: 150, h: 20 },
    { id: 3, x: 700, y: WORLD_HEIGHT - 180, w: 150, h: 20 },
    { id: 4, x: 950, y: WORLD_HEIGHT - 280, w: 150, h: 20 },
    { id: 5, x: 400, y: WORLD_HEIGHT - 400, w: 150, h: 20 },
  ],
  goal: { platform: 4, offsetX: 120, width: 64, height: 64 },
  collectibles: [
    { platform: "ground", offsetX: 400 },
    { platform: 1, offsetX: 75 },
    { platform: 2, offsetX: 75 },
    { platform: 3, offsetX: 70 },
    { platform: 5, offsetX: 75 },
  ],
};

export default stage1;
