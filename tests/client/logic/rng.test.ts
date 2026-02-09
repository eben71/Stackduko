import { describe, expect, it } from "vitest";
import { mulberry32, randomInt, shuffle } from "../../../client/src/logic/rng";

describe("rng utilities", () => {
  it("produces deterministic randomInt values", () => {
    const rng = mulberry32(123);
    const value = randomInt(rng, 1, 3);
    expect(value).toBeGreaterThanOrEqual(1);
    expect(value).toBeLessThanOrEqual(3);
  });

  it("shuffles deterministically with seed", () => {
    const rng = mulberry32(7);
    const result = shuffle(rng, [1, 2, 3, 4]);
    expect(result).toHaveLength(4);
    expect(new Set(result)).toEqual(new Set([1, 2, 3, 4]));
  });
});
