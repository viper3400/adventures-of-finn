import { describe, expect, it } from "vitest";

import {
  DEFAULT_DIFFICULTY,
  DIFFICULTY_OPTIONS,
  getDifficultyOption,
} from "./difficulty";

describe("difficulty", () => {
  it("returns the configured label and multiplier for each difficulty", () => {
    expect(DIFFICULTY_OPTIONS).toEqual([
      { id: "easy", label: "Einfach", timerMultiplier: 1.3 },
      { id: "normal", label: "Normal", timerMultiplier: 1 },
      { id: "hard", label: "Schwer", timerMultiplier: 0.8 },
    ]);
    expect(DEFAULT_DIFFICULTY).toBe("normal");
  });

  it("falls back to the normal option for unknown values", () => {
    expect(getDifficultyOption("invalid" as never)).toEqual(
      DIFFICULTY_OPTIONS[1],
    );
  });
});
