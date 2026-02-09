import { describe, expect, it } from "vitest";
import { buildAdjacency, isFreeTile } from "../../../client/src/logic/stack/freeTile";
import { generateLevel } from "../../../client/src/logic/level/levelGenerator";
import {
  createInitialState,
  createSolverContext,
  isSolvable,
} from "../../../client/src/logic/solver/solver";

describe("Free tile rule", () => {
  it("detects covered and side-blocked tiles", () => {
    const tiles = [
      { id: "a", x: 0, y: 0, z: 0, row: 0, col: 0, value: 1 },
      { id: "b", x: 1, y: 0, z: 0, row: 0, col: 1, value: 2 },
      { id: "c", x: 0, y: 0, z: 1, row: 1, col: 0, value: 3 },
    ];
    const adjacency = buildAdjacency(tiles);
    const present = [true, true, true];

    expect(isFreeTile(0, present, adjacency)).toBe(false);
    expect(isFreeTile(1, present, adjacency)).toBe(true);
  });
});

describe("Solver validation", () => {
  it("solves a simple legal layout", () => {
    const tiles = [
      { id: "a", x: 0, y: 0, z: 0, row: 0, col: 0, value: 1 },
      { id: "b", x: 1, y: 0, z: 0, row: 0, col: 1, value: 2 },
    ];
    const context = createSolverContext(tiles);
    const state = createInitialState(tiles);
    expect(isSolvable(context, state)).toBe(true);
  });

  it("rejects unsolvable duplicate reveals", () => {
    const tiles = [
      { id: "a", x: 0, y: 0, z: 0, row: 0, col: 0, value: 1 },
      { id: "b", x: 1, y: 0, z: 0, row: 0, col: 1, value: 1 },
    ];
    const context = createSolverContext(tiles);
    const state = createInitialState(tiles);
    expect(isSolvable(context, state)).toBe(false);
  });
});

describe("Level generator", () => {
  it("produces a solvable level for a fixed seed", () => {
    const level = generateLevel({ seed: 1234, difficulty: "easy", levelNumber: 1, attemptCap: 10 });
    expect(level.tiles).toHaveLength(81);
    const context = createSolverContext(level.tiles);
    const state = createInitialState(level.tiles);
    expect(isSolvable(context, state)).toBe(true);
  });
});
