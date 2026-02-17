import { describe, expect, it } from "vitest";
import { buildAdjacency, isFreeTile } from "../../../client/src/logic/stack/freeTile";
import { generateLevel } from "../../../client/src/logic/level/levelGenerator";

describe("Free tile rule", () => {
  it("detects covered and side-blocked tiles", () => {
    const tiles = [
      { id: "a", x: 0, y: 0, z: 0, value: 1 },
      { id: "b", x: 1, y: 0, z: 0, value: 2 },
      { id: "c", x: 0, y: 0, z: 1, value: 3 },
    ];
    const adjacency = buildAdjacency(tiles);
    const present = [true, true, true];

    expect(isFreeTile(0, present, adjacency)).toBe(false);
    expect(isFreeTile(1, present, adjacency)).toBe(true);
  });
});

describe("Level generator", () => {
  it("creates puzzle with missing-only tile stack and parity-safe givens", () => {
    const level = generateLevel({ seed: 1234, difficulty: "easy", levelNumber: 1 });
    expect(level.tiles.length).toBeLessThan(81);

    const givenCounts: Record<number, number> = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
      6: 0,
      7: 0,
      8: 0,
      9: 0,
    };
    for (let row = 0; row < 9; row += 1) {
      for (let col = 0; col < 9; col += 1) {
        const value = level.puzzle[row][col];
        if (value !== null) {
          givenCounts[value] += 1;
        }
      }
    }

    Object.values(givenCounts).forEach((count) => {
      expect(count % 2).toBe(1);
    });
  });
});
