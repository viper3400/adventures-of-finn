import type { Graphics, Sprite } from "pixi.js";

export interface Platform {
  id: "ground" | number;
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
  id: number;
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface PlatformAnchor {
  platform: "ground" | number;
  offsetX: number;
}

export interface LevelGoal extends PlatformAnchor {
  width: number;
  height: number;
}

export type CollectibleConfig = PlatformAnchor;

export interface ResolvedGoal {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ResolvedCollectible {
  x: number;
  y: number;
}

export interface StageDefinition {
  name: string;
  spawnX: number;
  spawnSurfaceY: number;
  platforms: PlatformConfig[];
  goal: LevelGoal;
  collectibles: CollectibleConfig[];
}

export interface LevelDefinition {
  name: string;
  stages: StageDefinition[];
}
