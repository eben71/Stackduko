import { describe, expect, it } from "vitest";
import { isStuckState } from "../../../client/src/game/mechanics/livesUndos";
import { buildAdjacency } from "../../../client/src/logic/stack/freeTile";

describe("lives and stuck detection", () => {
  it("detects no legal moves when buffer is full and no pair remains", () => {
    const tiles = [
      { id: "a", x: 0, y: 0, z: 0, value: 1 },
      { id: "b", x: 1, y: 0, z: 0, value: 2 },
    ];
    const present = [true, true];
    const grid = Array.from({ length: 9 }, () => Array<number | null>(9).fill(1));
    const stuck = isStuckState({
      tiles,
      present,
      adjacency: buildAdjacency(tiles),
      grid,
      tokens: [1, 2, 3, 4, 5],
      bufferCapacity: 5,
    });
    expect(stuck).toBe(true);
  });
});
