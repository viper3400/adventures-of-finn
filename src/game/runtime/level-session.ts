import type { LevelDefinition } from "../types";
import {
  DEFAULT_DIFFICULTY,
  getDifficultyOption,
  type GameDifficulty,
} from "./difficulty";

export interface LevelCompletionResult {
  elapsedSeconds: number;
}

export interface LevelTimeoutResult {
  gameOver: boolean;
  livesRemaining: number;
  restartLevelIndex: number;
}

export interface LevelSessionController {
  resetRun(): void;
  beginLevel(levelIndex: number): void;
  setRunning(running: boolean): void;
  setDifficulty(difficulty: GameDifficulty): void;
  getDifficulty(): GameDifficulty;
  update(deltaMs: number): LevelTimeoutResult | null;
  completeLevel(): LevelCompletionResult;
  getLivesRemaining(): number;
  getTimeRemainingSeconds(): number;
  isHurry(): boolean;
  getCurrentLevelIndex(): number | null;
}

const MAX_LIVES = 3;

export function createLevelSessionController(
  levels: LevelDefinition[],
): LevelSessionController {
  let livesRemaining = MAX_LIVES;
  let currentLevelIndex: number | null = null;
  let timeRemainingMs = 0;
  let currentFailMs = 0;
  let hurryMs = 0;
  let running = false;
  let difficulty = DEFAULT_DIFFICULTY;

  function getLevel(levelIndex: number): LevelDefinition {
    return levels[levelIndex];
  }

  function setLevelTiming(levelIndex: number): void {
    const level = getLevel(levelIndex);
    const option = getDifficultyOption(difficulty);
    currentLevelIndex = levelIndex;
    currentFailMs = Math.round(
      level.timing.failSeconds * option.timerMultiplier * 1000,
    );
    timeRemainingMs = currentFailMs;
    hurryMs = Math.round(
      (level.timing.hurrySeconds ?? 15) * option.timerMultiplier * 1000,
    );
  }

  return {
    resetRun(): void {
      livesRemaining = MAX_LIVES;
      currentLevelIndex = null;
      timeRemainingMs = 0;
      currentFailMs = 0;
      hurryMs = 0;
      running = false;
    },
    beginLevel(levelIndex: number): void {
      setLevelTiming(levelIndex);
      running = false;
    },
    setRunning(nextRunning: boolean): void {
      running = nextRunning;
    },
    setDifficulty(nextDifficulty: GameDifficulty): void {
      difficulty = nextDifficulty;
    },
    getDifficulty(): GameDifficulty {
      return difficulty;
    },
    update(deltaMs: number): LevelTimeoutResult | null {
      if (!running || currentLevelIndex === null) {
        return null;
      }

      timeRemainingMs = Math.max(0, timeRemainingMs - deltaMs);
      if (timeRemainingMs > 0) {
        return null;
      }

      running = false;
      livesRemaining -= 1;

      if (livesRemaining <= 0) {
        livesRemaining = MAX_LIVES;
        setLevelTiming(0);
        return {
          gameOver: true,
          livesRemaining,
          restartLevelIndex: 0,
        };
      }

      const restartLevelIndex = currentLevelIndex;
      setLevelTiming(restartLevelIndex);
      return {
        gameOver: false,
        livesRemaining,
        restartLevelIndex,
      };
    },
    completeLevel(): LevelCompletionResult {
      const elapsedSeconds = Math.max(
        0,
        Math.ceil((currentFailMs - timeRemainingMs) / 1000),
      );

      running = false;

      return { elapsedSeconds };
    },
    getLivesRemaining(): number {
      return livesRemaining;
    },
    getTimeRemainingSeconds(): number {
      return Math.max(0, Math.ceil(timeRemainingMs / 1000));
    },
    isHurry(): boolean {
      return running && timeRemainingMs <= hurryMs;
    },
    getCurrentLevelIndex(): number | null {
      return currentLevelIndex;
    },
  };
}
