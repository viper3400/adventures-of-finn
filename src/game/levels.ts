import { GROUND_HEIGHT, WORLD_HEIGHT } from "./constants";
import type { LevelDefinition } from "./types";

export const LEVELS: LevelDefinition[] = [
  {
    name: "Level 1",
    stages: [
      {
        name: "Stage 1",
        spawnX: 100,
        spawnSurfaceY: WORLD_HEIGHT - GROUND_HEIGHT,
        platforms: [
          { id: 1, x: 200, y: WORLD_HEIGHT - 150, w: 150, h: 20 },
          { id: 2, x: 450, y: WORLD_HEIGHT - 280, w: 150, h: 20 },
          { id: 3, x: 700, y: WORLD_HEIGHT - 180, w: 150, h: 20 },
          { id: 4, x: 950, y: WORLD_HEIGHT - 280, w: 150, h: 20 },
          { id: 5, x: 400, y: WORLD_HEIGHT - 400, w: 150, h: 20 },
        ],
        goal: { platform: 4, offsetX: 120, width: 64, height: 64 },
        collectibles: [
          { platform: "ground", offsetX: 150 },
          { platform: 1, offsetX: 75 },
          { platform: 2, offsetX: 75 },
          { platform: 3, offsetX: 70 },
          { platform: 5, offsetX: 75 },
        ],
      },
      {
        name: "Stage 2",
        spawnX: 120,
        spawnSurfaceY: WORLD_HEIGHT - GROUND_HEIGHT,
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
          { platform: "ground", offsetX: 165 },
          { platform: 1, offsetX: 60 },
          { platform: 2, offsetX: 70 },
          { platform: 3, offsetX: 65 },
          { platform: 4, offsetX: 80 },
        ],
      },
      {
        name: "Stage 3",
        spawnX: 150,
        spawnSurfaceY: WORLD_HEIGHT - GROUND_HEIGHT,
        platforms: [
          { id: 1, x: 220, y: WORLD_HEIGHT - 160, w: 120, h: 18 },
          { id: 2, x: 430, y: WORLD_HEIGHT - 250, w: 120, h: 18 },
          { id: 3, x: 650, y: WORLD_HEIGHT - 340, w: 120, h: 18 },
          { id: 4, x: 860, y: WORLD_HEIGHT - 430, w: 120, h: 18 },
          { id: 5, x: 650, y: WORLD_HEIGHT - 550, w: 150, h: 18 },
          { id: 6, x: 380, y: WORLD_HEIGHT - 470, w: 110, h: 18 },
          { id: 7, x: 1020, y: WORLD_HEIGHT - 300, w: 130, h: 18 },
        ],
        goal: { platform: 5, offsetX: 50, width: 64, height: 64 },
        collectibles: [
          { platform: "ground", offsetX: 210 },
          { platform: 1, offsetX: 60 },
          { platform: 2, offsetX: 60 },
          { platform: 3, offsetX: 60 },
          { platform: 4, offsetX: 55 },
        ],
      },
    ],
  },
];
