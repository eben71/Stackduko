import { describe, expect, it } from "vitest";
import {
  generatePrefilledSudoku,
  hasUniqueSolution,
} from "../../../client/src/game/logic/sudoku/generator";

describe("prefilled sudoku generator", () => {
  it("enforces odd given parity per digit", () => {
    const generated = generatePrefilledSudoku(2026, "medium");
    Object.values(generated.givenCountsByDigit).forEach((count) => {
      expect(count % 2).toBe(1);
    });
  });

  it("produces unique-solution puzzle", () => {
    const generated = generatePrefilledSudoku(3030, "easy");
    expect(hasUniqueSolution(generated.puzzle)).toBe(true);
  });
});
