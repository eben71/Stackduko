import { describe, expect, it } from "vitest";
import {
  getConflictCells,
  isCompleteGrid,
  isValidSolution,
} from "../../../client/src/logic/sudoku/validate";

describe("sudoku validation", () => {
  it("detects incomplete grids", () => {
    expect(isCompleteGrid([[1, 2, 3]])).toBe(false);
  });

  it("detects invalid solution rows", () => {
    const grid = Array.from({ length: 9 }, () => Array(9).fill(1));
    expect(isValidSolution(grid)).toBe(false);
  });

  it("finds conflicts in row and box", () => {
    const grid = Array.from({ length: 9 }, () => Array(9).fill(0));
    grid[0][0] = 5;
    grid[0][1] = 5;
    const conflicts = getConflictCells(grid, 0, 2, 5);
    expect(conflicts.length).toBeGreaterThan(0);
  });
});
