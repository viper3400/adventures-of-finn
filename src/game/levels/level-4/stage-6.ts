import { GROUND_HEIGHT, WORLD_HEIGHT } from "../../constants";
import type { StageDefinition } from "../../types";

const stage6: StageDefinition = {
  name: "Geburtstagstisch",
  spawn: {
    x: 120,
    surfaceY: WORLD_HEIGHT - GROUND_HEIGHT,
  },
  platforms: [
    { id: 1, x: 180, y: WORLD_HEIGHT - 170, w: 130, h: 20 },
    { id: 2, x: 355, y: WORLD_HEIGHT - 285, w: 110, h: 20 },
    { id: 3, x: 525, y: WORLD_HEIGHT - 385, w: 130, h: 20 },
    { id: 4, x: 715, y: WORLD_HEIGHT - 285, w: 130, h: 20 },
    {
      id: 5,
      x: 900,
      y: WORLD_HEIGHT - 255,
      w: 130,
      h: 20,
      motion: {
        vertical: {
          distance: 90,
          speed: 95,
        },
      },
    },
    { id: 6, x: 1080, y: WORLD_HEIGHT - 340, w: 110, h: 20 },
  ],
  goal: { platform: 6, offsetX: 80, width: 64, height: 64 },
  objective: {
    type: "transport",
    collectibleVisual: {
      assetPath: "/assets/gift-ribbon.svg",
      width: 42,
      height: 42,
    },
    store: {
      platform: "ground",
      offsetX: 620,
      assetPath: "/assets/party-table.svg",
      width: 132,
      height: 108,
    },
    collectibles: [
      { platform: 1, offsetX: 62 },
      { platform: 2, offsetX: 54 },
      { platform: 3, offsetX: 64 },
      { platform: 4, offsetX: 72 },
      { platform: 5, offsetX: 66 },
      { platform: 6, offsetX: 52 },
    ],
  },
  hazards: [
    {
      id: "table-gap",
      kind: "kill",
      zone: {
        x: 620,
        y: WORLD_HEIGHT - 18,
        width: 130,
        height: 18,
      },
    },
  ],
};

export default stage6;
