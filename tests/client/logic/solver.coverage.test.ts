import { describe, expect, it } from "vitest";
import {
  canPlaceToken,
  countTokens,
  createInitialState,
  createSolverContext,
  getHintMove,
  getLegalMoves,
  isSolvable,
  legalCellsForToken,
  toNumericGrid,
} from "../../../client/src/logic/solver/solver";

const tiles = [
  { id: "a", x: 0, y: 0, z: 0, value: 1 },
  { id: "b", x: 2, y: 0, z: 0, value: 1 },
  { id: "c", x: 4, y: 0, z: 0, value: 2 },
  { id: "d", x: 6, y: 0, z: 0, value: 2 },
];

describe("solver helpers", () => {
  it("covers legal move and solvability helpers", () => {
    const context = createSolverContext(tiles);
    const state = createInitialState(tiles);

    expect(getLegalMoves(context, state)).toHaveLength(4);
    expect(getHintMove(context, state)).not.toBeNull();
    expect(isSolvable(context, state)).toBe(true);

    state.handTokens = [1];
    const legal = legalCellsForToken(state.grid, 1, {});
    expect(legal.length).toBeGreaterThan(0);
    expect(canPlaceToken(state.grid, 1, legal[0].row, legal[0].col, {})).toBe(true);

    const counts = countTokens([1, 1, 2]);
    expect(counts.get(1)).toBe(2);
    expect(toNumericGrid(state.grid)[0][0]).toBe(0);

    state.lives = 0;
    expect(isSolvable(context, state)).toBe(false);
  });

  it("returns unsolvable when active token has no legal cell", () => {
    const context = createSolverContext(tiles);
    const state = createInitialState(tiles);
    state.grid = Array.from({ length: 9 }, () => Array(9).fill(1));
    state.handTokens = [1];
    expect(isSolvable(context, state)).toBe(false);
  });
});
