import { describe, expect, it } from "vitest";
import { generateLevel } from "../../../client/src/logic/level/levelGenerator";

describe("levelGenerator", () => {
  it("is deterministic for same seed and difficulty", () => {
    const a = generateLevel({ seed: 999, difficulty: "medium", levelNumber: 2 });
    const b = generateLevel({ seed: 999, difficulty: "medium", levelNumber: 2 });

    expect(a.puzzle).toEqual(b.puzzle);
    expect(a.tiles.map((t) => t.value)).toEqual(b.tiles.map((t) => t.value));
  });
});
