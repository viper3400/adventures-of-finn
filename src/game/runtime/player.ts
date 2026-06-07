import { Container, Graphics, Rectangle, Sprite, Texture } from "pixi.js";

import {
  AIR_TILT_FACTOR,
  AIR_TILT_LIMIT,
  EDGE_BOUNCE_DISTANCE,
  EDGE_BOUNCE_SMOOTHING,
  GROUND_TILT_SMOOTHING,
  GRAVITY,
  JUMP_POWER,
  LEG_AIRBORNE_FRONT_ANGLE,
  LEG_AIRBORNE_REAR_ANGLE,
  LEG_WALK_ANGLE,
  LEG_WALK_SPEED,
  MOVE_SPEED,
  PLATFORM_LANDING_TOLERANCE,
  PLAYER_FEET_HEIGHT,
  PLAYER_FEET_OFFSET_Y,
  PLAYER_FEET_WIDTH,
  PLAYER_HEIGHT,
  PLAYER_SUPPORT_OFFSET_X,
  PLAYER_WIDTH,
  TAIL_WAG_IDLE_ANGLE,
  TAIL_WAG_IDLE_SPEED,
  TAIL_WAG_RUN_ANGLE,
  TAIL_WAG_RUN_SPEED,
  WORLD_HEIGHT,
  WORLD_WIDTH,
} from "../constants";
import type { Platform, Player } from "../types";
import type { InputController } from "./input";

export interface PlayerController {
  player: Player;
  sprite: Container;
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
  type PartDefinition = {
    frame: Rectangle;
    pivotX: number;
    pivotY: number;
    zLayer: "back" | "front";
  };

  function toLocalX(sourceX: number): number {
    return (sourceX - playerTexture.width / 2) * playerScaleX;
  }

  function toLocalY(sourceY: number): number {
    return (sourceY - playerTexture.height / 2) * playerScaleY;
  }

  function createPartSprite(definition: PartDefinition): Sprite {
    const texture = new Texture({
      source: playerTexture.source,
      frame: definition.frame,
    });
    const part = new Sprite(texture);
    part.anchor.set(
      (definition.pivotX - definition.frame.x) / definition.frame.width,
      (definition.pivotY - definition.frame.y) / definition.frame.height,
    );
    part.position.set(toLocalX(definition.pivotX), toLocalY(definition.pivotY));
    part.scale.set(playerScaleX, playerScaleY);
    return part;
  }

  const playerScaleX = PLAYER_WIDTH / playerTexture.width;
  const playerScaleY = PLAYER_HEIGHT / playerTexture.height;
  const tailDefinition: PartDefinition = {
    frame: new Rectangle(96, 132, 470, 470),
    pivotX: 500,
    pivotY: 430,
    zLayer: "back",
  };
  const rearFarLegDefinition: PartDefinition = {
    frame: new Rectangle(372, 532, 220, 420),
    pivotX: 500,
    pivotY: 614,
    zLayer: "back",
  };
  const frontFarLegDefinition: PartDefinition = {
    frame: new Rectangle(1024, 520, 146, 392),
    pivotX: 1090,
    pivotY: 606,
    zLayer: "back",
  };
  const rearNearLegDefinition: PartDefinition = {
    frame: new Rectangle(464, 486, 260, 468),
    pivotX: 608,
    pivotY: 592,
    zLayer: "front",
  };
  const frontNearLegDefinition: PartDefinition = {
    frame: new Rectangle(1038, 474, 264, 476),
    pivotX: 1120,
    pivotY: 594,
    zLayer: "front",
  };

  const sprite = new Container();
  sprite.position.set(spawnX, spawnY);

  const bodySprite = new Sprite(playerTexture);
  bodySprite.anchor.set(0.5);
  bodySprite.scale.set(playerScaleX, playerScaleY);

  const bodyMask = new Graphics();
  bodyMask
    .ellipse(18, -8, 68, 36)
    .fill(0xffffff)
    .ellipse(58, -8, 70, 28)
    .fill(0xffffff)
    .circle(34, -28, 20)
    .fill(0xffffff)
    .circle(62, -18, 24)
    .fill(0xffffff)
    .rect(2, -30, 86, 54)
    .fill(0xffffff)
    .rect(64, -34, 38, 54)
    .fill(0xffffff)
    .circle(8, 6, 16)
    .fill(0xffffff)
    .rect(6, 12, 30, 18)
    .fill(0xffffff);
  bodySprite.mask = bodyMask;

  const tail = createPartSprite(tailDefinition);
  const rearFarLeg = createPartSprite(rearFarLegDefinition);
  const frontFarLeg = createPartSprite(frontFarLegDefinition);
  const rearNearLeg = createPartSprite(rearNearLegDefinition);
  const frontNearLeg = createPartSprite(frontNearLegDefinition);

  sprite.addChild(
    tail,
    rearFarLeg,
    frontFarLeg,
    bodyMask,
    bodySprite,
    rearNearLeg,
    frontNearLeg,
  );
  gameWorld.addChild(sprite);

  const player: Player = {
    sprite,
    velocityX: 0,
    velocityY: 0,
    isJumping: false,
    edgeBounceOffsetX: 0,
  };
  let tailWagPhase = 0;
  let legWalkPhase = 0;

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
      sprite.scale.x = 1;
      tail.rotation = 0;
      tailWagPhase = 0;
      rearFarLeg.rotation = 0;
      frontFarLeg.rotation = 0;
      rearNearLeg.rotation = 0;
      frontNearLeg.rotation = 0;
      legWalkPhase = 0;
    },
    update(input: InputController, platforms: Platform[]): void {
      const previousY = sprite.y;

      player.velocityX = 0;
      if (input.isLeftPressed()) {
        player.velocityX = -MOVE_SPEED;
        sprite.scale.x = -1;
      }
      if (input.isRightPressed()) {
        player.velocityX = MOVE_SPEED;
        sprite.scale.x = 1;
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

      const isRunning = player.velocityX !== 0;
      tailWagPhase += isRunning ? TAIL_WAG_RUN_SPEED : TAIL_WAG_IDLE_SPEED;
      const wagAngle = isRunning ? TAIL_WAG_RUN_ANGLE : TAIL_WAG_IDLE_ANGLE;
      tail.rotation = Math.sin(tailWagPhase) * wagAngle;

      if (player.isJumping) {
        rearFarLeg.rotation +=
          (LEG_AIRBORNE_REAR_ANGLE - rearFarLeg.rotation) * 0.18;
        rearNearLeg.rotation +=
          (LEG_AIRBORNE_REAR_ANGLE - rearNearLeg.rotation) * 0.18;
        frontFarLeg.rotation +=
          (LEG_AIRBORNE_FRONT_ANGLE - frontFarLeg.rotation) * 0.18;
        frontNearLeg.rotation +=
          (LEG_AIRBORNE_FRONT_ANGLE - frontNearLeg.rotation) * 0.18;
        return;
      }

      if (!isRunning) {
        rearFarLeg.rotation += (0 - rearFarLeg.rotation) * 0.22;
        frontNearLeg.rotation += (0 - frontNearLeg.rotation) * 0.22;
        rearNearLeg.rotation += (0 - rearNearLeg.rotation) * 0.22;
        frontFarLeg.rotation += (0 - frontFarLeg.rotation) * 0.22;
        return;
      }

      legWalkPhase += LEG_WALK_SPEED;
      const gaitPhase = Math.sin(legWalkPhase);

      rearFarLeg.rotation = gaitPhase * LEG_WALK_ANGLE;
      frontNearLeg.rotation = gaitPhase * LEG_WALK_ANGLE;
      rearNearLeg.rotation = -gaitPhase * LEG_WALK_ANGLE;
      frontFarLeg.rotation = -gaitPhase * LEG_WALK_ANGLE;
    },
    isOutOfBounds(): boolean {
      return sprite.y > WORLD_HEIGHT + 100;
    },
  };
}
