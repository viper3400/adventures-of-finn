import { GROUND_HEIGHT, WORLD_HEIGHT } from "../../constants";
import type { StageDefinition } from "../../types";

const stage6: StageDefinition = {
  name: "Geburtstagstisch",
  spawn: {
    x: 120,
    surfaceY: WORLD_HEIGHT - GROUND_HEIGHT,
  },
  platforms: [
    { id: 1, x: 180, y: WORLD_HEIGHT - 190, w: 125, h: 20 },
    { id: 2, x: 365, y: WORLD_HEIGHT - 360, w: 100, h: 20 },
    { id: 3, x: 540, y: WORLD_HEIGHT - 210, w: 130, h: 20 },
    { id: 4, x: 735, y: WORLD_HEIGHT - 455, w: 110, h: 20 },
    {
      id: 5,
      x: 910,
      y: WORLD_HEIGHT - 285,
      w: 130,
      h: 20,
      motion: {
        vertical: {
          distance: 140,
          speed: 95,
        },
      },
    },
    { id: 6, x: 1085, y: WORLD_HEIGHT - 215, w: 105, h: 20 },
  ],
  goal: { platform: 5, offsetX: 88, width: 64, height: 64 },
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
      { platform: 1, offsetX: 58 },
      { platform: 2, offsetX: 46 },
      { platform: 3, offsetX: 64 },
      { platform: 4, offsetX: 52 },
      { platform: 5, offsetX: 66 },
      { platform: 6, offsetX: 48 },
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
