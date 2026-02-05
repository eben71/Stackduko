import { describe, expect, it } from "vitest";
import { mulberry32 } from "../../../client/src/logic/rng";
import { generateSolvedGrid } from "../../../client/src/logic/sudoku/generator";
import { isPlacementLegal, isValidSolution } from "../../../client/src/logic/sudoku/validate";

describe("Sudoku generator", () => {
  it("generates a valid solved board", () => {
    const rng = mulberry32(42);
    const board = generateSolvedGrid(rng);
    expect(isValidSolution(board)).toBe(true);
  });
});

describe("Sudoku placement validation", () => {
  it("rejects duplicates in row, col, box", () => {
    const board = Array(9)
      .fill(null)
      .map(() => Array(9).fill(0));
    board[0][0] = 5;
    board[1][1] = 5;
    expect(isPlacementLegal(board, 0, 2, 5)).toBe(false);
    expect(isPlacementLegal(board, 2, 0, 5)).toBe(false);
  });
});
