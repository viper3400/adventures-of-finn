import { Application, UPDATE_PRIORITY } from "pixi.js";

import {
  getStageCollectibles,
  getStageObjectiveType,
  getTransitionContent,
} from "./level-schema";
import { LEVELS } from "./levels";
import { loadGameAssets } from "./runtime/assets";
import { createInputController } from "./runtime/input";
import {
  createLevelSessionController,
  type LevelCompletionResult,
} from "./runtime/level-session";
import { createPlayer } from "./runtime/player";
import { createProgressionController } from "./runtime/progression";
import {
  createGameFlowController,
  type GameFlowEffect,
} from "./runtime/state-flow";
import { createStageRuntime } from "./runtime/stage-runtime";
import {
  createHud,
  createHurryOverlay,
  createStartupMenu,
  createTitleScreen,
  createTransitionOverlay,
} from "./runtime/ui";

export async function startGame(): Promise<void> {
  const app = new Application();
  await app.init({ background: "#87CEEB", resizeTo: window, antialias: true });
  document.getElementById("pixi-container")!.appendChild(app.canvas);

  const assets = await loadGameAssets();
  const input = createInputController();
  const stageRuntime = createStageRuntime(assets);
  app.stage.addChild(stageRuntime.gameWorld);
  const gameFlow = createGameFlowController(LEVELS);
  const progression = createProgressionController(LEVELS);
  const levelSession = createLevelSessionController(LEVELS);

  const hud = createHud(app);
  const hurryOverlay = createHurryOverlay(app);
  const titleScreen = createTitleScreen(app, assets.titleTexture);
  const startupMenu = createStartupMenu(app, assets.titleTexture);
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
  let lastLevelCompletion: LevelCompletionResult | null = null;
  let previousHurry = false;

  function formatStars(starsEarned: number): string {
    return `${"*".repeat(starsEarned)}${"-".repeat(3 - starsEarned)}`;
  }

  function updateHud(): void {
    const level = stageRuntime.getCurrentLevel();
    const stage = stageRuntime.getCurrentStage();

    hud.update({
      levelIndex: stageRuntime.getCurrentLevelIndex(),
      levelName: level.name,
      stageName: stage.name,
      objectiveType: getStageObjectiveType(stage),
      progressCount: stageRuntime.getProgressCount(),
      totalCollectibles: getStageCollectibles(stage).length,
      timeRemainingSeconds: levelSession.getTimeRemainingSeconds(),
      livesRemaining: levelSession.getLivesRemaining(),
      hurry: levelSession.isHurry(),
    });
  }

  function updateViewport(): void {
    stageRuntime.updateViewport(app.screen.width, app.screen.height);
    hurryOverlay.layout();
    titleScreen.layout();
    startupMenu.layout();
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
    if (
      levelSession.getCurrentLevelIndex() !== levelIndex ||
      stageIndex === 0
    ) {
      levelSession.beginLevel(levelIndex);
    }
    stageRuntime.loadStage(levelIndex, stageIndex);
    progression.recordReachedStage({ levelIndex, stageIndex });
    resetPlayerToSpawn();
    updateHud();
  }

  function applyGameFlowEffects(effects: GameFlowEffect[]): void {
    effects.forEach((effect) => {
      switch (effect.type) {
        case "hideTransition":
          titleScreen.hide();
          startupMenu.hide();
          transition.hide();
          break;
        case "showTitleScreen":
          startupMenu.hide();
          transition.hide();
          titleScreen.show();
          break;
        case "showStartupMenu":
          titleScreen.hide();
          transition.hide();
          showStartupMenu();
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
        case "showLevelFailure":
          showLevelFailure(
            effect.levelIndex,
            effect.gameOver,
            effect.livesRemaining,
          );
          break;
      }
    });
    levelSession.setRunning(gameFlow.isPlaying());
    previousHurry = levelSession.isHurry();
    updateHud();
  }

  function showStartupMenu(): void {
    const resumeStage = progression.getResumeStage();
    const levelNumber = resumeStage.levelIndex + 1;
    const stageNumber = resumeStage.stageIndex + 1;
    startupMenu.show(
      progression.hasStoredProgression(),
      `Weiter bei Level ${levelNumber}, Stage ${stageNumber}`,
    );
  }

  function showLevelIntro(levelIndex: number): void {
    const level = LEVELS[levelIndex];
    const content = getTransitionContent(
      level.intro,
      `Level ${levelIndex + 1}`,
      level.name,
    );
    transition.show(content.title, content.subtitle, content.speech);
  }

  function showLevelComplete(levelIndex: number): void {
    const level = LEVELS[levelIndex];
    const completionHint = lastLevelCompletion
      ? `Result ${lastLevelCompletion.elapsedSeconds}s  Stars ${formatStars(lastLevelCompletion.starsEarned)}`
      : "Result unavailable";
    const content = getTransitionContent(
      level.completion,
      "Level geschafft!",
      `${level.name} abgeschlossen - ${completionHint}`,
    );
    transition.show(content.title, content.subtitle, content.speech);
  }

  function showLevelFailure(
    levelIndex: number,
    gameOver: boolean,
    livesRemaining: number,
  ): void {
    const level = LEVELS[levelIndex];
    const subtitle = gameOver
      ? "Alle Leben verloren - zurueck zum Anfang"
      : `${level.name} neu starten - noch ${livesRemaining} Leben`;
    const speech = gameOver
      ? "Die Zeit ist abgelaufen und alle 3 Leben sind weg. Zurueck zu Level 1."
      : `Die Zeit ist abgelaufen. Ein Leben verloren. Noch ${livesRemaining} Leben uebrig.`;

    transition.show("Zu langsam!", subtitle, speech);
  }

  function jumpToNextStageDebug(): void {
    applyGameFlowEffects(gameFlow.skipForward());
  }

  updateViewport();
  app.renderer.on("resize", updateViewport);

  applyGameFlowEffects(
    gameFlow.start(
      progression.getResumeStage(),
      progression.hasStoredProgression(),
    ),
  );
  levelSession.resetRun();
  updateHud();

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
        if (gameFlow.getState().kind === "menu") {
          if (input.consumeMenuUp()) {
            startupMenu.selectPrevious();
          }

          if (input.consumeMenuDown()) {
            startupMenu.selectNext();
          }

          if (input.consumeTransitionClose()) {
            if (startupMenu.getSelectedAction() === "new") {
              progression.resetProgression();
              levelSession.resetRun();
              applyGameFlowEffects(gameFlow.startNewGame());
            } else {
              levelSession.resetRun();
              applyGameFlowEffects(gameFlow.continueGame());
            }
            input.markJumpUsed();
          }
          return;
        }

        if (input.consumeTransitionClose()) {
          applyGameFlowEffects(gameFlow.advanceTransition());
          input.markJumpUsed();
        }
        return;
      }

      stageRuntime.updateDeliveryEffects(app.ticker.deltaMS);
      hurryOverlay.update(app.ticker.deltaMS);
      stageRuntime.updateMovingPlatforms(app.ticker.deltaMS, player.player);
      player.update(input, stageRuntime.getPlatforms());
      const timeoutResult = levelSession.update(app.ticker.deltaMS);
      if (timeoutResult) {
        lastLevelCompletion = null;
        if (timeoutResult.gameOver) {
          progression.resetProgression();
        }
        applyGameFlowEffects(
          gameFlow.failLevel(
            {
              levelIndex: timeoutResult.restartLevelIndex,
              stageIndex: 0,
            },
            timeoutResult.gameOver,
            timeoutResult.livesRemaining,
          ),
        );
        return;
      }

      const isHurry = levelSession.isHurry();
      if (isHurry && !previousHurry) {
        hurryOverlay.show();
      }
      previousHurry = isHurry;

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
      stageRuntime.syncActorLayers(player.sprite);
      stageRuntime.blockClosedGoal(player.player);

      if (needsHudUpdate) {
        updateHud();
      }

      if (stageRuntime.checkGoalReached(player.sprite.x, player.sprite.y)) {
        const isLastStage =
          stageRuntime.getCurrentStageIndex() ===
          stageRuntime.getCurrentLevel().stages.length - 1;
        if (isLastStage) {
          lastLevelCompletion = levelSession.completeLevel(
            stageRuntime.getCurrentLevelIndex(),
          );
        } else {
          lastLevelCompletion = null;
        }
        applyGameFlowEffects(gameFlow.advanceFromGoal());
        return;
      }

      if (player.isOutOfBounds()) {
        resetPlayerToSpawn();
      }

      updateHud();
    },
    undefined,
    UPDATE_PRIORITY.HIGH,
  );
}
