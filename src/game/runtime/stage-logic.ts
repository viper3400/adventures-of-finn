import {
  GROUND_HEIGHT,
  PLAYER_FEET_HEIGHT,
  PLAYER_FEET_OFFSET_Y,
} from "../constants";
import type {
  LevelGoal,
  PlatformAnchor,
  PlatformId,
  ResolvedCollectible,
  ResolvedGoal,
  ResolvedStore,
  StoreDefinition,
  VisualDefinition,
} from "../types";
import {
  boundsOverlap,
  getPlayerBodyBounds,
  getPlayerFeetBounds,
  type PlatformBounds,
} from "./player-logic";

export interface ChaseTriggerState {
  fleeTargetIndex: number;
}

export interface AnchoredPlatformBounds extends PlatformBounds {
  id: PlatformId;
}

export type ChaseTriggerResolution =
  | { type: "flee"; nextFleeTargetIndex: number }
  | { type: "escape" };

export function getStandingY(surfaceY: number): number {
  return surfaceY - PLAYER_FEET_OFFSET_Y - PLAYER_FEET_HEIGHT / 2;
}

export function getGroundBounds(
  groundLeft: number,
  groundY: number,
  groundWidth: number,
): PlatformBounds {
  return {
    x: groundLeft,
    y: groundY,
    width: groundWidth,
    height: GROUND_HEIGHT,
  };
}

export function resolveAnchoredCollectible(
  platform: PlatformBounds,
  visual: VisualDefinition,
  anchor: PlatformAnchor,
): ResolvedCollectible {
  return {
    x: platform.x + anchor.offsetX,
    y: platform.y - visual.height / 2 - 8,
    width: visual.width,
    height: visual.height,
  };
}

export function resolveAnchoredGoal(
  platform: PlatformBounds,
  goal: LevelGoal,
): ResolvedGoal {
  return {
    x: platform.x + goal.offsetX - goal.width / 2,
    y: platform.y - goal.height,
    width: goal.width,
    height: goal.height,
  };
}

export function resolveAnchoredStore(
  platform: PlatformBounds,
  store: StoreDefinition,
): ResolvedStore {
  return {
    x: platform.x + store.offsetX - store.width / 2,
    y: platform.y - store.height,
    width: store.width,
    height: store.height,
    assetPath: store.assetPath,
  };
}

export function isGoalOpen(
  progressCount: number,
  totalCollectibles: number,
): boolean {
  return progressCount >= totalCollectibles;
}

export function playerTouchesCollectible(
  playerX: number,
  playerY: number,
  collectible: ResolvedCollectible,
): boolean {
  return boundsOverlap(getPlayerBodyBounds(playerX, playerY), {
    left: collectible.x - collectible.width / 2,
    right: collectible.x + collectible.width / 2,
    top: collectible.y - collectible.height / 2,
    bottom: collectible.y + collectible.height / 2,
  });
}

export function playerTouchesStore(
  playerX: number,
  playerY: number,
  store: ResolvedStore,
): boolean {
  return boundsOverlap(getPlayerBodyBounds(playerX, playerY), {
    left: store.x,
    right: store.x + store.width,
    top: store.y,
    bottom: store.y + store.height,
  });
}

export function playerReachesGoal(
  playerX: number,
  playerY: number,
  goal: ResolvedGoal,
): boolean {
  return boundsOverlap(getPlayerFeetBounds(playerX, playerY), {
    left: goal.x,
    right: goal.x + goal.width,
    top: goal.y,
    bottom: goal.y + goal.height,
  });
}

export function resolveChaseTrigger(
  state: ChaseTriggerState,
  fleeTargetCount: number,
): ChaseTriggerResolution {
  if (state.fleeTargetIndex < fleeTargetCount) {
    return {
      type: "flee",
      nextFleeTargetIndex: state.fleeTargetIndex + 1,
    };
  }

  return { type: "escape" };
}

export function isWithinChaseTriggerRadius(
  playerX: number,
  playerY: number,
  collectibleX: number,
  collectibleY: number,
  triggerRadius: number,
): boolean {
  return (
    Math.hypot(playerX - collectibleX, playerY - collectibleY) <= triggerRadius
  );
}

export function getAnchorPlatformBounds(
  anchorPlatform: PlatformId,
  platforms: AnchoredPlatformBounds[],
  groundBounds: AnchoredPlatformBounds,
): PlatformBounds {
  if (anchorPlatform === "ground") {
    return groundBounds;
  }

  const platform = platforms.find((entry) => entry.id === anchorPlatform);
  if (!platform) {
    throw new Error(`Unknown platform anchor "${anchorPlatform}"`);
  }

  return platform;
}
