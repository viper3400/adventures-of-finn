import type { Container, Graphics } from "pixi.js";

export type PlatformId = "ground" | number;

export interface Platform {
  id: PlatformId;
  x: number;
  y: number;
  width: number;
  height: number;
  graphics: Graphics;
  baseX?: number;
  baseY?: number;
  motion?: PlatformMotionState;
}

export interface Player {
  sprite: Container;
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
  motion?: {
    horizontal?: PlatformMotionAxisDefinition;
    vertical?: PlatformMotionAxisDefinition;
  };
}

export interface PlatformMotionAxisDefinition {
  distance: number;
  speed: number;
}

export interface PlatformMotionAxisState extends PlatformMotionAxisDefinition {
  direction: 1 | -1;
  offset: number;
}

export interface PlatformMotionState {
  horizontal?: PlatformMotionAxisState;
  vertical?: PlatformMotionAxisState;
}

export interface PlatformAnchor {
  platform: PlatformId;
  offsetX: number;
}

export interface WorldPoint {
  x: number;
  y: number;
}

export interface SpawnPointDefinition {
  x: number;
  surfaceY: number;
}

export interface RectZoneDefinition {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface VisualDefinition {
  assetPath: string;
  width: number;
  height: number;
}

export interface LevelGoal extends PlatformAnchor {
  width: number;
  height: number;
}

export type CollectibleDefinition = PlatformAnchor;

export interface ChaseCollectibleDefinition extends PlatformAnchor {
  fleeTargets: PlatformAnchor[];
}

export interface StoreDefinition extends PlatformAnchor, VisualDefinition {}

export interface CollectObjective {
  type: "collect";
  collectibleVisual: VisualDefinition;
  collectibles: CollectibleDefinition[];
}

export interface TransportObjective {
  type: "transport";
  collectibleVisual: VisualDefinition;
  collectibles: CollectibleDefinition[];
  store: StoreDefinition;
}

export interface ChaseObjective {
  type: "chase";
  collectibleVisual: VisualDefinition;
  collectibles: ChaseCollectibleDefinition[];
  triggerRadius?: number;
  fleeSpeed?: number;
  escapeSpeed?: number;
}

export type StageObjective =
  | CollectObjective
  | TransportObjective
  | ChaseObjective;
export type StageObjectiveType = StageObjective["type"];

export interface CheckpointDefinition {
  id: string;
  spawn: SpawnPointDefinition;
  label?: string;
}

export type HazardKind = "kill";

export interface HazardDefinition {
  id: string;
  kind: HazardKind;
  zone: RectZoneDefinition;
}

export interface DecorDefinition {
  id: string;
  visual: VisualDefinition;
  position: WorldPoint;
  alpha?: number;
}

export interface StagePresentationDefinition {
  hintText?: string;
  backgroundKey?: string;
  musicKey?: string;
}

export interface TransitionContent {
  speech: string;
  title?: string;
  subtitle?: string;
}

export interface LevelTimingDefinition {
  failSeconds: number;
  oneStarSeconds: number;
  twoStarSeconds: number;
  threeStarSeconds: number;
  hurrySeconds?: number;
}

export type LevelThemeKey = "retroOutdoor" | "retroIndoor";

export interface LevelPresentationDefinition {
  themeKey?: LevelThemeKey;
  musicKey?: string;
  portraitAssetPath?: string;
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

export interface ResolvedCheckpoint {
  id: string;
  x: number;
  y: number;
  label?: string;
}

export interface ResolvedHazard {
  id: string;
  kind: HazardKind;
  zone: RectZoneDefinition;
}

export interface StageDefinition {
  name: string;
  spawn: SpawnPointDefinition;
  platforms: PlatformConfig[];
  goal: LevelGoal;
  objective: StageObjective;
  checkpoints?: CheckpointDefinition[];
  hazards?: HazardDefinition[];
  decor?: DecorDefinition[];
  presentation?: StagePresentationDefinition;
}

export interface LevelDefinition {
  id: string;
  name: string;
  intro: TransitionContent;
  completion: TransitionContent;
  timing: LevelTimingDefinition;
  presentation?: LevelPresentationDefinition;
  stages: StageDefinition[];
}
