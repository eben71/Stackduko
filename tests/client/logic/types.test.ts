import { describe, expect, it } from "vitest";
import { TILE_POSITION_KEYS } from "../../../client/src/logic/stack/types";

describe("Tile types", () => {
  it("exports runtime keys", () => {
    expect(TILE_POSITION_KEYS).toEqual(["x", "y", "z"]);
  });
});
