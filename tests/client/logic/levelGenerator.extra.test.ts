import { describe, expect, it } from "vitest";
import { generateLevel } from "../../../client/src/logic/level/levelGenerator";
import { generatePrefilledSudoku } from "../../../client/src/game/logic/sudoku/generator";

describe("levelGenerator", () => {
  it("is deterministic for same seed and difficulty", () => {
    const a = generateLevel({ seed: 999, difficulty: "medium", levelNumber: 2 });
    const b = generateLevel({ seed: 999, difficulty: "medium", levelNumber: 2 });

    expect(a.puzzle).toEqual(b.puzzle);
    expect(a.tiles.map((t) => t.value)).toEqual(b.tiles.map((t) => t.value));
  });

  it("builds stack values in exact pairs for empty-cell token parity", () => {
    const level = generateLevel({ seed: 2222, difficulty: "hard", levelNumber: 3 });
    const counts = new Map<number, number>();
    for (const tile of level.tiles) counts.set(tile.value, (counts.get(tile.value) ?? 0) + 1);
    for (const count of counts.values()) {
      expect(count % 2).toBe(0);
    }

    const emptyCells = level.puzzle.flat().filter((cell) => cell === null).length;
    expect(level.tiles).toHaveLength(emptyCells);
  });

  it("uses difficulty-based prefill density", () => {
    const easy = generatePrefilledSudoku(777, "easy");
    const hard = generatePrefilledSudoku(777, "hard");

    const easyGivens = easy.puzzle.flat().filter((cell) => cell !== null).length;
    const hardGivens = hard.puzzle.flat().filter((cell) => cell !== null).length;

    expect(easyGivens).toBeGreaterThan(hardGivens);
  });
});
