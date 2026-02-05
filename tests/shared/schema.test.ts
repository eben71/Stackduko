import { describe, expect, it } from "vitest";
import { insertScoreSchema, insertUserSchema } from "../../shared/schema";

describe("insertUserSchema", () => {
  it("accepts a username", () => {
    const parsed = insertUserSchema.parse({ username: "Player1", isGuest: true });
    expect(parsed.username).toBe("Player1");
  });

  it("rejects missing username", () => {
    expect(() => insertUserSchema.parse({})).toThrow();
  });
});

describe("insertScoreSchema", () => {
  it("accepts required fields", () => {
    const parsed = insertScoreSchema.parse({
      userId: 1,
      score: 123,
      timeSeconds: 45,
      difficulty: "medium",
      completed: true,
      seed: "daily-1",
    });
    expect(parsed.score).toBe(123);
  });

  it("rejects missing required fields", () => {
    expect(() => insertScoreSchema.parse({ userId: 1 })).toThrow();
  });
});
