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
  COLLECTIBLE_RADIUS,
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
import type {
  Platform,
  Player,
  ResolvedCollectible,
  ResolvedGoal,
  StageDefinition,
} from "./types";

export async function startGame(): Promise<void> {
  const keys: Record<string, boolean> = {};
  const LEVEL_INTRO_DURATION_MS = 1800;
  const LEVEL_COMPLETE_DURATION_MS = 1500;

  const app = new Application();
  await app.init({ background: "#87CEEB", resizeTo: window, antialias: true });
  document.getElementById("pixi-container")!.appendChild(app.canvas);

  let debugVisible = false;

  window.addEventListener("keydown", (e) => {
    const key = e.key.toLowerCase();
    keys[key] = true;
    if (key === "l" && !e.repeat) {
      debugVisible = !debugVisible;
      debugLayer.visible = debugVisible;
    }
  });
  window.addEventListener("keyup", (e) => {
    keys[e.key.toLowerCase()] = false;
  });

  const gameWorld = new Container();
  app.stage.addChild(gameWorld);
  const debugLayer = new Container();
  debugLayer.visible = debugVisible;
  gameWorld.addChild(debugLayer);

  const groundY = WORLD_HEIGHT - GROUND_HEIGHT;
  let groundLeft = 0;
  let groundWidth = WORLD_WIDTH;
  let currentLevelIndex = 0;
  let currentStageIndex = 0;
  let spawnX = LEVELS[0].stages[0].spawnX;
  let spawnY =
    LEVELS[0].stages[0].spawnSurfaceY -
    PLAYER_FEET_OFFSET_Y -
    PLAYER_FEET_HEIGHT / 2;
  let transitionTimeRemaining = 0;
  let onTransitionComplete: (() => void) | null = null;

  const platforms: Platform[] = [];
  const levelPlatformGraphics: Graphics[] = [];
  const collectibleGraphics: Graphics[] = [];
  const debugTexts: Text[] = [];
  let collectedCount = 0;
  let currentGoal: ResolvedGoal | null = null;
  let currentCollectibles: ResolvedCollectible[] = [];
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
  const transitionOverlay = new Container();
  const transitionBackdrop = new Graphics();
  const transitionTitle = new Text({
    text: "",
    style: {
      fill: 0xffffff,
      fontSize: 54,
      fontWeight: "800",
      stroke: { color: 0x1f2a44, width: 6 },
    },
  });
  transitionTitle.anchor.set(0.5);
  const transitionSubtitle = new Text({
    text: "",
    style: {
      fill: 0xfff4cf,
      fontSize: 28,
      fontWeight: "700",
      stroke: { color: 0x1f2a44, width: 4 },
    },
  });
  transitionSubtitle.anchor.set(0.5);
  transitionOverlay.visible = false;
  transitionOverlay.addChild(transitionBackdrop);
  transitionOverlay.addChild(transitionTitle);
  transitionOverlay.addChild(transitionSubtitle);
  app.stage.addChild(transitionOverlay);

  const groundGfx = new Graphics()
    .rect(groundLeft, groundY, groundWidth, GROUND_HEIGHT)
    .fill({ color: 0x8b4513 });
  gameWorld.addChild(groundGfx);
  platforms.push({
    id: "ground",
    x: groundLeft,
    y: groundY,
    width: groundWidth,
    height: GROUND_HEIGHT,
    graphics: groundGfx,
  });

  function layoutTransitionOverlay(): void {
    transitionBackdrop
      .clear()
      .rect(0, 0, app.screen.width, app.screen.height)
      .fill({ color: 0x102030, alpha: 0.62 });
    transitionTitle.position.set(
      app.screen.width / 2,
      app.screen.height / 2 - 24,
    );
    transitionSubtitle.position.set(
      app.screen.width / 2,
      app.screen.height / 2 + 32,
    );
  }

  function showTransition(
    title: string,
    subtitle: string,
    durationMs: number,
    onComplete: (() => void) | null = null,
  ): void {
    transitionTitle.text = title;
    transitionSubtitle.text = subtitle;
    transitionTimeRemaining = durationMs;
    onTransitionComplete = onComplete;
    transitionOverlay.visible = true;
    layoutTransitionOverlay();
  }

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

    if (currentGoal) {
      rebuildDebugOverlay(getCurrentStage());
    }

    layoutTransitionOverlay();
  }

  const playerTexture = await Assets.load("/assets/image_comic.png");
  const goalClosedTexture = await Assets.load("/assets/door-closed.svg");
  const goalOpenTexture = await Assets.load("/assets/door-open.svg");
  const playerScaleX = PLAYER_WIDTH / playerTexture.width;
  const playerScaleY = PLAYER_HEIGHT / playerTexture.height;

  const playerSprite = new Sprite(playerTexture);
  playerSprite.anchor.set(0.5);
  playerSprite.position.set(spawnX, spawnY);
  playerSprite.scale.set(playerScaleX, playerScaleY);
  gameWorld.addChild(playerSprite);
  const goalSprite = new Sprite(goalClosedTexture);
  gameWorld.addChild(goalSprite);

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

  function getCurrentLevel() {
    return LEVELS[currentLevelIndex];
  }

  function getCurrentStage(): StageDefinition {
    return getCurrentLevel().stages[currentStageIndex];
  }

  function getAnchorPlatformBounds(
    stage: StageDefinition,
    anchorPlatform: "ground" | number,
  ): { x: number; y: number; width: number; height: number } {
    if (anchorPlatform === "ground") {
      return {
        x: groundLeft,
        y: groundY,
        width: groundWidth,
        height: GROUND_HEIGHT,
      };
    }

    const platform = stage.platforms.find(
      (platformConfig) => platformConfig.id === anchorPlatform,
    );
    if (!platform) {
      throw new Error(`Unknown platform anchor "${anchorPlatform}"`);
    }

    return {
      x: platform.x,
      y: platform.y,
      width: platform.w,
      height: platform.h,
    };
  }

  function resolveGoal(stage: StageDefinition): ResolvedGoal {
    const platform = getAnchorPlatformBounds(stage, stage.goal.platform);
    const x = platform.x + stage.goal.offsetX - stage.goal.width / 2;
    const y = platform.y - stage.goal.height;

    return { x, y, width: stage.goal.width, height: stage.goal.height };
  }

  function resolveCollectibles(stage: StageDefinition): ResolvedCollectible[] {
    return stage.collectibles.map((collectible) => {
      const platform = getAnchorPlatformBounds(stage, collectible.platform);
      return {
        x: platform.x + collectible.offsetX,
        y: platform.y - COLLECTIBLE_RADIUS - 8,
      };
    });
  }

  function isGoalOpen(): boolean {
    return collectedCount >= getCurrentStage().collectibles.length;
  }

  function clearDebugOverlay(): void {
    debugTexts.forEach((text) => {
      debugLayer.removeChild(text);
      text.destroy();
    });
    debugTexts.length = 0;
  }

  function createDebugLabel(text: string, x: number, y: number): void {
    const label = new Text({
      text,
      style: {
        fill: 0xffffff,
        fontSize: 14,
        fontWeight: "700",
        stroke: { color: 0x102030, width: 4 },
      },
    });
    label.position.set(x, y);
    debugTexts.push(label);
    debugLayer.addChild(label);
  }

  function rebuildDebugOverlay(stage: StageDefinition): void {
    clearDebugOverlay();

    createDebugLabel(
      `P0 x:${Math.round(groundLeft)} y:${Math.round(groundY)}`,
      groundLeft + 12,
      groundY - 28,
    );

    stage.platforms.forEach((platform) => {
      createDebugLabel(
        `P${platform.id} x:${platform.x} y:${platform.y}`,
        platform.x + 8,
        platform.y - 28,
      );
    });

    debugLayer.visible = debugVisible;
    gameWorld.setChildIndex(debugLayer, gameWorld.children.length - 1);
  }

  function updateHud(): void {
    const level = getCurrentLevel();
    const stage = getCurrentStage();
    const goalState = isGoalOpen() ? "Open" : "Closed";
    levelLabel.text = `Level ${currentLevelIndex + 1}: ${level.name} - ${stage.name}  Treats ${collectedCount}/${stage.collectibles.length}  Goal ${goalState}`;
  }

  function redrawGoal(): void {
    if (!currentGoal) {
      return;
    }

    goalSprite.texture = isGoalOpen() ? goalOpenTexture : goalClosedTexture;
    goalSprite.position.set(currentGoal.x, currentGoal.y);
    goalSprite.width = currentGoal.width;
    goalSprite.height = currentGoal.height;
  }

  function loadStage(levelIndex: number, stageIndex: number): void {
    currentLevelIndex = levelIndex;
    currentStageIndex = stageIndex;
    const stage = LEVELS[levelIndex].stages[stageIndex];

    spawnX = stage.spawnX;
    spawnY = getStandingY(stage.spawnSurfaceY);
    currentGoal = resolveGoal(stage);
    currentCollectibles = resolveCollectibles(stage);

    platforms.splice(1);
    levelPlatformGraphics.forEach((gfx) => {
      gameWorld.removeChild(gfx);
      gfx.destroy();
    });
    levelPlatformGraphics.length = 0;
    collectibleGraphics.forEach((gfx) => {
      gameWorld.removeChild(gfx);
      gfx.destroy();
    });
    collectibleGraphics.length = 0;
    collectedCount = 0;

    stage.platforms.forEach((config) => {
      const gfx = new Graphics()
        .rect(config.x, config.y, config.w, config.h)
        .fill({ color: 0x228b22 });
      levelPlatformGraphics.push(gfx);
      gameWorld.addChildAt(gfx, 0);
      platforms.push({
        id: config.id,
        x: config.x,
        y: config.y,
        width: config.w,
        height: config.h,
        graphics: gfx,
      });
    });

    currentCollectibles.forEach((collectible) => {
      const gfx = new Graphics()
        .circle(collectible.x, collectible.y, COLLECTIBLE_RADIUS)
        .fill({ color: 0xffd447 })
        .stroke({ color: 0x8b5a00, width: 3 });
      collectibleGraphics.push(gfx);
      gameWorld.addChild(gfx);
    });

    rebuildDebugOverlay(stage);
    redrawGoal();
    updateHud();
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
    if (!isGoalOpen()) {
      return false;
    }

    const feetLeft = playerX - PLAYER_FEET_WIDTH / 2;
    const feetRight = playerX + PLAYER_FEET_WIDTH / 2;
    const feetTop = playerY + PLAYER_FEET_OFFSET_Y - PLAYER_FEET_HEIGHT / 2;
    const feetBottom = playerY + PLAYER_FEET_OFFSET_Y + PLAYER_FEET_HEIGHT / 2;

    if (!currentGoal) {
      return false;
    }

    return (
      feetRight > currentGoal.x &&
      feetLeft < currentGoal.x + currentGoal.width &&
      feetBottom > currentGoal.y &&
      feetTop < currentGoal.y + currentGoal.height
    );
  }

  function collectItems(playerX: number, playerY: number): void {
    const playerLeft = playerX - PLAYER_WIDTH / 2;
    const playerRight = playerX + PLAYER_WIDTH / 2;
    const playerTop = playerY - PLAYER_HEIGHT / 2;
    const playerBottom = playerY + PLAYER_HEIGHT / 2;

    collectibleGraphics.forEach((gfx, index) => {
      if (!gfx.visible) {
        return;
      }

      const collectible = currentCollectibles[index];
      const collectibleLeft = collectible.x - COLLECTIBLE_RADIUS;
      const collectibleRight = collectible.x + COLLECTIBLE_RADIUS;
      const collectibleTop = collectible.y - COLLECTIBLE_RADIUS;
      const collectibleBottom = collectible.y + COLLECTIBLE_RADIUS;

      const overlaps =
        playerRight > collectibleLeft &&
        playerLeft < collectibleRight &&
        playerBottom > collectibleTop &&
        playerTop < collectibleBottom;

      if (!overlaps) {
        return;
      }

      gfx.visible = false;
      collectedCount += 1;
      redrawGoal();
      updateHud();
    });
  }

  function blockClosedGoal(): void {
    if (isGoalOpen()) {
      return;
    }

    if (!currentGoal) {
      return;
    }

    const goal = currentGoal;
    const playerHalfWidth = PLAYER_WIDTH / 2;
    const playerHalfHeight = PLAYER_HEIGHT / 2;
    const playerLeft = player.sprite.x - playerHalfWidth;
    const playerRight = player.sprite.x + playerHalfWidth;
    const playerTop = player.sprite.y - playerHalfHeight;
    const playerBottom = player.sprite.y + playerHalfHeight;

    const overlapsGoal =
      playerRight > goal.x &&
      playerLeft < goal.x + goal.width &&
      playerBottom > goal.y &&
      playerTop < goal.y + goal.height;

    if (!overlapsGoal) {
      return;
    }

    if (player.velocityX >= 0 && player.sprite.x < goal.x + goal.width / 2) {
      player.sprite.x = goal.x - playerHalfWidth;
      player.edgeBounceOffsetX = -EDGE_BOUNCE_DISTANCE;
      return;
    }

    if (player.velocityX <= 0 && player.sprite.x > goal.x + goal.width / 2) {
      player.sprite.x = goal.x + goal.width + playerHalfWidth;
      player.edgeBounceOffsetX = EDGE_BOUNCE_DISTANCE;
    }
  }

  function showLevelIntro(levelIndex: number): void {
    const level = LEVELS[levelIndex];
    showTransition(
      `Level ${levelIndex + 1}`,
      level.name,
      LEVEL_INTRO_DURATION_MS,
    );
  }

  function showLevelComplete(levelIndex: number, onComplete: () => void): void {
    const level = LEVELS[levelIndex];
    showTransition(
      "Level geschafft!",
      `${level.name} abgeschlossen`,
      LEVEL_COMPLETE_DURATION_MS,
      onComplete,
    );
  }

  loadStage(0, 0);
  showLevelIntro(0);

  app.ticker.add(
    () => {
      if (transitionTimeRemaining > 0) {
        transitionTimeRemaining = Math.max(
          0,
          transitionTimeRemaining - app.ticker.deltaMS,
        );
        if (transitionTimeRemaining === 0) {
          transitionOverlay.visible = false;
          const pendingCallback = onTransitionComplete;
          onTransitionComplete = null;
          pendingCallback?.();
        }
        return;
      }

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

      collectItems(player.sprite.x, player.sprite.y);

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

      blockClosedGoal();

      player.edgeBounceOffsetX +=
        (0 - player.edgeBounceOffsetX) * EDGE_BOUNCE_SMOOTHING;
      playerSprite.x = player.sprite.x + player.edgeBounceOffsetX;

      if (checkGoalReached(player.sprite.x, player.sprite.y)) {
        const level = getCurrentLevel();
        const hasNextStage = currentStageIndex + 1 < level.stages.length;
        if (hasNextStage) {
          loadStage(currentLevelIndex, currentStageIndex + 1);
          return;
        }

        const nextLevelIndex = (currentLevelIndex + 1) % LEVELS.length;
        showLevelComplete(currentLevelIndex, () => {
          loadStage(nextLevelIndex, 0);
          showLevelIntro(nextLevelIndex);
        });
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
