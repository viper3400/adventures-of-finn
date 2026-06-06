import { GROUND_HEIGHT, WORLD_HEIGHT } from "./constants";
import type { LevelDefinition } from "./types";

export const LEVELS: LevelDefinition[] = [
  {
    name: "Wurst-Strecke",
    introText:
      "Ich liebe Würste. Mein Herrchen liebt Würste bestimmt auch. Ich werde alle Würste einsammeln!",
    completionText:
      "Alle Würste gesammelt. Hmm, wo sind sie denn hin? Ich habe sie vermutlich gefressen, naja, mein Herrchen kann sich ja selber welche kaufen.",
    stages: [
      {
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
      },
      {
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
      },
      {
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
      },
    ],
  },
  {
    name: "Socken-Sause",
    introText:
      "Diesmal nur sammeln reicht nicht. Ich muss jede Wurst ins Laedeli tragen.",
    completionText:
      "Alles geliefert. Das war anstrengend, aber sehr professionell.",
    stages: [
      {
        name: "Stage 1",
        mode: "transport",
        spawnX: 120,
        spawnSurfaceY: WORLD_HEIGHT - GROUND_HEIGHT,
        collectibleVisual: {
          assetPath: "/assets/socks.svg",
          width: 40,
          height: 40,
        },
        store: {
          platform: "ground",
          offsetX: 1040,
          assetPath: "/assets/laundry-washer.svg",
          width: 110,
          height: 110,
        },
        platforms: [
          { id: 1, x: 260, y: WORLD_HEIGHT - 150, w: 160, h: 20 },
          { id: 2, x: 520, y: WORLD_HEIGHT - 260, w: 140, h: 20 },
          { id: 3, x: 760, y: WORLD_HEIGHT - 190, w: 150, h: 20 },
          { id: 4, x: 930, y: WORLD_HEIGHT - 290, w: 170, h: 20 },
        ],
        goal: { platform: 4, offsetX: 135, width: 64, height: 64 },
        collectibles: [
          { platform: "ground", offsetX: 260 },
          { platform: 1, offsetX: 85 },
          { platform: 2, offsetX: 70 },
          { platform: 3, offsetX: 82 },
        ],
      },
    ],
  },
];
