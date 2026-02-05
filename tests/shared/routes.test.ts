import { describe, expect, it } from "vitest";
import { buildUrl } from "../../shared/routes";

describe("buildUrl", () => {
  it("replaces params", () => {
    expect(buildUrl("/api/users/:id", { id: 42 })).toBe("/api/users/42");
  });

  it("returns original when no params", () => {
    expect(buildUrl("/api/scores")).toBe("/api/scores");
  });
});
