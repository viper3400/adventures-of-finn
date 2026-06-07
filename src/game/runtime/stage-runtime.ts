import { Container, Graphics, Sprite, Text } from "pixi.js";

import {
  getStageCollectibles,
  getStageCollectibleVisual,
  getStageObjectiveType,
  getStageStore,
} from "../level-schema";
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
  DecorDefinition,
  HazardDefinition,
  LevelDefinition,
  Platform,
  Player,
  ResolvedCheckpoint,
  ResolvedCollectible,
  ResolvedGoal,
  ResolvedHazard,
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
  syncActorLayers(playerSprite: Container): void;
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
  updateCarriedCollectiblePosition(playerSprite: Container): void;
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

  function drawPlatformSurface(
    gfx: Graphics,
    x: number,
    y: number,
    width: number,
    height: number,
    variant: "ground" | "platform",
  ): void {
    const bodyColor = variant === "ground" ? 0x7f4a1f : 0x5c5378;
    const topColor = variant === "ground" ? 0xd3a15c : 0xcab8ff;
    const shadowColor = variant === "ground" ? 0x4d2510 : 0x2a2341;
    const accentColor = variant === "ground" ? 0xb86a2c : 0x8f84bc;
    const inset = Math.min(6, height / 4);
    const stripeStep = 24;
    const blockStep = 32;

    gfx.clear();
    gfx.rect(x, y, width, height).fill({ color: shadowColor });
    gfx
      .rect(x + 4, y + 4, Math.max(0, width - 8), Math.max(0, height - 8))
      .fill({ color: bodyColor });
    gfx
      .rect(x + 4, y + 4, Math.max(0, width - 8), Math.max(8, inset + 6))
      .fill({ color: topColor });

    for (
      let stripeX = x + 10;
      stripeX < x + width - 10;
      stripeX += stripeStep
    ) {
      gfx
        .rect(stripeX, y + inset + 10, 8, Math.max(6, height - inset - 18))
        .fill({ color: accentColor, alpha: 0.4 });
    }

    for (let blockX = x + 8; blockX < x + width - 16; blockX += blockStep) {
      gfx
        .rect(blockX, y + height - 12, 18, 4)
        .fill({ color: 0xffffff, alpha: 0.12 });
    }

    if (variant === "ground") {
      for (let pebbleX = x + 14; pebbleX < x + width - 12; pebbleX += 42) {
        gfx
          .rect(pebbleX, y + height - 22, 10, 6)
          .fill({ color: 0x3c1b0c, alpha: 0.42 });
      }
    } else {
      for (let seamX = x + 14; seamX < x + width - 14; seamX += 30) {
        gfx
          .rect(seamX, y + 10, 3, Math.max(8, height - 20))
          .fill({ color: 0x1d172d, alpha: 0.55 });
        gfx
          .rect(seamX + 3, y + 10, 2, Math.max(8, height - 20))
          .fill({ color: 0xe8deff, alpha: 0.16 });
      }

      gfx
        .rect(x + 8, y + height - 16, Math.max(0, width - 16), 3)
        .fill({ color: 0x201b31, alpha: 0.45 });
    }
  }

  const groundGfx = new Graphics();
  drawPlatformSurface(
    groundGfx,
    groundLeft,
    groundY,
    groundWidth,
    GROUND_HEIGHT,
    "ground",
  );
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
  const decorSprites: Sprite[] = [];
  const deliveryEffects: DeliveryEffect[] = [];
  const debugTexts: Text[] = [];

  let storeSprite: Sprite | null = null;
  let carriedCollectibleSprite: Sprite | null = null;
  let carriedCollectibleIndex: number | null = null;
  let currentLevelIndex = 0;
  let currentStageIndex = 0;
  let progressCount = 0;
  let spawnPoint: SpawnPoint = {
    x: LEVELS[0].stages[0].spawn.x,
    y: getStandingY(LEVELS[0].stages[0].spawn.surfaceY),
  };
  let currentGoal: ResolvedGoal | null = null;
  let currentCollectibles: ResolvedCollectible[] = [];
  let currentStore: ResolvedStore | null = null;
  let currentCheckpoints: ResolvedCheckpoint[] = [];
  let currentHazards: ResolvedHazard[] = [];

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
    const collectibleVisual = getStageCollectibleVisual(stage);

    return getStageCollectibles(stage).map((collectible) => {
      const platform = getAnchorPlatformBounds(stage, collectible.platform);
      return {
        x: platform.x + collectible.offsetX,
        y: platform.y - collectibleVisual.height / 2 - 8,
        width: collectibleVisual.width,
        height: collectibleVisual.height,
      };
    });
  }

  function resolveStore(stage: StageDefinition): ResolvedStore | null {
    const store = getStageStore(stage);
    if (!store) {
      return null;
    }

    const platform = getAnchorPlatformBounds(stage, store.platform);
    const x = platform.x + store.offsetX - store.width / 2;
    const y = platform.y - store.height;

    return {
      x,
      y,
      width: store.width,
      height: store.height,
      assetPath: store.assetPath,
    };
  }

  function resolveCheckpoints(stage: StageDefinition): ResolvedCheckpoint[] {
    return (stage.checkpoints ?? []).map((checkpoint) => ({
      id: checkpoint.id,
      x: checkpoint.spawn.x,
      y: getStandingY(checkpoint.spawn.surfaceY),
      label: checkpoint.label,
    }));
  }

  function resolveHazards(stage: StageDefinition): ResolvedHazard[] {
    return (stage.hazards ?? []).map((hazard: HazardDefinition) => ({
      id: hazard.id,
      kind: hazard.kind,
      zone: { ...hazard.zone },
    }));
  }

  function isTransportStage(stage = getCurrentStage()): boolean {
    return getStageObjectiveType(stage) === "transport";
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
    return progressCount >= getStageCollectibles(getCurrentStage()).length;
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

  function clearDecor(): void {
    decorSprites.forEach((sprite) => {
      gameWorld.removeChild(sprite);
      sprite.destroy();
    });
    decorSprites.length = 0;
  }

  function addDecor(stage: StageDefinition): void {
    (stage.decor ?? []).forEach((decor: DecorDefinition) => {
      const texture = assets.decorTextures.get(decor.visual.assetPath);
      if (!texture) {
        throw new Error(`Missing decor texture "${decor.visual.assetPath}"`);
      }

      const sprite = new Sprite(texture);
      sprite.anchor.set(0.5);
      sprite.position.set(decor.position.x, decor.position.y);
      sprite.width = decor.visual.width;
      sprite.height = decor.visual.height;
      sprite.alpha = decor.alpha ?? 1;
      decorSprites.push(sprite);
      gameWorld.addChildAt(sprite, 1);
    });
  }

  return {
    gameWorld,
    loadStage(levelIndex: number, stageIndex: number): void {
      currentLevelIndex = levelIndex;
      currentStageIndex = stageIndex;
      const stage = LEVELS[levelIndex].stages[stageIndex];
      const collectibleVisual = getStageCollectibleVisual(stage);

      spawnPoint = {
        x: stage.spawn.x,
        y: getStandingY(stage.spawn.surfaceY),
      };
      currentGoal = resolveGoal(stage);
      currentCollectibles = resolveCollectibles(stage);
      currentStore = resolveStore(stage);
      currentCheckpoints = resolveCheckpoints(stage);
      currentHazards = resolveHazards(stage);

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
      clearDecor();

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
        const gfx = new Graphics();
        drawPlatformSurface(
          gfx,
          config.x,
          config.y,
          config.w,
          config.h,
          "platform",
        );
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

      addDecor(stage);

      const collectibleTexture = assets.collectibleTextures.get(
        collectibleVisual.assetPath,
      );
      if (!collectibleTexture) {
        throw new Error(
          `Missing collectible texture "${collectibleVisual.assetPath}"`,
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
      carriedCollectibleSprite.width = collectibleVisual.width;
      carriedCollectibleSprite.height = collectibleVisual.height;
      gameWorld.addChild(carriedCollectibleSprite);

      void currentCheckpoints;
      void currentHazards;

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

      drawPlatformSurface(
        groundGfx,
        groundLeft,
        groundY,
        groundWidth,
        GROUND_HEIGHT,
        "ground",
      );

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
    syncActorLayers(playerSprite: Container): void {
      const debugIndex = gameWorld.getChildIndex(debugLayer);
      const playerIndex = Math.max(0, debugIndex - 1);
      gameWorld.setChildIndex(playerSprite, playerIndex);

      if (carriedCollectibleSprite?.visible) {
        gameWorld.setChildIndex(carriedCollectibleSprite, debugIndex);
      }
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
    updateCarriedCollectiblePosition(playerSprite: Container): void {
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
      void player;
    },
  };
}
