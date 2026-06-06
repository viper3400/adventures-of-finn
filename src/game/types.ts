import type { Graphics, Sprite } from "pixi.js";

export interface Platform {
  x: number;
  y: number;
  width: number;
  height: number;
  graphics: Graphics;
}

export interface Player {
  sprite: Sprite;
  velocityX: number;
  velocityY: number;
  isJumping: boolean;
  edgeBounceOffsetX: number;
}

export interface PlatformConfig {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface LevelGoal {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface CollectibleConfig {
  x: number;
  y: number;
}

export interface LevelDefinition {
  name: string;
  spawnX: number;
  spawnSurfaceY: number;
  platforms: PlatformConfig[];
  goal: LevelGoal;
  collectibles: CollectibleConfig[];
}
