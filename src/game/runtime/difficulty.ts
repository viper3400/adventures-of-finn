export type GameDifficulty = "easy" | "normal" | "hard" | "zen";

export interface DifficultyOption {
  id: GameDifficulty;
  label: string;
  timerMultiplier: number;
  hasTimer: boolean;
  hasLives: boolean;
}

export const DIFFICULTY_OPTIONS: DifficultyOption[] = [
  {
    id: "easy",
    label: "Einfach",
    timerMultiplier: 1.3,
    hasTimer: true,
    hasLives: true,
  },
  {
    id: "normal",
    label: "Normal",
    timerMultiplier: 1,
    hasTimer: true,
    hasLives: true,
  },
  {
    id: "hard",
    label: "Schwer",
    timerMultiplier: 0.8,
    hasTimer: true,
    hasLives: true,
  },
  {
    id: "zen",
    label: "Story-Mode",
    timerMultiplier: 0,
    hasTimer: false,
    hasLives: false,
  },
];

export const DEFAULT_DIFFICULTY: GameDifficulty = "normal";

export function getDifficultyOption(
  difficulty: GameDifficulty,
): DifficultyOption {
  return (
    DIFFICULTY_OPTIONS.find((option) => option.id === difficulty) ??
    DIFFICULTY_OPTIONS[1]
  );
}
