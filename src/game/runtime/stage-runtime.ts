import { Container, Graphics, Sprite, Text } from "pixi.js";

import {
  GROUND_HEIGHT,
  PLAYER_FEET_HEIGHT,
  PLAYER_FEET_OFFSET_Y,
  PLAYER_FEET_WIDTH,
  PLAYER_HEIGHT,
  PLAYER_WIDTH,
  WORLD_HEIGHT,
  WORLD_WIDTH,
} from "../constants";
import { LEVELS } from "../levels";
import type {
  LevelDefinition,
  Platform,
  Player,
  ResolvedCollectible,
  ResolvedGoal,
  ResolvedStore,
  StageDefinition,
} from "../types";
import type { GameAssets } from "./assets";

interface DeliveryEffect {
  ageMs: number;
  durationMs: number;
  gfx: Graphics;
  x: number;
  y: number;
}

export interface SpawnPoint {
  x: number;
  y: number;
}

export interface StageRuntime {
  gameWorld: Container;
  loadStage(levelIndex: number, stageIndex: number): void;
  updateViewport(screenWidth: number, screenHeight: number): void;
  toggleDebug(): void;
  getPlatforms(): Platform[];
  getSpawnPoint(): SpawnPoint;
  getCurrentLevel(): LevelDefinition;
  getCurrentStage(): StageDefinition;
  getCurrentLevelIndex(): number;
  getCurrentStageIndex(): number;
  getProgressCount(): number;
  hasCarriedCollectible(): boolean;
  isGoalOpen(): boolean;
  collectItems(playerX: number, playerY: number): boolean;
  deliverCarriedCollectible(playerX: number, playerY: number): boolean;
  updateCarriedCollectiblePosition(playerSprite: Sprite): void;
  dropCarriedCollectible(): boolean;
  updateDeliveryEffects(deltaMs: number): void;
  checkGoalReached(playerX: number, playerY: number): boolean;
  blockClosedGoal(player: Player): void;
}

export function createStageRuntime(assets: GameAssets): StageRuntime {
  const gameWorld = new Container();
  const debugLayer = new Container();
  gameWorld.addChild(debugLayer);

  let debugVisible = false;
  debugLayer.visible = debugVisible;

  const groundY = WORLD_HEIGHT - GROUND_HEIGHT;
  let groundLeft = 0;
  let groundWidth = WORLD_WIDTH;

  const groundGfx = new Graphics()
    .rect(groundLeft, groundY, groundWidth, GROUND_HEIGHT)
    .fill({ color: 0x8b4513 });
  gameWorld.addChild(groundGfx);

  const platforms: Platform[] = [
    {
      id: "ground",
      x: groundLeft,
      y: groundY,
      width: groundWidth,
      height: GROUND_HEIGHT,
      graphics: groundGfx,
    },
  ];

  const goalSprite = new Sprite(assets.goalClosedTexture);
  gameWorld.addChild(goalSprite);

  const levelPlatformGraphics: Graphics[] = [];
  const collectibleSprites: Sprite[] = [];
  const deliveryEffects: DeliveryEffect[] = [];
  const debugTexts: Text[] = [];

  let storeSprite: Sprite | null = null;
  let carriedCollectibleSprite: Sprite | null = null;
  let carriedCollectibleIndex: number | null = null;
  let currentLevelIndex = 0;
  let currentStageIndex = 0;
  let progressCount = 0;
  let spawnPoint: SpawnPoint = {
    x: LEVELS[0].stages[0].spawnX,
    y: getStandingY(LEVELS[0].stages[0].spawnSurfaceY),
  };
  let currentGoal: ResolvedGoal | null = null;
  let currentCollectibles: ResolvedCollectible[] = [];
  let currentStore: ResolvedStore | null = null;

  function getStandingY(surfaceY: number): number {
    return surfaceY - PLAYER_FEET_OFFSET_Y - PLAYER_FEET_HEIGHT / 2;
  }

  function getCurrentLevel(): LevelDefinition {
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
        y: platform.y - stage.collectibleVisual.height / 2 - 8,
        width: stage.collectibleVisual.width,
        height: stage.collectibleVisual.height,
      };
    });
  }

  function resolveStore(stage: StageDefinition): ResolvedStore | null {
    if (!stage.store) {
      return null;
    }

    const platform = getAnchorPlatformBounds(stage, stage.store.platform);
    const x = platform.x + stage.store.offsetX - stage.store.width / 2;
    const y = platform.y - stage.store.height;

    return {
      x,
      y,
      width: stage.store.width,
      height: stage.store.height,
      assetPath: stage.store.assetPath,
    };
  }

  function isTransportStage(stage = getCurrentStage()): boolean {
    return stage.mode === "transport";
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

  function clearDeliveryEffects(): void {
    deliveryEffects.forEach((effect) => {
      gameWorld.removeChild(effect.gfx);
      effect.gfx.destroy();
    });
    deliveryEffects.length = 0;
  }

  function spawnDeliverySuccessEffect(x: number, y: number): void {
    const gfx = new Graphics();
    gameWorld.addChild(gfx);
    deliveryEffects.push({
      ageMs: 0,
      durationMs: 520,
      gfx,
      x,
      y,
    });
  }

  function isGoalCurrentlyOpen(): boolean {
    return progressCount >= getCurrentStage().collectibles.length;
  }

  function redrawGoal(): void {
    if (!currentGoal) {
      return;
    }

    goalSprite.texture = isGoalCurrentlyOpen()
      ? assets.goalOpenTexture
      : assets.goalClosedTexture;
    goalSprite.position.set(currentGoal.x, currentGoal.y);
    goalSprite.width = currentGoal.width;
    goalSprite.height = currentGoal.height;
  }

  return {
    gameWorld,
    loadStage(levelIndex: number, stageIndex: number): void {
      currentLevelIndex = levelIndex;
      currentStageIndex = stageIndex;
      const stage = LEVELS[levelIndex].stages[stageIndex];

      spawnPoint = {
        x: stage.spawnX,
        y: getStandingY(stage.spawnSurfaceY),
      };
      currentGoal = resolveGoal(stage);
      currentCollectibles = resolveCollectibles(stage);
      currentStore = resolveStore(stage);

      platforms.splice(1);
      levelPlatformGraphics.forEach((gfx) => {
        gameWorld.removeChild(gfx);
        gfx.destroy();
      });
      levelPlatformGraphics.length = 0;

      collectibleSprites.forEach((sprite) => {
        gameWorld.removeChild(sprite);
        sprite.destroy();
      });
      collectibleSprites.length = 0;

      if (storeSprite) {
        gameWorld.removeChild(storeSprite);
        storeSprite.destroy();
        storeSprite = null;
      }

      if (carriedCollectibleSprite) {
        gameWorld.removeChild(carriedCollectibleSprite);
        carriedCollectibleSprite.destroy();
        carriedCollectibleSprite = null;
      }

      clearDeliveryEffects();
      carriedCollectibleIndex = null;
      progressCount = 0;

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

      const collectibleTexture = assets.collectibleTextures.get(
        stage.collectibleVisual.assetPath,
      );
      if (!collectibleTexture) {
        throw new Error(
          `Missing collectible texture "${stage.collectibleVisual.assetPath}"`,
        );
      }

      currentCollectibles.forEach((collectible) => {
        const sprite = new Sprite(collectibleTexture);
        sprite.anchor.set(0.5);
        sprite.position.set(collectible.x, collectible.y);
        sprite.width = collectible.width;
        sprite.height = collectible.height;
        collectibleSprites.push(sprite);
        gameWorld.addChild(sprite);
      });

      if (currentStore) {
        const texture = assets.storeTextures.get(currentStore.assetPath);
        if (!texture) {
          throw new Error(`Missing store texture "${currentStore.assetPath}"`);
        }
        storeSprite = new Sprite(texture);
        storeSprite.position.set(currentStore.x, currentStore.y);
        storeSprite.width = currentStore.width;
        storeSprite.height = currentStore.height;
        gameWorld.addChild(storeSprite);
      }

      carriedCollectibleSprite = new Sprite(collectibleTexture);
      carriedCollectibleSprite.anchor.set(0.5);
      carriedCollectibleSprite.visible = false;
      carriedCollectibleSprite.width = stage.collectibleVisual.width;
      carriedCollectibleSprite.height = stage.collectibleVisual.height;
      gameWorld.addChild(carriedCollectibleSprite);

      rebuildDebugOverlay(stage);
      redrawGoal();
    },
    updateViewport(screenWidth: number, screenHeight: number): void {
      const scale = Math.min(
        screenWidth / WORLD_WIDTH,
        screenHeight / WORLD_HEIGHT,
      );
      const visibleWorldWidth = screenWidth / scale;
      const sidePadding = Math.max(0, (visibleWorldWidth - WORLD_WIDTH) / 2);

      gameWorld.scale.set(scale);
      gameWorld.position.set(
        (screenWidth - WORLD_WIDTH * scale) / 2,
        (screenHeight - WORLD_HEIGHT * scale) / 2,
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
    },
    toggleDebug(): void {
      debugVisible = !debugVisible;
      debugLayer.visible = debugVisible;
    },
    getPlatforms(): Platform[] {
      return platforms;
    },
    getSpawnPoint(): SpawnPoint {
      return spawnPoint;
    },
    getCurrentLevel,
    getCurrentStage,
    getCurrentLevelIndex(): number {
      return currentLevelIndex;
    },
    getCurrentStageIndex(): number {
      return currentStageIndex;
    },
    getProgressCount(): number {
      return progressCount;
    },
    hasCarriedCollectible(): boolean {
      return carriedCollectibleIndex !== null;
    },
    isGoalOpen(): boolean {
      return isGoalCurrentlyOpen();
    },
    collectItems(playerX: number, playerY: number): boolean {
      const playerLeft = playerX - PLAYER_WIDTH / 2;
      const playerRight = playerX + PLAYER_WIDTH / 2;
      const playerTop = playerY - PLAYER_HEIGHT / 2;
      const playerBottom = playerY + PLAYER_HEIGHT / 2;
      let didChange = false;

      collectibleSprites.forEach((sprite, index) => {
        if (!sprite.visible) {
          return;
        }

        const collectible = currentCollectibles[index];
        const collectibleLeft = collectible.x - collectible.width / 2;
        const collectibleRight = collectible.x + collectible.width / 2;
        const collectibleTop = collectible.y - collectible.height / 2;
        const collectibleBottom = collectible.y + collectible.height / 2;

        const overlaps =
          playerRight > collectibleLeft &&
          playerLeft < collectibleRight &&
          playerBottom > collectibleTop &&
          playerTop < collectibleBottom;

        if (!overlaps) {
          return;
        }

        if (isTransportStage()) {
          if (carriedCollectibleIndex !== null) {
            return;
          }

          sprite.visible = false;
          carriedCollectibleIndex = index;
          if (carriedCollectibleSprite) {
            carriedCollectibleSprite.visible = true;
          }
          didChange = true;
          return;
        }

        sprite.visible = false;
        progressCount += 1;
        redrawGoal();
        didChange = true;
      });

      return didChange;
    },
    deliverCarriedCollectible(playerX: number, playerY: number): boolean {
      if (
        !isTransportStage() ||
        carriedCollectibleIndex === null ||
        !currentStore
      ) {
        return false;
      }

      const playerLeft = playerX - PLAYER_WIDTH / 2;
      const playerRight = playerX + PLAYER_WIDTH / 2;
      const playerTop = playerY - PLAYER_HEIGHT / 2;
      const playerBottom = playerY + PLAYER_HEIGHT / 2;

      const overlapsStore =
        playerRight > currentStore.x &&
        playerLeft < currentStore.x + currentStore.width &&
        playerBottom > currentStore.y &&
        playerTop < currentStore.y + currentStore.height;

      if (!overlapsStore) {
        return false;
      }

      carriedCollectibleIndex = null;
      if (carriedCollectibleSprite) {
        carriedCollectibleSprite.visible = false;
      }

      spawnDeliverySuccessEffect(
        currentStore.x + currentStore.width / 2,
        currentStore.y + currentStore.height / 2 - 18,
      );
      progressCount += 1;
      redrawGoal();
      return true;
    },
    updateCarriedCollectiblePosition(playerSprite: Sprite): void {
      if (!carriedCollectibleSprite || carriedCollectibleIndex === null) {
        return;
      }

      const facing = Math.sign(playerSprite.scale.x) || 1;
      carriedCollectibleSprite.position.set(
        playerSprite.x + facing * 55,
        playerSprite.y - 10,
      );
    },
    dropCarriedCollectible(): boolean {
      if (carriedCollectibleIndex === null) {
        return false;
      }

      const sprite = collectibleSprites[carriedCollectibleIndex];
      if (sprite) {
        sprite.visible = true;
      }
      carriedCollectibleIndex = null;
      if (carriedCollectibleSprite) {
        carriedCollectibleSprite.visible = false;
      }

      return true;
    },
    updateDeliveryEffects(deltaMs: number): void {
      for (let index = deliveryEffects.length - 1; index >= 0; index -= 1) {
        const effect = deliveryEffects[index];
        effect.ageMs += deltaMs;

        const progress = Math.min(1, effect.ageMs / effect.durationMs);
        const alpha = 1 - progress;
        const ringRadius = 16 + progress * 28;
        const sparkleRadius = 10 + progress * 18;

        effect.gfx
          .clear()
          .circle(effect.x, effect.y, ringRadius)
          .stroke({ color: 0xfff2a8, width: 4, alpha })
          .star(effect.x, effect.y, 6, sparkleRadius, sparkleRadius * 0.45, 0)
          .fill({ color: 0xffd447, alpha: alpha * 0.45 });

        if (effect.ageMs < effect.durationMs) {
          continue;
        }

        gameWorld.removeChild(effect.gfx);
        effect.gfx.destroy();
        deliveryEffects.splice(index, 1);
      }
    },
    checkGoalReached(playerX: number, playerY: number): boolean {
      if (!this.isGoalOpen() || !currentGoal) {
        return false;
      }

      const feetLeft = playerX - PLAYER_FEET_WIDTH / 2;
      const feetRight = playerX + PLAYER_FEET_WIDTH / 2;
      const feetTop = playerY + PLAYER_FEET_OFFSET_Y - PLAYER_FEET_HEIGHT / 2;
      const feetBottom =
        playerY + PLAYER_FEET_OFFSET_Y + PLAYER_FEET_HEIGHT / 2;

      return (
        feetRight > currentGoal.x &&
        feetLeft < currentGoal.x + currentGoal.width &&
        feetBottom > currentGoal.y &&
        feetTop < currentGoal.y + currentGoal.height
      );
    },
    blockClosedGoal(player: Player): void {
      if (this.isGoalOpen() || !currentGoal) {
        return;
      }

      const playerHalfWidth = PLAYER_WIDTH / 2;
      const playerHalfHeight = PLAYER_HEIGHT / 2;
      const playerLeft = player.sprite.x - playerHalfWidth;
      const playerRight = player.sprite.x + playerHalfWidth;
      const playerTop = player.sprite.y - playerHalfHeight;
      const playerBottom = player.sprite.y + playerHalfHeight;

      const overlapsGoal =
        playerRight > currentGoal.x &&
        playerLeft < currentGoal.x + currentGoal.width &&
        playerBottom > currentGoal.y &&
        playerTop < currentGoal.y + currentGoal.height;

      if (!overlapsGoal) {
        return;
      }

      if (
        player.velocityX >= 0 &&
        player.sprite.x < currentGoal.x + currentGoal.width / 2
      ) {
        player.sprite.x = currentGoal.x - playerHalfWidth;
        player.edgeBounceOffsetX = -6;
        return;
      }

      if (
        player.velocityX <= 0 &&
        player.sprite.x > currentGoal.x + currentGoal.width / 2
      ) {
        player.sprite.x = currentGoal.x + currentGoal.width + playerHalfWidth;
        player.edgeBounceOffsetX = 6;
      }
    },
  };
}
