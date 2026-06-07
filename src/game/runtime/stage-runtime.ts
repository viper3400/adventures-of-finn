import { Container, Graphics, Sprite, Text } from "pixi.js";

import {
  getStageCollectibles,
  getStageCollectibleVisual,
  getStageObjectiveType,
  getStageStore,
} from "../level-schema";
import {
  CHASE_ESCAPE_SPEED,
  CHASE_FLEE_SPEED,
  CHASE_TRIGGER_RADIUS,
  GROUND_HEIGHT,
  PLAYER_FEET_HEIGHT,
  PLAYER_FEET_OFFSET_Y,
  PLAYER_FEET_WIDTH,
  PLAYER_HEIGHT,
  PLAYER_SUPPORT_OFFSET_X,
  PLAYER_WIDTH,
  WORLD_HEIGHT,
  WORLD_WIDTH,
} from "../constants";
import { LEVELS } from "../levels";
import type {
  ChaseCollectibleDefinition,
  DecorDefinition,
  HazardDefinition,
  LevelDefinition,
  LevelThemeKey,
  Platform,
  PlatformId,
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
  delayMs: number;
  durationMs: number;
  gfx: Graphics;
  x: number;
  y: number;
}

interface ChaseCrowRuntime {
  completed: boolean;
  cooldownMs: number;
  currentAnchor: PlatformId;
  currentOffsetX: number;
  fleeingTo: { platform: PlatformId; offsetX: number } | null;
  fleeTargetIndex: number;
  isEscaping: boolean;
  isFlying: boolean;
  targetX: number;
  targetY: number;
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
  isDebugVisible(): boolean;
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
  updateChaseCollectibles(
    deltaMs: number,
    playerX: number,
    playerY: number,
  ): boolean;
  updateMovingPlatforms(deltaMs: number, player: Player): void;
  updateDeliveryEffects(deltaMs: number): void;
  checkGoalReached(playerX: number, playerY: number): boolean;
  blockClosedGoal(player: Player): void;
}

export function createStageRuntime(assets: GameAssets): StageRuntime {
  const gameWorld = new Container();
  const backgroundGfx = new Graphics();
  const debugLayer = new Container();
  gameWorld.addChild(debugLayer);
  gameWorld.addChildAt(backgroundGfx, 0);

  let debugVisible = false;
  debugLayer.visible = debugVisible;

  const groundY = WORLD_HEIGHT - GROUND_HEIGHT;
  let groundLeft = 0;
  let groundWidth = WORLD_WIDTH;

  function drawRetroOutdoorBackground(gfx: Graphics): void {
    const visibleLeft = groundLeft;
    const visibleWidth = groundWidth;
    const farHillY = WORLD_HEIGHT - GROUND_HEIGHT - 150;
    const midHillY = WORLD_HEIGHT - GROUND_HEIGHT - 108;
    const nearHillY = WORLD_HEIGHT - GROUND_HEIGHT - 58;
    const cloudLayout = [
      { x: visibleLeft + visibleWidth * 0.14, y: 118, scale: 1 },
      { x: visibleLeft + visibleWidth * 0.38, y: 86, scale: 0.82 },
      { x: visibleLeft + visibleWidth * 0.66, y: 132, scale: 1.08 },
      { x: visibleLeft + visibleWidth * 0.88, y: 96, scale: 0.76 },
    ];

    gfx.clear();
    gfx.rect(visibleLeft, 0, visibleWidth, WORLD_HEIGHT).fill({
      color: 0x83d6ff,
    });
    gfx
      .rect(visibleLeft, WORLD_HEIGHT * 0.5, visibleWidth, WORLD_HEIGHT * 0.5)
      .fill({ color: 0xd9f4ff });

    for (let stripeY = 68; stripeY < 290; stripeY += 28) {
      gfx
        .rect(visibleLeft, stripeY, visibleWidth, 6)
        .fill({ color: 0xffffff, alpha: 0.08 });
    }

    gfx
      .ellipse(visibleLeft + visibleWidth * 0.16, farHillY, 250, 88)
      .fill({ color: 0x78ca84 })
      .ellipse(visibleLeft + visibleWidth * 0.45, farHillY + 10, 320, 102)
      .fill({ color: 0x78ca84 })
      .ellipse(visibleLeft + visibleWidth * 0.8, farHillY + 2, 290, 94)
      .fill({ color: 0x78ca84 });

    gfx
      .ellipse(visibleLeft + visibleWidth * 0.08, midHillY + 10, 240, 88)
      .fill({ color: 0x57a96d })
      .ellipse(visibleLeft + visibleWidth * 0.34, midHillY - 4, 286, 110)
      .fill({ color: 0x57a96d })
      .ellipse(visibleLeft + visibleWidth * 0.62, midHillY + 6, 256, 96)
      .fill({ color: 0x57a96d })
      .ellipse(visibleLeft + visibleWidth * 0.9, midHillY - 2, 220, 82)
      .fill({ color: 0x57a96d });

    gfx
      .ellipse(visibleLeft + visibleWidth * 0.22, nearHillY + 8, 250, 84)
      .fill({ color: 0x326f4a })
      .ellipse(visibleLeft + visibleWidth * 0.52, nearHillY - 6, 328, 100)
      .fill({ color: 0x326f4a })
      .ellipse(visibleLeft + visibleWidth * 0.82, nearHillY + 10, 264, 88)
      .fill({ color: 0x326f4a });

    cloudLayout.forEach(({ x, y, scale }) => {
      const p = 18 * scale;
      gfx
        .roundRect(x - 3.4 * p, y - 0.4 * p, 6.8 * p, 1.8 * p, 10 * scale)
        .fill({ color: 0xd2edf8, alpha: 0.92 })
        .circle(x - 2.1 * p, y + 0.1 * p, 1.15 * p)
        .fill({ color: 0xfbfffd })
        .circle(x - 0.55 * p, y - 0.55 * p, 1.4 * p)
        .fill({ color: 0xfbfffd })
        .circle(x + 1.2 * p, y - 0.05 * p, 1.12 * p)
        .fill({ color: 0xfbfffd })
        .roundRect(x - 3.6 * p, y + 0.15 * p, 7.2 * p, 1.45 * p, 10 * scale)
        .fill({ color: 0xfbfffd });
    });
  }

  function drawRetroIndoorBackground(gfx: Graphics): void {
    const visibleLeft = groundLeft;
    const visibleWidth = groundWidth;
    const visibleRight = visibleLeft + visibleWidth;
    const backWallY = WORLD_HEIGHT - GROUND_HEIGHT - 210;
    const floorTopY = WORLD_HEIGHT - GROUND_HEIGHT - 34;

    gfx.clear();
    gfx.rect(visibleLeft, 0, visibleWidth, WORLD_HEIGHT).fill({
      color: 0x21182a,
    });
    gfx
      .rect(visibleLeft, 0, visibleWidth, WORLD_HEIGHT - GROUND_HEIGHT - 14)
      .fill({ color: 0x31233d });

    for (let stripeY = 54; stripeY < floorTopY - 24; stripeY += 34) {
      gfx
        .rect(visibleLeft, stripeY, visibleWidth, 8)
        .fill({ color: 0x4a375d, alpha: 0.34 });
    }

    for (
      let panelX = visibleLeft + 22;
      panelX < visibleRight - 22;
      panelX += 86
    ) {
      gfx
        .rect(panelX, 42, 6, floorTopY - 70)
        .fill({ color: 0x58426f, alpha: 0.4 });
    }

    gfx
      .rect(visibleLeft, backWallY, visibleWidth, 30)
      .fill({ color: 0x4a3557 })
      .rect(visibleLeft, backWallY + 12, visibleWidth, 6)
      .fill({ color: 0x8d6fb0, alpha: 0.4 });

    gfx
      .rect(visibleLeft, floorTopY, visibleWidth, WORLD_HEIGHT - floorTopY)
      .fill({ color: 0x5b3d2c });

    for (
      let boardX = visibleLeft - 20;
      boardX < visibleRight + 40;
      boardX += 44
    ) {
      gfx
        .rect(boardX, floorTopY, 8, WORLD_HEIGHT - floorTopY)
        .fill({ color: 0x744d34, alpha: 0.62 });
    }

    for (let plankY = floorTopY + 18; plankY < WORLD_HEIGHT; plankY += 28) {
      gfx
        .rect(visibleLeft, plankY, visibleWidth, 4)
        .fill({ color: 0x8d6245, alpha: 0.32 });
    }
  }

  function drawBackgroundForLevel(level: LevelDefinition): void {
    const themeKey: LevelThemeKey =
      level.presentation?.themeKey ?? "retroOutdoor";

    if (themeKey === "retroIndoor") {
      drawRetroIndoorBackground(backgroundGfx);
      return;
    }

    drawRetroOutdoorBackground(backgroundGfx);
  }

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
  drawBackgroundForLevel(LEVELS[0]);
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
  let chaseCrowStates: ChaseCrowRuntime[] = [];
  let wasGoalOpen = false;

  function getStandingY(surfaceY: number): number {
    return surfaceY - PLAYER_FEET_OFFSET_Y - PLAYER_FEET_HEIGHT / 2;
  }

  function getCurrentLevel(): LevelDefinition {
    return LEVELS[currentLevelIndex];
  }

  function getCurrentStage(): StageDefinition {
    return getCurrentLevel().stages[currentStageIndex];
  }

  function getAnchorPlatformBounds(anchorPlatform: PlatformId): {
    x: number;
    y: number;
    width: number;
    height: number;
  } {
    if (anchorPlatform === "ground") {
      return {
        x: groundLeft,
        y: groundY,
        width: groundWidth,
        height: GROUND_HEIGHT,
      };
    }

    const platform = platforms.find(
      (platformEntry) => platformEntry.id === anchorPlatform,
    );
    if (!platform) {
      throw new Error(`Unknown platform anchor "${anchorPlatform}"`);
    }

    return {
      x: platform.x,
      y: platform.y,
      width: platform.width,
      height: platform.height,
    };
  }

  function resolveGoal(stage: StageDefinition): ResolvedGoal {
    const platform = getAnchorPlatformBounds(stage.goal.platform);
    const x = platform.x + stage.goal.offsetX - stage.goal.width / 2;
    const y = platform.y - stage.goal.height;

    return { x, y, width: stage.goal.width, height: stage.goal.height };
  }

  function resolveCollectibleFromAnchor(
    anchorPlatform: PlatformId,
    offsetX: number,
  ): ResolvedCollectible {
    const collectibleVisual = getStageCollectibleVisual(getCurrentStage());
    const platform = getAnchorPlatformBounds(anchorPlatform);

    return {
      x: platform.x + offsetX,
      y: platform.y - collectibleVisual.height / 2 - 8,
      width: collectibleVisual.width,
      height: collectibleVisual.height,
    };
  }

  function resolveCollectibles(stage: StageDefinition): ResolvedCollectible[] {
    return getStageCollectibles(stage).map((collectible) => {
      return resolveCollectibleFromAnchor(
        collectible.platform,
        collectible.offsetX,
      );
    });
  }

  function resolveStore(stage: StageDefinition): ResolvedStore | null {
    const store = getStageStore(stage);
    if (!store) {
      return null;
    }

    const platform = getAnchorPlatformBounds(store.platform);
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

  function isChaseStage(stage = getCurrentStage()): boolean {
    return getStageObjectiveType(stage) === "chase";
  }

  function getChaseCollectibles(
    stage = getCurrentStage(),
  ): ChaseCollectibleDefinition[] {
    return stage.objective.type === "chase" ? stage.objective.collectibles : [];
  }

  function getChaseTriggerRadius(stage = getCurrentStage()): number {
    return stage.objective.type === "chase"
      ? (stage.objective.triggerRadius ?? CHASE_TRIGGER_RADIUS)
      : CHASE_TRIGGER_RADIUS;
  }

  function getChaseFleeSpeed(stage = getCurrentStage()): number {
    return stage.objective.type === "chase"
      ? (stage.objective.fleeSpeed ?? CHASE_FLEE_SPEED)
      : CHASE_FLEE_SPEED;
  }

  function getChaseEscapeSpeed(stage = getCurrentStage()): number {
    return stage.objective.type === "chase"
      ? (stage.objective.escapeSpeed ?? CHASE_ESCAPE_SPEED)
      : CHASE_ESCAPE_SPEED;
  }

  function isPlayerStandingOnPlatform(
    player: Player,
    platform: Platform,
  ): boolean {
    const playerX = player.sprite.x;
    const playerY = player.sprite.y;
    const facing = Math.sign(player.sprite.scale.x) || 1;
    const supportX = playerX + PLAYER_SUPPORT_OFFSET_X * facing;
    const feetBottom = playerY + PLAYER_FEET_OFFSET_Y + PLAYER_FEET_HEIGHT / 2;
    const alignedToTop = Math.abs(feetBottom - platform.y) <= 2;

    return (
      !player.isJumping &&
      alignedToTop &&
      supportX >= platform.x &&
      supportX <= platform.x + platform.width
    );
  }

  function refreshDynamicAnchors(): void {
    const stage = getCurrentStage();

    currentGoal = resolveGoal(stage);
    currentCollectibles = resolveCollectibles(stage);
    currentStore = resolveStore(stage);

    if (isChaseStage(stage)) {
      collectibleSprites.forEach((sprite, index) => {
        const chaseState = chaseCrowStates[index];
        if (!chaseState || chaseState.completed || chaseState.isFlying) {
          return;
        }

        const collectible = resolveCollectibleFromAnchor(
          chaseState.currentAnchor,
          chaseState.currentOffsetX,
        );
        currentCollectibles[index] = collectible;
        sprite.position.set(collectible.x, collectible.y);
        sprite.width = collectible.width;
        sprite.height = collectible.height;
      });
    } else {
      collectibleSprites.forEach((sprite, index) => {
        const collectible = currentCollectibles[index];
        sprite.position.set(collectible.x, collectible.y);
        sprite.width = collectible.width;
        sprite.height = collectible.height;
      });
    }

    if (storeSprite && currentStore) {
      storeSprite.position.set(currentStore.x, currentStore.y);
      storeSprite.width = currentStore.width;
      storeSprite.height = currentStore.height;
    }

    redrawGoal();
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

  function rebuildDebugOverlay(): void {
    clearDebugOverlay();

    createDebugLabel(
      `P0 x:${Math.round(groundLeft)} y:${Math.round(groundY)}`,
      groundLeft + 12,
      groundY - 28,
    );

    platforms.slice(1).forEach((platform) => {
      createDebugLabel(
        `P${platform.id} x:${Math.round(platform.baseX ?? platform.x)} y:${Math.round(platform.baseY ?? platform.y)}`,
        platform.x + 8,
        platform.y - 28,
      );
    });

    createDebugLabel(
      `Goal ${isGoalCurrentlyOpen() ? "Open" : "Closed"}  Carrying ${carriedCollectibleIndex === null ? "No" : "Yes"}`,
      groundLeft + 12,
      groundY + 16,
    );

    debugLayer.visible = debugVisible;
    gameWorld.setChildIndex(debugLayer, gameWorld.children.length - 1);
  }

  function refreshDebugOverlay(): void {
    if (!debugVisible) {
      return;
    }

    rebuildDebugOverlay();
  }

  function clearDeliveryEffects(): void {
    deliveryEffects.forEach((effect) => {
      gameWorld.removeChild(effect.gfx);
      effect.gfx.destroy();
    });
    deliveryEffects.length = 0;
  }

  function spawnDeliverySuccessEffect(x: number, y: number, delayMs = 0): void {
    const gfx = new Graphics();
    gameWorld.addChild(gfx);
    gfx.visible = delayMs === 0;
    deliveryEffects.push({
      ageMs: 0,
      delayMs,
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

    const isOpen = isGoalCurrentlyOpen();

    goalSprite.texture = isOpen
      ? assets.goalOpenTexture
      : assets.goalClosedTexture;
    goalSprite.position.set(currentGoal.x, currentGoal.y);
    goalSprite.width = currentGoal.width;
    goalSprite.height = currentGoal.height;

    if (isOpen && !wasGoalOpen) {
      const goalCenterX = currentGoal.x + currentGoal.width / 2;
      const goalCenterY = currentGoal.y + currentGoal.height / 2;
      spawnDeliverySuccessEffect(
        goalCenterX,
        goalCenterY - currentGoal.height * 0.15,
        250,
      );
      spawnDeliverySuccessEffect(
        goalCenterX,
        goalCenterY + currentGoal.height * 0.15,
        750,
      );
    }

    wasGoalOpen = isOpen;
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
      currentCheckpoints = resolveCheckpoints(stage);
      currentHazards = resolveHazards(stage);
      drawBackgroundForLevel(LEVELS[levelIndex]);

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
      chaseCrowStates = [];
      progressCount = 0;
      wasGoalOpen = false;

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
        gameWorld.addChildAt(gfx, 1);
        platforms.push({
          id: config.id,
          x: config.x,
          y: config.y,
          width: config.w,
          height: config.h,
          graphics: gfx,
          baseX: config.x,
          baseY: config.y,
          motion: config.motion
            ? {
                horizontal: config.motion.horizontal
                  ? {
                      ...config.motion.horizontal,
                      direction: 1,
                      offset: 0,
                    }
                  : undefined,
                vertical: config.motion.vertical
                  ? {
                      ...config.motion.vertical,
                      direction: 1,
                      offset: 0,
                    }
                  : undefined,
              }
            : undefined,
        });
      });

      currentGoal = resolveGoal(stage);
      currentCollectibles = resolveCollectibles(stage);
      currentStore = resolveStore(stage);
      if (isChaseStage(stage)) {
        chaseCrowStates = getChaseCollectibles(stage).map((collectible) => ({
          completed: false,
          cooldownMs: 0,
          currentAnchor: collectible.platform,
          currentOffsetX: collectible.offsetX,
          fleeingTo: null,
          fleeTargetIndex: 0,
          isEscaping: false,
          isFlying: false,
          targetX: 0,
          targetY: 0,
        }));
      }

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

      rebuildDebugOverlay();
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
      drawBackgroundForLevel(getCurrentLevel());

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
        rebuildDebugOverlay();
      }
    },
    toggleDebug(): void {
      debugVisible = !debugVisible;
      if (debugVisible) {
        rebuildDebugOverlay();
      }
      debugLayer.visible = debugVisible;
    },
    isDebugVisible(): boolean {
      return debugVisible;
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
      if (isChaseStage()) {
        void playerX;
        void playerY;
        return false;
      }

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
          refreshDebugOverlay();
          didChange = true;
          return;
        }

        sprite.visible = false;
        spawnDeliverySuccessEffect(
          collectible.x,
          collectible.y - collectible.height * 0.2,
        );
        progressCount += 1;
        redrawGoal();
        refreshDebugOverlay();
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
      refreshDebugOverlay();
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

      refreshDebugOverlay();

      return true;
    },
    updateChaseCollectibles(
      deltaMs: number,
      playerX: number,
      playerY: number,
    ): boolean {
      if (!isChaseStage()) {
        return false;
      }

      const triggerRadius = getChaseTriggerRadius();
      const fleeSpeed = getChaseFleeSpeed();
      const escapeSpeed = getChaseEscapeSpeed();
      let didChange = false;

      collectibleSprites.forEach((sprite, index) => {
        const chaseState = chaseCrowStates[index];
        if (!chaseState || chaseState.completed || !sprite.visible) {
          return;
        }

        chaseState.cooldownMs = Math.max(0, chaseState.cooldownMs - deltaMs);

        if (chaseState.isFlying) {
          const speed = chaseState.isEscaping ? escapeSpeed : fleeSpeed;
          const step = speed * (deltaMs / 1000);
          const dx = chaseState.targetX - sprite.x;
          const dy = chaseState.targetY - sprite.y;
          const distance = Math.hypot(dx, dy);

          if (distance <= step || distance <= 1) {
            sprite.position.set(chaseState.targetX, chaseState.targetY);
            currentCollectibles[index] = {
              x: chaseState.targetX,
              y: chaseState.targetY,
              width: sprite.width,
              height: sprite.height,
            };
            chaseState.isFlying = false;

            if (chaseState.isEscaping) {
              sprite.visible = false;
              refreshDebugOverlay();
              return;
            }

            if (chaseState.fleeingTo) {
              chaseState.currentAnchor = chaseState.fleeingTo.platform;
              chaseState.currentOffsetX = chaseState.fleeingTo.offsetX;
              chaseState.fleeingTo = null;
            }
            chaseState.cooldownMs = 300;
            return;
          }

          sprite.position.set(
            sprite.x + (dx / distance) * step,
            sprite.y + (dy / distance) * step,
          );
          currentCollectibles[index] = {
            x: sprite.x,
            y: sprite.y,
            width: sprite.width,
            height: sprite.height,
          };
          return;
        }

        if (chaseState.cooldownMs > 0) {
          return;
        }

        const dx = playerX - sprite.x;
        const dy = playerY - sprite.y;
        if (Math.hypot(dx, dy) > triggerRadius) {
          return;
        }

        const crowDefinition = getChaseCollectibles()[index];
        if (!crowDefinition) {
          return;
        }

        if (chaseState.fleeTargetIndex < crowDefinition.fleeTargets.length) {
          const nextTarget =
            crowDefinition.fleeTargets[chaseState.fleeTargetIndex];
          const resolvedTarget = resolveCollectibleFromAnchor(
            nextTarget.platform,
            nextTarget.offsetX,
          );

          chaseState.fleeTargetIndex += 1;
          chaseState.fleeingTo = nextTarget;
          chaseState.isFlying = true;
          chaseState.targetX = resolvedTarget.x;
          chaseState.targetY = resolvedTarget.y;
          sprite.scale.x = chaseState.targetX >= sprite.x ? 1 : -1;
          refreshDebugOverlay();
          return;
        }

        chaseState.completed = true;
        chaseState.isEscaping = true;
        chaseState.isFlying = true;
        chaseState.targetX = playerX < sprite.x ? WORLD_WIDTH + 160 : -160;
        chaseState.targetY = -120;
        sprite.scale.x = chaseState.targetX >= sprite.x ? 1 : -1;
        progressCount += 1;
        redrawGoal();
        spawnDeliverySuccessEffect(sprite.x, sprite.y - sprite.height * 0.2);
        refreshDebugOverlay();
        didChange = true;
      });

      return didChange;
    },
    updateMovingPlatforms(deltaMs: number, player: Player): void {
      let hasMotion = false;

      platforms.forEach((platform) => {
        if (platform.id === "ground" || !platform.motion) {
          return;
        }

        const wasStanding = isPlayerStandingOnPlatform(player, platform);
        let nextX = platform.baseX ?? platform.x;
        let nextY = platform.baseY ?? platform.y;
        let deltaX = 0;
        let deltaY = 0;

        const horizontalMotion = platform.motion.horizontal;
        if (horizontalMotion) {
          horizontalMotion.offset +=
            horizontalMotion.direction *
            horizontalMotion.speed *
            (deltaMs / 1000);
          if (horizontalMotion.offset >= horizontalMotion.distance) {
            horizontalMotion.offset = horizontalMotion.distance;
            horizontalMotion.direction = -1;
          } else if (horizontalMotion.offset <= 0) {
            horizontalMotion.offset = 0;
            horizontalMotion.direction = 1;
          }

          nextX += horizontalMotion.offset;
        }

        const verticalMotion = platform.motion.vertical;
        if (verticalMotion) {
          verticalMotion.offset +=
            verticalMotion.direction * verticalMotion.speed * (deltaMs / 1000);
          if (verticalMotion.offset >= verticalMotion.distance) {
            verticalMotion.offset = verticalMotion.distance;
            verticalMotion.direction = -1;
          } else if (verticalMotion.offset <= 0) {
            verticalMotion.offset = 0;
            verticalMotion.direction = 1;
          }

          nextY += verticalMotion.offset;
        }

        deltaX = nextX - platform.x;
        deltaY = nextY - platform.y;

        if (deltaX === 0 && deltaY === 0) {
          return;
        }

        hasMotion = true;
        platform.x = nextX;
        platform.y = nextY;
        drawPlatformSurface(
          platform.graphics,
          platform.x,
          platform.y,
          platform.width,
          platform.height,
          "platform",
        );

        if (wasStanding) {
          player.sprite.x += deltaX;
          player.sprite.y += deltaY;
        }
      });

      if (!hasMotion) {
        return;
      }

      refreshDynamicAnchors();
      if (debugVisible) {
        rebuildDebugOverlay();
      }
    },
    updateDeliveryEffects(deltaMs: number): void {
      for (let index = deliveryEffects.length - 1; index >= 0; index -= 1) {
        const effect = deliveryEffects[index];
        if (effect.delayMs > 0) {
          effect.delayMs = Math.max(0, effect.delayMs - deltaMs);

          if (effect.delayMs > 0) {
            continue;
          }

          effect.gfx.visible = true;
        }

        effect.ageMs += deltaMs;

        const progress = Math.min(1, effect.ageMs / effect.durationMs);
        const alpha = 1 - progress;
        const ringRadius = 18 + progress * 30;
        const sparkleRadius = 12 + progress * 20;
        const coreRadius = 6 + progress * 8;

        effect.gfx
          .clear()
          .circle(effect.x, effect.y, ringRadius)
          .stroke({ color: 0xfffbcc, width: 6, alpha: alpha * 0.95 })
          .star(effect.x, effect.y, 6, sparkleRadius, sparkleRadius * 0.45, 0)
          .fill({ color: 0xffb300, alpha: alpha * 0.72 })
          .circle(effect.x, effect.y, coreRadius)
          .fill({ color: 0xffffff, alpha: alpha * 0.55 });

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
