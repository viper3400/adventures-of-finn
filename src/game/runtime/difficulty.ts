export type GameDifficulty = "easy" | "normal" | "hard";

export interface DifficultyOption {
  id: GameDifficulty;
  label: string;
  timerMultiplier: number;
}

export const DIFFICULTY_OPTIONS: DifficultyOption[] = [
  { id: "easy", label: "Einfach", timerMultiplier: 1.3 },
  { id: "normal", label: "Normal", timerMultiplier: 1 },
  { id: "hard", label: "Schwer", timerMultiplier: 0.8 },
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
