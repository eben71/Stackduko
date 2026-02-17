import { describe, expect, it } from "vitest";
import { isLevelSolvable } from "../../../client/src/logic/level/solvability";

describe("solvability", () => {
  it("returns true for a trivial solvable level", () => {
    const tiles = [
      { id: "a", x: 0, y: 0, z: 0, value: 2 },
      { id: "b", x: 1, y: 0, z: 0, value: 2 },
    ];
    expect(isLevelSolvable(tiles)).toBe(true);
  });
});
