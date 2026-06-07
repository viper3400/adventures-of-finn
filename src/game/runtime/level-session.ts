import type { LevelDefinition } from "../types";

export interface LevelCompletionResult {
  elapsedSeconds: number;
  starsEarned: 1 | 2 | 3;
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
  update(deltaMs: number): LevelTimeoutResult | null;
  completeLevel(levelIndex: number): LevelCompletionResult;
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

  function getLevel(levelIndex: number): LevelDefinition {
    return levels[levelIndex];
  }

  function setLevelTiming(levelIndex: number): void {
    const level = getLevel(levelIndex);
    currentLevelIndex = levelIndex;
    currentFailMs = level.timing.failSeconds * 1000;
    timeRemainingMs = currentFailMs;
    hurryMs = (level.timing.hurrySeconds ?? 15) * 1000;
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
    completeLevel(levelIndex: number): LevelCompletionResult {
      const level = getLevel(levelIndex);
      const elapsedSeconds = Math.max(
        0,
        Math.ceil((currentFailMs - timeRemainingMs) / 1000),
      );

      running = false;

      if (elapsedSeconds <= level.timing.threeStarSeconds) {
        return { elapsedSeconds, starsEarned: 3 };
      }
      if (elapsedSeconds <= level.timing.twoStarSeconds) {
        return { elapsedSeconds, starsEarned: 2 };
      }

      return { elapsedSeconds, starsEarned: 1 };
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
