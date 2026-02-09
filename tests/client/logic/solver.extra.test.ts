import { describe, expect, it } from "vitest";
import {
  createInitialState,
  createSolverContext,
  getHintMove,
  toNumericGrid,
} from "../../../client/src/logic/solver/solver";

describe("solver helpers", () => {
  it("maps nulls to zeros in numeric grid", () => {
    const revealed = [
      [1, null, 3],
      [null, 5, null],
    ];
    expect(toNumericGrid(revealed)).toEqual([
      [1, 0, 3],
      [0, 5, 0],
    ]);
  });

  it("returns null hint when no legal moves exist", () => {
    const tiles = [{ id: "t0", x: 0, y: 0, z: 0, row: 0, col: 0, value: 1 }];
    const context = createSolverContext(tiles);
    const state = createInitialState(tiles);
    state.present = [false];
    expect(getHintMove(context, state)).toBeNull();
  });
});
