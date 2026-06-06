import { GROUND_HEIGHT, WORLD_HEIGHT } from "./constants";
import type { LevelDefinition } from "./types";

export const LEVELS: LevelDefinition[] = [
  {
    name: "Level 1",
    spawnX: 100,
    spawnSurfaceY: WORLD_HEIGHT - GROUND_HEIGHT,
    platforms: [
      { x: 200, y: WORLD_HEIGHT - 150, w: 150, h: 20 },
      { x: 450, y: WORLD_HEIGHT - 280, w: 150, h: 20 },
      { x: 700, y: WORLD_HEIGHT - 180, w: 150, h: 20 },
      { x: 950, y: WORLD_HEIGHT - 280, w: 150, h: 20 },
      { x: 400, y: WORLD_HEIGHT - 400, w: 150, h: 20 },
    ],
    goal: { x: 1080, y: WORLD_HEIGHT - 330, width: 44, height: 50 },
  },
  {
    name: "Level 2",
    spawnX: 120,
    spawnSurfaceY: WORLD_HEIGHT - GROUND_HEIGHT,
    platforms: [
      { x: 170, y: WORLD_HEIGHT - 120, w: 120, h: 18 },
      { x: 360, y: WORLD_HEIGHT - 200, w: 140, h: 18 },
      { x: 590, y: WORLD_HEIGHT - 300, w: 130, h: 18 },
      { x: 810, y: WORLD_HEIGHT - 380, w: 120, h: 18 },
      { x: 1010, y: WORLD_HEIGHT - 250, w: 170, h: 18 },
      { x: 840, y: WORLD_HEIGHT - 140, w: 110, h: 18 },
    ],
    goal: { x: 1105, y: WORLD_HEIGHT - 300, width: 40, height: 50 },
  },
  {
    name: "Level 3",
    spawnX: 150,
    spawnSurfaceY: WORLD_HEIGHT - GROUND_HEIGHT,
    platforms: [
      { x: 220, y: WORLD_HEIGHT - 160, w: 120, h: 18 },
      { x: 430, y: WORLD_HEIGHT - 250, w: 120, h: 18 },
      { x: 650, y: WORLD_HEIGHT - 340, w: 120, h: 18 },
      { x: 860, y: WORLD_HEIGHT - 430, w: 120, h: 18 },
      { x: 660, y: WORLD_HEIGHT - 520, w: 150, h: 18 },
      { x: 380, y: WORLD_HEIGHT - 470, w: 110, h: 18 },
      { x: 1020, y: WORLD_HEIGHT - 300, w: 130, h: 18 },
    ],
    goal: { x: 710, y: WORLD_HEIGHT - 570, width: 44, height: 50 },
  },
];
