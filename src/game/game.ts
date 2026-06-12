import { Application, UPDATE_PRIORITY } from "pixi.js";

import {
  getStageCollectibles,
  getStageObjectiveType,
  getTransitionContent,
} from "./level-schema";
import { LEVELS } from "./levels";
import { loadGameAssets } from "./runtime/assets";
import { getDifficultyOption } from "./runtime/difficulty";
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
  createEndScreen,
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

  const hud = createHud(app, assets.dogFaceTexture);
  const hurryOverlay = createHurryOverlay(app);
  const titleScreen = createTitleScreen(app, assets.titleTexture);
  const endScreen = createEndScreen(app, assets.endScreenTexture);
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
    endScreen.layout();
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
          endScreen.hide();
          startupMenu.hide();
          transition.hide();
          break;
        case "showTitleScreen":
          endScreen.hide();
          startupMenu.hide();
          transition.hide();
          titleScreen.show();
          break;
        case "showStartupMenu":
          titleScreen.hide();
          endScreen.hide();
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
        case "showGameComplete":
          showGameComplete(effect.levelIndex);
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
    startupMenu.show(
      progression.hasStoredProgression(),
      `Weiter bei Level ${levelNumber}`,
      levelSession.getDifficulty(),
    );
  }

  function showLevelIntro(levelIndex: number): void {
    const level = LEVELS[levelIndex];
    const content = getTransitionContent(
      level.intro,
      `Level ${levelIndex + 1}`,
      level.name,
    );
    transition.show(content.title, content.subtitle, content.speech, "intro");
  }

  function showLevelComplete(levelIndex: number): void {
    const level = LEVELS[levelIndex];
    const difficultyLabel = getDifficultyOption(
      levelSession.getDifficulty(),
    ).label;
    const completionHint = lastLevelCompletion
      ? `Result ${lastLevelCompletion.elapsedSeconds}s  Schwierigkeit ${difficultyLabel}`
      : "Result unavailable";
    const content = getTransitionContent(
      level.completion,
      "Level geschafft!",
      `${level.name} abgeschlossen - ${completionHint}`,
    );
    transition.show(
      content.title,
      content.subtitle,
      content.speech,
      "complete",
    );
  }

  function showGameComplete(levelIndex: number): void {
    void levelIndex;
    titleScreen.hide();
    startupMenu.hide();
    transition.hide();
    endScreen.show();
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

    transition.show("Zu langsam!", subtitle, speech, "failure");
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
      const stageSkipRequested = input.consumeStageSkip();
      transition.update(app.ticker.deltaMS);

      if (input.consumeDebugToggle()) {
        stageRuntime.toggleDebug();
      }

      if (!gameFlow.isPlaying()) {
        if (gameFlow.getState().kind === "menu") {
          if (input.consumeMenuUp()) {
            startupMenu.selectPrevious();
          }

          if (input.consumeMenuDown()) {
            startupMenu.selectNext();
          }

          if (input.consumeMenuLeft()) {
            startupMenu.selectLeft();
          }

          if (input.consumeMenuRight()) {
            startupMenu.selectRight();
          }

          if (input.consumeTransitionClose()) {
            if (startupMenu.getSelectedAction() === "new") {
              progression.resetProgression();
              levelSession.resetRun();
              levelSession.setDifficulty(startupMenu.getSelectedDifficulty());
              applyGameFlowEffects(gameFlow.startNewGame());
            } else {
              levelSession.resetRun();
              levelSession.setDifficulty(startupMenu.getSelectedDifficulty());
              applyGameFlowEffects(gameFlow.continueGame());
            }
            input.markJumpUsed();
          }
          return;
        }

        if (input.consumeTransitionClose()) {
          if (transition.isAnimating()) {
            transition.revealAll();
            input.markJumpUsed();
            return;
          }

          if (gameFlow.getState().kind === "gameComplete") {
            progression.resetProgression();
            levelSession.resetRun();
          }
          applyGameFlowEffects(gameFlow.advanceTransition());
          input.markJumpUsed();
        }
        return;
      }

      if (stageSkipRequested) {
        jumpToNextStageDebug();
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
      if (
        stageRuntime.updateChaseCollectibles(
          app.ticker.deltaMS,
          player.sprite.x,
          player.sprite.y,
        )
      ) {
        needsHudUpdate = true;
      }
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
          lastLevelCompletion = levelSession.completeLevel();
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
