import { describe, expect, it, vi } from "vitest";

const mockIsSolvable = vi.hoisted(() => vi.fn());

vi.mock("../../../client/src/logic/solver/solver", async () => {
  const actual = await vi.importActual<
    typeof import("../../../client/src/logic/solver/solver")
  >("../../../client/src/logic/solver/solver");
  return {
    ...actual,
    isSolvable: mockIsSolvable,
  };
});

import { generateLevel } from "../../../client/src/logic/level/levelGenerator";

describe("levelGenerator fallback", () => {
  it("uses fallback when initial templates fail", () => {
    mockIsSolvable.mockReset();
    mockIsSolvable.mockImplementationOnce(() => false).mockImplementation(() => true);

    const level = generateLevel({
      seed: 999,
      difficulty: "easy",
      levelNumber: 1,
      attemptCap: 1,
    });

    expect(level.tiles).toHaveLength(81);
    expect(mockIsSolvable.mock.calls.length).toBeGreaterThanOrEqual(2);
  });
});
