import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import express from "express";
import request from "supertest";
import { createServer } from "http";
const mockStorage = vi.hoisted(() => ({
  getUserByUsername: vi.fn(),
  createUser: vi.fn(),
  getTopScores: vi.fn(),
  createScore: vi.fn(),
}));

vi.mock("../../server/storage", () => ({
  storage: mockStorage,
}));

import { registerRoutes } from "../../server/routes";

describe("registerRoutes", () => {
  beforeEach(() => {
    mockStorage.getUserByUsername.mockReset();
    mockStorage.createUser.mockReset();
    mockStorage.getTopScores.mockReset();
    mockStorage.createScore.mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("creates a guest user when username is missing", async () => {
    mockStorage.getTopScores.mockResolvedValueOnce([]);
    mockStorage.createUser
      .mockResolvedValueOnce({ id: 2, username: "StackMaster" })
      .mockResolvedValueOnce({ id: 1, username: "Guest1234" });
    mockStorage.createScore.mockResolvedValueOnce({ id: 1 });

    const randomSpy = vi.spyOn(Math, "random").mockReturnValue(0.1234);

    const app = express();
    app.use(express.json());
    const server = createServer(app);
    await registerRoutes(server, app);

    const res = await request(app).post("/api/users").send({});
    expect(res.status).toBe(201);
    expect(res.body.username).toBe("Guest1234");
    expect(mockStorage.createUser).toHaveBeenCalled();

    randomSpy.mockRestore();
  });

  it("returns existing user when username exists", async () => {
    mockStorage.getTopScores.mockResolvedValueOnce([]);
    mockStorage.createUser.mockResolvedValueOnce({ id: 2, username: "StackMaster" });
    mockStorage.createScore.mockResolvedValueOnce({ id: 1 });

    mockStorage.getUserByUsername.mockResolvedValueOnce({ id: 5, username: "Eve" });

    const app = express();
    app.use(express.json());
    const server = createServer(app);
    await registerRoutes(server, app);

    const res = await request(app).post("/api/users").send({ username: "Eve" });
    expect(res.status).toBe(200);
    expect(res.body.username).toBe("Eve");
  });

  it("lists scores", async () => {
    mockStorage.getTopScores.mockResolvedValueOnce([]);
    mockStorage.createUser.mockResolvedValueOnce({ id: 2, username: "StackMaster" });
    mockStorage.createScore.mockResolvedValueOnce({ id: 1 });

    mockStorage.getTopScores.mockResolvedValueOnce([
      { id: 1, score: 500, user: { id: 1, username: "A" } },
    ]);

    const app = express();
    app.use(express.json());
    const server = createServer(app);
    await registerRoutes(server, app);

    const res = await request(app).get("/api/scores");
    expect(res.status).toBe(200);
    expect(res.body[0].score).toBe(500);
  });

  it("validates score input", async () => {
    mockStorage.getTopScores.mockResolvedValueOnce([]);
    mockStorage.createUser.mockResolvedValueOnce({ id: 2, username: "StackMaster" });
    mockStorage.createScore.mockResolvedValueOnce({ id: 1 });

    const app = express();
    app.use(express.json());
    const server = createServer(app);
    await registerRoutes(server, app);

    const res = await request(app).post("/api/scores").send({ userId: 1 });
    expect(res.status).toBe(400);
    expect(res.body.message).toBeDefined();
  });

  it("creates a score", async () => {
    mockStorage.getTopScores.mockResolvedValueOnce([]);
    mockStorage.createUser.mockResolvedValueOnce({ id: 2, username: "StackMaster" });
    mockStorage.createScore
      .mockResolvedValueOnce({ id: 1 })
      .mockResolvedValueOnce({ id: 99, score: 100, userId: 1 });

    const app = express();
    app.use(express.json());
    const server = createServer(app);
    await registerRoutes(server, app);

    const res = await request(app).post("/api/scores").send({
      userId: 1,
      score: 100,
      timeSeconds: 30,
      difficulty: "easy",
      completed: true,
      seed: "daily-1",
    });

    expect(res.status).toBe(201);
    expect(res.body.id).toBe(99);
  });
});
