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

export type StageMode = "collect" | "transport";

export interface LevelGoal extends PlatformAnchor {
  width: number;
  height: number;
}

export type CollectibleConfig = PlatformAnchor;

export interface CollectibleVisualConfig {
  assetPath: string;
  width: number;
  height: number;
}

export interface StoreDefinition extends PlatformAnchor {
  assetPath: string;
  width: number;
  height: number;
}

export interface ResolvedGoal {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ResolvedCollectible {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ResolvedStore {
  x: number;
  y: number;
  width: number;
  height: number;
  assetPath: string;
}

export interface StageDefinition {
  name: string;
  mode: StageMode;
  spawnX: number;
  spawnSurfaceY: number;
  collectibleVisual: CollectibleVisualConfig;
  platforms: PlatformConfig[];
  goal: LevelGoal;
  collectibles: CollectibleConfig[];
  store?: StoreDefinition;
}

export interface LevelDefinition {
  name: string;
  introText: string;
  completionText: string;
  stages: StageDefinition[];
}
