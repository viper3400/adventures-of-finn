import { Application, UPDATE_PRIORITY } from "pixi.js";

import { LEVELS } from "./levels";
import { loadGameAssets } from "./runtime/assets";
import { createInputController } from "./runtime/input";
import { createPlayer } from "./runtime/player";
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

  function showLevelIntro(levelIndex: number): void {
    const level = LEVELS[levelIndex];
    transition.show(`Level ${levelIndex + 1}`, level.name, level.introText);
  }

  function showLevelComplete(levelIndex: number, onComplete: () => void): void {
    const level = LEVELS[levelIndex];
    transition.show(
      "Level geschafft!",
      `${level.name} abgeschlossen`,
      level.completionText,
      onComplete,
    );
  }

  function jumpToNextStageDebug(): void {
    if (transition.isVisible()) {
      transition.close();
    }

    const level = stageRuntime.getCurrentLevel();
    const hasNextStage =
      stageRuntime.getCurrentStageIndex() + 1 < level.stages.length;

    if (hasNextStage) {
      loadStage(
        stageRuntime.getCurrentLevelIndex(),
        stageRuntime.getCurrentStageIndex() + 1,
      );
      return;
    }

    const nextLevelIndex =
      (stageRuntime.getCurrentLevelIndex() + 1) % LEVELS.length;
    loadStage(nextLevelIndex, 0);
  }

  updateViewport();
  app.renderer.on("resize", updateViewport);

  loadStage(0, 0);
  showLevelIntro(0);

  app.ticker.add(
    () => {
      if (input.consumeDebugToggle()) {
        stageRuntime.toggleDebug();
      }

      if (input.consumeStageSkip()) {
        jumpToNextStageDebug();
      }

      if (transition.isVisible()) {
        if (input.consumeTransitionClose()) {
          transition.close();
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
        const level = stageRuntime.getCurrentLevel();
        const hasNextStage =
          stageRuntime.getCurrentStageIndex() + 1 < level.stages.length;

        if (hasNextStage) {
          loadStage(
            stageRuntime.getCurrentLevelIndex(),
            stageRuntime.getCurrentStageIndex() + 1,
          );
          return;
        }

        const nextLevelIndex =
          (stageRuntime.getCurrentLevelIndex() + 1) % LEVELS.length;
        showLevelComplete(stageRuntime.getCurrentLevelIndex(), () => {
          loadStage(nextLevelIndex, 0);
          showLevelIntro(nextLevelIndex);
        });
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
