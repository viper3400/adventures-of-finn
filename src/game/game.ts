import { Application, UPDATE_PRIORITY } from "pixi.js";

import { LEVELS } from "./levels";
import { loadGameAssets } from "./runtime/assets";
import { createInputController } from "./runtime/input";
import { createPlayer } from "./runtime/player";
import {
  createGameFlowController,
  type GameFlowEffect,
} from "./runtime/state-flow";
import { createStageRuntime } from "./runtime/stage-runtime";
import { createHud, createTransitionOverlay } from "./runtime/ui";

export async function startGame(): Promise<void> {
  const app = new Application();
  await app.init({ background: "#87CEEB", resizeTo: window, antialias: true });
  document.getElementById("pixi-container")!.appendChild(app.canvas);

  const assets = await loadGameAssets();
  const input = createInputController();
  const stageRuntime = createStageRuntime(assets);
  app.stage.addChild(stageRuntime.gameWorld);
  const gameFlow = createGameFlowController(LEVELS);

  const hud = createHud(app);
  const transition = createTransitionOverlay(
    app,
    assets.playerTexture,
    assets.speechBubbleTexture,
  );
  const spawnPoint = stageRuntime.getSpawnPoint();
  const player = createPlayer(
    stageRuntime.gameWorld,
    assets.playerTexture,
    spawnPoint.x,
    spawnPoint.y,
  );

  function updateHud(): void {
    const level = stageRuntime.getCurrentLevel();
    const stage = stageRuntime.getCurrentStage();

    hud.update({
      levelIndex: stageRuntime.getCurrentLevelIndex(),
      levelName: level.name,
      stageName: stage.name,
      stageMode: stage.mode,
      progressCount: stageRuntime.getProgressCount(),
      totalCollectibles: stage.collectibles.length,
      hasCarriedCollectible: stageRuntime.hasCarriedCollectible(),
      goalOpen: stageRuntime.isGoalOpen(),
    });
  }

  function updateViewport(): void {
    stageRuntime.updateViewport(app.screen.width, app.screen.height);
    transition.layout();
  }

  function resetPlayerToSpawn(): void {
    const droppedCollectible = stageRuntime.dropCarriedCollectible();
    const nextSpawnPoint = stageRuntime.getSpawnPoint();
    player.resetTo(nextSpawnPoint.x, nextSpawnPoint.y);
    if (droppedCollectible) {
      updateHud();
    }
  }

  function loadStage(levelIndex: number, stageIndex: number): void {
    stageRuntime.loadStage(levelIndex, stageIndex);
    resetPlayerToSpawn();
    updateHud();
  }

  function applyGameFlowEffects(effects: GameFlowEffect[]): void {
    effects.forEach((effect) => {
      switch (effect.type) {
        case "hideTransition":
          transition.hide();
          break;
        case "loadStage":
          loadStage(effect.stage.levelIndex, effect.stage.stageIndex);
          break;
        case "showLevelIntro":
          showLevelIntro(effect.levelIndex);
          break;
        case "showLevelComplete":
          showLevelComplete(effect.levelIndex);
          break;
      }
    });
  }

  function showLevelIntro(levelIndex: number): void {
    const level = LEVELS[levelIndex];
    transition.show(`Level ${levelIndex + 1}`, level.name, level.introText);
  }

  function showLevelComplete(levelIndex: number): void {
    const level = LEVELS[levelIndex];
    transition.show(
      "Level geschafft!",
      `${level.name} abgeschlossen`,
      level.completionText,
    );
  }

  function jumpToNextStageDebug(): void {
    applyGameFlowEffects(gameFlow.skipForward());
  }

  updateViewport();
  app.renderer.on("resize", updateViewport);

  applyGameFlowEffects(gameFlow.start());

  app.ticker.add(
    () => {
      if (input.consumeDebugToggle()) {
        stageRuntime.toggleDebug();
      }

      if (input.consumeStageSkip()) {
        jumpToNextStageDebug();
        return;
      }

      if (!gameFlow.isPlaying()) {
        if (input.consumeTransitionClose()) {
          applyGameFlowEffects(gameFlow.advanceTransition());
          input.markJumpUsed();
        }
        return;
      }

      stageRuntime.updateDeliveryEffects(app.ticker.deltaMS);
      player.update(input, stageRuntime.getPlatforms());

      let needsHudUpdate = false;
      if (stageRuntime.collectItems(player.sprite.x, player.sprite.y)) {
        needsHudUpdate = true;
      }
      if (
        stageRuntime.deliverCarriedCollectible(player.sprite.x, player.sprite.y)
      ) {
        needsHudUpdate = true;
      }
      stageRuntime.updateCarriedCollectiblePosition(player.sprite);
      stageRuntime.blockClosedGoal(player.player);

      if (needsHudUpdate) {
        updateHud();
      }

      if (stageRuntime.checkGoalReached(player.sprite.x, player.sprite.y)) {
        applyGameFlowEffects(gameFlow.advanceFromGoal());
        return;
      }

      if (player.isOutOfBounds()) {
        resetPlayerToSpawn();
      }
    },
    undefined,
    UPDATE_PRIORITY.HIGH,
  );
}
