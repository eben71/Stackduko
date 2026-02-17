import { describe, expect, it } from "vitest";
import { canPlaceValue, legalCellsForValue } from "../../../client/src/game/mechanics/placement";
import {
  TOKEN_BUFFER_CAPACITY,
  canAddTokens,
} from "../../../client/src/game/mechanics/tokenBuffer";

describe("placement legality", () => {
  it("highlights legal cells for token", () => {
    const grid = Array.from({ length: 9 }, () => Array<number | null>(9).fill(null));
    grid[0][0] = 5;
    const legal = legalCellsForValue(grid, 5);
    expect(canPlaceValue(grid, 0, 1, 5)).toBe(false);
    expect(legal.some((cell) => cell.row === 0 && cell.col === 1)).toBe(false);
  });
});

describe("token buffer capacity", () => {
  it("enforces maximum capacity", () => {
    const buffer = [1, 2, 3, 4, 5];
    expect(canAddTokens(buffer, 1, TOKEN_BUFFER_CAPACITY)).toBe(false);
  });
});
