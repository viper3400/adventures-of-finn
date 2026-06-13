import {
  EDGE_BOUNCE_DISTANCE,
  EDGE_BOUNCE_SMOOTHING,
  PLATFORM_LANDING_TOLERANCE,
  PLAYER_FEET_HEIGHT,
  PLAYER_FEET_OFFSET_Y,
  PLAYER_FEET_WIDTH,
  PLAYER_HEIGHT,
  PLAYER_SUPPORT_OFFSET_X,
  PLAYER_WIDTH,
  WORLD_WIDTH,
} from "../constants";

interface RectBounds {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

export interface PlatformBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface HorizontalBoundsResult {
  playerX: number;
  edgeBounceOffsetX: number;
  renderedX: number;
}

export function getPlayerBodyBounds(
  playerX: number,
  playerY: number,
): RectBounds {
  return {
    left: playerX - PLAYER_WIDTH / 2,
    right: playerX + PLAYER_WIDTH / 2,
    top: playerY - PLAYER_HEIGHT / 2,
    bottom: playerY + PLAYER_HEIGHT / 2,
  };
}

export function getPlayerFeetBounds(
  playerX: number,
  playerY: number,
): RectBounds {
  return {
    left: playerX - PLAYER_FEET_WIDTH / 2,
    right: playerX + PLAYER_FEET_WIDTH / 2,
    top: playerY + PLAYER_FEET_OFFSET_Y - PLAYER_FEET_HEIGHT / 2,
    bottom: playerY + PLAYER_FEET_OFFSET_Y + PLAYER_FEET_HEIGHT / 2,
  };
}

export function boundsOverlap(a: RectBounds, b: RectBounds): boolean {
  return (
    a.right > b.left && a.left < b.right && a.bottom > b.top && a.top < b.bottom
  );
}

export function checkFeetOnPlatform(
  playerX: number,
  playerY: number,
  platform: PlatformBounds,
): boolean {
  return boundsOverlap(getPlayerFeetBounds(playerX, playerY), {
    left: platform.x,
    right: platform.x + platform.width,
    top: platform.y,
    bottom: platform.y + platform.height,
  });
}

export function hasPlatformSupport(
  playerX: number,
  platform: PlatformBounds,
  facing: number,
): boolean {
  const supportX = playerX + PLAYER_SUPPORT_OFFSET_X * facing;

  return supportX >= platform.x && supportX <= platform.x + platform.width;
}

export function canLandOnPlatform(
  previousY: number,
  velocityY: number,
  platformY: number,
): boolean {
  return (
    velocityY >= 0 &&
    previousY + PLAYER_FEET_OFFSET_Y + PLAYER_FEET_HEIGHT / 2 <=
      platformY + PLATFORM_LANDING_TOLERANCE
  );
}

export function getLandingY(platformY: number): number {
  return platformY - PLAYER_FEET_OFFSET_Y - PLAYER_FEET_HEIGHT / 2;
}

export function applyHorizontalWorldBounds(
  playerX: number,
  edgeBounceOffsetX: number,
): HorizontalBoundsResult {
  const playerHalfWidth = PLAYER_WIDTH / 2;
  let nextPlayerX = playerX;
  let nextBounceOffsetX = edgeBounceOffsetX;

  if (nextPlayerX < playerHalfWidth) {
    nextPlayerX = playerHalfWidth;
    nextBounceOffsetX = EDGE_BOUNCE_DISTANCE;
  }
  if (nextPlayerX > WORLD_WIDTH - playerHalfWidth) {
    nextPlayerX = WORLD_WIDTH - playerHalfWidth;
    nextBounceOffsetX = -EDGE_BOUNCE_DISTANCE;
  }

  nextBounceOffsetX += (0 - nextBounceOffsetX) * EDGE_BOUNCE_SMOOTHING;

  return {
    playerX: nextPlayerX,
    edgeBounceOffsetX: nextBounceOffsetX,
    renderedX: nextPlayerX + nextBounceOffsetX,
  };
}
