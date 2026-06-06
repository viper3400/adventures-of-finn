import {
  Application,
  Assets,
  Container,
  Graphics,
  Sprite,
  Text,
  UPDATE_PRIORITY,
} from "pixi.js";

import {
  AIR_TILT_FACTOR,
  AIR_TILT_LIMIT,
  EDGE_BOUNCE_DISTANCE,
  EDGE_BOUNCE_SMOOTHING,
  GROUND_HEIGHT,
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
} from "./constants";
import { LEVELS } from "./levels";
import type { Platform, Player } from "./types";

export async function startGame(): Promise<void> {
  const keys: Record<string, boolean> = {};

  const app = new Application();
  await app.init({ background: "#87CEEB", resizeTo: window, antialias: true });
  document.getElementById("pixi-container")!.appendChild(app.canvas);

  window.addEventListener("keydown", (e) => {
    keys[e.key.toLowerCase()] = true;
  });
  window.addEventListener("keyup", (e) => {
    keys[e.key.toLowerCase()] = false;
  });

  const gameWorld = new Container();
  app.stage.addChild(gameWorld);

  const groundY = WORLD_HEIGHT - GROUND_HEIGHT;
  let groundLeft = 0;
  let groundWidth = WORLD_WIDTH;
  let currentLevelIndex = 0;
  let spawnX = LEVELS[0].spawnX;
  let spawnY =
    LEVELS[0].spawnSurfaceY - PLAYER_FEET_OFFSET_Y - PLAYER_FEET_HEIGHT / 2;

  const platforms: Platform[] = [];
  const levelPlatformGraphics: Graphics[] = [];
  const goalGfx = new Graphics();
  gameWorld.addChild(goalGfx);
  const levelLabel = new Text({
    text: "",
    style: {
      fill: 0xffffff,
      fontSize: 28,
      fontWeight: "700",
      stroke: { color: 0x1f2a44, width: 4 },
    },
  });
  levelLabel.position.set(24, 24);
  app.stage.addChild(levelLabel);

  const groundGfx = new Graphics()
    .rect(groundLeft, groundY, groundWidth, GROUND_HEIGHT)
    .fill({ color: 0x8b4513 });
  gameWorld.addChild(groundGfx);
  platforms.push({
    x: groundLeft,
    y: groundY,
    width: groundWidth,
    height: GROUND_HEIGHT,
    graphics: groundGfx,
  });

  function updateViewport(): void {
    const scale = Math.min(
      app.screen.width / WORLD_WIDTH,
      app.screen.height / WORLD_HEIGHT,
    );
    const visibleWorldWidth = app.screen.width / scale;
    const sidePadding = Math.max(0, (visibleWorldWidth - WORLD_WIDTH) / 2);

    gameWorld.scale.set(scale);
    gameWorld.position.set(
      (app.screen.width - WORLD_WIDTH * scale) / 2,
      (app.screen.height - WORLD_HEIGHT * scale) / 2,
    );

    groundLeft = -sidePadding;
    groundWidth = WORLD_WIDTH + sidePadding * 2;

    groundGfx
      .clear()
      .rect(groundLeft, groundY, groundWidth, GROUND_HEIGHT)
      .fill({ color: 0x8b4513 });

    platforms[0].x = groundLeft;
    platforms[0].width = groundWidth;
  }

  const playerTexture = await Assets.load("/assets/image_comic.png");
  const playerScaleX = PLAYER_WIDTH / playerTexture.width;
  const playerScaleY = PLAYER_HEIGHT / playerTexture.height;

  const playerSprite = new Sprite(playerTexture);
  playerSprite.anchor.set(0.5);
  playerSprite.position.set(spawnX, spawnY);
  playerSprite.scale.set(playerScaleX, playerScaleY);
  gameWorld.addChild(playerSprite);

  const player: Player = {
    sprite: playerSprite,
    velocityX: 0,
    velocityY: 0,
    isJumping: false,
    edgeBounceOffsetX: 0,
  };

  updateViewport();
  app.renderer.on("resize", updateViewport);

  function getStandingY(surfaceY: number): number {
    return surfaceY - PLAYER_FEET_OFFSET_Y - PLAYER_FEET_HEIGHT / 2;
  }

  function resetPlayerToSpawn(): void {
    player.sprite.position.set(spawnX, spawnY);
    player.velocityX = 0;
    player.velocityY = 0;
    player.isJumping = false;
    player.edgeBounceOffsetX = 0;
    player.sprite.rotation = 0;
  }

  function loadLevel(levelIndex: number): void {
    currentLevelIndex = levelIndex;
    const level = LEVELS[levelIndex];

    spawnX = level.spawnX;
    spawnY = getStandingY(level.spawnSurfaceY);

    platforms.splice(1);
    levelPlatformGraphics.forEach((gfx) => {
      gameWorld.removeChild(gfx);
      gfx.destroy();
    });
    levelPlatformGraphics.length = 0;

    level.platforms.forEach((config) => {
      const gfx = new Graphics()
        .rect(config.x, config.y, config.w, config.h)
        .fill({ color: 0x228b22 });
      levelPlatformGraphics.push(gfx);
      gameWorld.addChild(gfx);
      platforms.push({
        x: config.x,
        y: config.y,
        width: config.w,
        height: config.h,
        graphics: gfx,
      });
    });

    goalGfx
      .clear()
      .roundRect(
        level.goal.x,
        level.goal.y,
        level.goal.width,
        level.goal.height,
        10,
      )
      .fill({ color: 0xffd447 })
      .stroke({ color: 0x8b5a00, width: 4 });

    levelLabel.text = `${level.name} / ${LEVELS.length}`;
    resetPlayerToSpawn();
  }

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
    const facing = Math.sign(playerSprite.scale.x) || 1;
    const supportX = playerX + PLAYER_SUPPORT_OFFSET_X * facing;

    return supportX >= platform.x && supportX <= platform.x + platform.width;
  }

  function checkGoalReached(playerX: number, playerY: number): boolean {
    const level = LEVELS[currentLevelIndex];
    const feetLeft = playerX - PLAYER_FEET_WIDTH / 2;
    const feetRight = playerX + PLAYER_FEET_WIDTH / 2;
    const feetTop = playerY + PLAYER_FEET_OFFSET_Y - PLAYER_FEET_HEIGHT / 2;
    const feetBottom = playerY + PLAYER_FEET_OFFSET_Y + PLAYER_FEET_HEIGHT / 2;

    return (
      feetRight > level.goal.x &&
      feetLeft < level.goal.x + level.goal.width &&
      feetBottom > level.goal.y &&
      feetTop < level.goal.y + level.goal.height
    );
  }

  loadLevel(0);

  app.ticker.add(
    () => {
      const previousY = player.sprite.y;

      player.velocityX = 0;
      if (keys["arrowleft"] || keys["a"]) {
        player.velocityX = -MOVE_SPEED;
        playerSprite.scale.x = -playerScaleX;
      }
      if (keys["arrowright"] || keys["d"]) {
        player.velocityX = MOVE_SPEED;
        playerSprite.scale.x = playerScaleX;
      }

      player.velocityY += GRAVITY;

      player.sprite.x += player.velocityX;
      player.sprite.y += player.velocityY;

      player.isJumping = true;

      platforms.forEach((platform) => {
        if (
          checkFeetCollision(player.sprite.x, player.sprite.y, platform) &&
          hasPlatformSupport(player.sprite.x, platform)
        ) {
          if (
            player.velocityY >= 0 &&
            previousY + PLAYER_FEET_OFFSET_Y + PLAYER_FEET_HEIGHT / 2 <=
              platform.y + PLATFORM_LANDING_TOLERANCE
          ) {
            player.sprite.y =
              platform.y - PLAYER_FEET_OFFSET_Y - PLAYER_FEET_HEIGHT / 2;
            player.velocityY = 0;
            player.isJumping = false;
          }
        }
      });

      if ((keys[" "] || keys["w"] || keys["arrowup"]) && !player.isJumping) {
        player.velocityY = JUMP_POWER;
      }

      if (player.isJumping) {
        const facing = Math.sign(playerSprite.scale.x) || 1;
        const targetRotation =
          Math.max(
            -AIR_TILT_LIMIT,
            Math.min(AIR_TILT_LIMIT, player.velocityY * AIR_TILT_FACTOR),
          ) * facing;
        playerSprite.rotation = targetRotation;
      } else {
        playerSprite.rotation +=
          (0 - playerSprite.rotation) * GROUND_TILT_SMOOTHING;
      }

      const playerHalfWidth = PLAYER_WIDTH / 2;
      if (player.sprite.x < playerHalfWidth) {
        player.sprite.x = playerHalfWidth;
        player.edgeBounceOffsetX = EDGE_BOUNCE_DISTANCE;
      }
      if (player.sprite.x > WORLD_WIDTH - playerHalfWidth) {
        player.sprite.x = WORLD_WIDTH - playerHalfWidth;
        player.edgeBounceOffsetX = -EDGE_BOUNCE_DISTANCE;
      }

      player.edgeBounceOffsetX +=
        (0 - player.edgeBounceOffsetX) * EDGE_BOUNCE_SMOOTHING;
      playerSprite.x = player.sprite.x + player.edgeBounceOffsetX;

      if (checkGoalReached(player.sprite.x, player.sprite.y)) {
        loadLevel((currentLevelIndex + 1) % LEVELS.length);
        return;
      }

      if (player.sprite.y > WORLD_HEIGHT + 100) {
        resetPlayerToSpawn();
      }
    },
    undefined,
    UPDATE_PRIORITY.HIGH,
  );
}
