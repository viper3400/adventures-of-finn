import { Sprite, type Container } from "pixi.js";

import {
  AIR_TILT_FACTOR,
  AIR_TILT_LIMIT,
  EDGE_BOUNCE_DISTANCE,
  EDGE_BOUNCE_SMOOTHING,
  GROUND_TILT_SMOOTHING,
  GRAVITY,
  JUMP_POWER,
  MOVE_SPEED,
  PLATFORM_LANDING_TOLERANCE,
  PLAYER_FEET_HEIGHT,
  PLAYER_FEET_OFFSET_Y,
  PLAYER_FEET_WIDTH,
  PLAYER_HEIGHT,
  PLAYER_SUPPORT_OFFSET_X,
  PLAYER_WIDTH,
  WORLD_HEIGHT,
  WORLD_WIDTH,
} from "../constants";
import type { Platform, Player } from "../types";
import type { InputController } from "./input";

export interface PlayerController {
  player: Player;
  sprite: Sprite;
  resetTo(x: number, y: number): void;
  update(input: InputController, platforms: Platform[]): void;
  isOutOfBounds(): boolean;
}

export function createPlayer(
  gameWorld: Container,
  playerTexture: Sprite["texture"],
  spawnX: number,
  spawnY: number,
): PlayerController {
  const playerScaleX = PLAYER_WIDTH / playerTexture.width;
  const playerScaleY = PLAYER_HEIGHT / playerTexture.height;

  const sprite = new Sprite(playerTexture);
  sprite.anchor.set(0.5);
  sprite.position.set(spawnX, spawnY);
  sprite.scale.set(playerScaleX, playerScaleY);
  gameWorld.addChild(sprite);

  const player: Player = {
    sprite,
    velocityX: 0,
    velocityY: 0,
    isJumping: false,
    edgeBounceOffsetX: 0,
  };

  function checkFeetCollision(
    playerX: number,
    playerY: number,
    platform: Platform,
  ): boolean {
    const feetLeft = playerX - PLAYER_FEET_WIDTH / 2;
    const feetRight = playerX + PLAYER_FEET_WIDTH / 2;
    const feetTop = playerY + PLAYER_FEET_OFFSET_Y - PLAYER_FEET_HEIGHT / 2;
    const feetBottom = playerY + PLAYER_FEET_OFFSET_Y + PLAYER_FEET_HEIGHT / 2;

    return (
      feetRight > platform.x &&
      feetLeft < platform.x + platform.width &&
      feetBottom > platform.y &&
      feetTop < platform.y + platform.height
    );
  }

  function hasPlatformSupport(playerX: number, platform: Platform): boolean {
    const facing = Math.sign(sprite.scale.x) || 1;
    const supportX = playerX + PLAYER_SUPPORT_OFFSET_X * facing;

    return supportX >= platform.x && supportX <= platform.x + platform.width;
  }

  return {
    player,
    sprite,
    resetTo(x: number, y: number): void {
      sprite.position.set(x, y);
      player.velocityX = 0;
      player.velocityY = 0;
      player.isJumping = false;
      player.edgeBounceOffsetX = 0;
      sprite.rotation = 0;
    },
    update(input: InputController, platforms: Platform[]): void {
      const previousY = sprite.y;

      player.velocityX = 0;
      if (input.isLeftPressed()) {
        player.velocityX = -MOVE_SPEED;
        sprite.scale.x = -playerScaleX;
      }
      if (input.isRightPressed()) {
        player.velocityX = MOVE_SPEED;
        sprite.scale.x = playerScaleX;
      }

      player.velocityY += GRAVITY;

      sprite.x += player.velocityX;
      sprite.y += player.velocityY;

      player.isJumping = true;

      platforms.forEach((platform) => {
        if (!checkFeetCollision(sprite.x, sprite.y, platform)) {
          return;
        }

        if (!hasPlatformSupport(sprite.x, platform)) {
          return;
        }

        if (
          player.velocityY >= 0 &&
          previousY + PLAYER_FEET_OFFSET_Y + PLAYER_FEET_HEIGHT / 2 <=
            platform.y + PLATFORM_LANDING_TOLERANCE
        ) {
          sprite.y = platform.y - PLAYER_FEET_OFFSET_Y - PLAYER_FEET_HEIGHT / 2;
          player.velocityY = 0;
          player.isJumping = false;
        }
      });

      if (input.canStartJump() && !player.isJumping) {
        player.velocityY = JUMP_POWER;
        input.markJumpUsed();
      }

      if (player.isJumping) {
        const facing = Math.sign(sprite.scale.x) || 1;
        const targetRotation =
          Math.max(
            -AIR_TILT_LIMIT,
            Math.min(AIR_TILT_LIMIT, player.velocityY * AIR_TILT_FACTOR),
          ) * facing;
        sprite.rotation = targetRotation;
      } else {
        sprite.rotation += (0 - sprite.rotation) * GROUND_TILT_SMOOTHING;
      }

      const playerHalfWidth = PLAYER_WIDTH / 2;
      if (sprite.x < playerHalfWidth) {
        sprite.x = playerHalfWidth;
        player.edgeBounceOffsetX = EDGE_BOUNCE_DISTANCE;
      }
      if (sprite.x > WORLD_WIDTH - playerHalfWidth) {
        sprite.x = WORLD_WIDTH - playerHalfWidth;
        player.edgeBounceOffsetX = -EDGE_BOUNCE_DISTANCE;
      }

      player.edgeBounceOffsetX +=
        (0 - player.edgeBounceOffsetX) * EDGE_BOUNCE_SMOOTHING;
      sprite.x += player.edgeBounceOffsetX;
    },
    isOutOfBounds(): boolean {
      return sprite.y > WORLD_HEIGHT + 100;
    },
  };
}
