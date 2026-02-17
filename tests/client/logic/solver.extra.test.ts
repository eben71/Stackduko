import { describe, expect, it } from "vitest";
import {
  createInitialState,
  createSolverContext,
  getHintMove,
  toNumericGrid,
} from "../../../client/src/logic/solver/solver";

describe("solver helpers", () => {
  it("maps nulls to zeros in numeric grid", () => {
    const revealed = Array.from({ length: 9 }, () => Array(9).fill(null));
    revealed[0][0] = 5;
    expect(toNumericGrid(revealed)[0][0]).toBe(5);
    expect(toNumericGrid(revealed)[0][1]).toBe(0);
  });

  it("returns null hint when no legal pairs exist", () => {
    const tiles = [{ id: "a", x: 0, y: 0, z: 0, value: 1 }];
    const context = createSolverContext(tiles);
    const state = createInitialState(tiles);
    expect(getHintMove(context, state)).toBeNull();
  });
});
