import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";

export async function registerRoutes(httpServer: Server, app: Express): Promise<Server> {
  // Users
  app.post(api.users.getOrCreate.path, async (req, res) => {
    try {
      // Simple guest auth: if username exists, return it, else create
      // In a real app, we'd use Replit Auth or proper sessions
      const parsed = api.users.getOrCreate.input?.safeParse(req.body);
      const input = parsed?.success ? parsed.data : null;
      const hasUsername = typeof req.body?.username === "string";

      if (!hasUsername) {
        // Create generic guest
        const username = `Guest${Math.floor(Math.random() * 10000)}`;
        const user = await storage.createUser({ username, isGuest: true });
        return res.status(201).json(user);
      }

      if (!input) {
        return res.status(400).json({ message: "Invalid request" });
      }

      let user = await storage.getUserByUsername(input.username);
      if (!user) {
        user = await storage.createUser({ username: input.username, isGuest: true });
        return res.status(201).json(user);
      }

      res.json(user);
    } catch {
      res.status(400).json({ message: "Invalid request" });
    }
  });

  // Scores
  app.get(api.scores.list.path, async (req, res) => {
    const topScores = await storage.getTopScores();
    res.json(topScores);
  });

  app.post(api.scores.create.path, async (req, res) => {
    const parsed = api.scores.create.input.safeParse(req.body);
    if (!parsed.success) {
      const [firstIssue] = parsed.error.issues;
      return res.status(400).json({
        message: firstIssue?.message ?? "Invalid request",
        field: firstIssue?.path.join(".") ?? "",
      });
    }

    const score = await storage.createScore(parsed.data);
    res.status(201).json(score);
  });

  await seedDatabase();

  return httpServer;
}

// Seed function (optional)
async function seedDatabase() {
  const existingUsers = await storage.getTopScores(1);
  if (existingUsers.length === 0) {
    const user = await storage.createUser({ username: "StackMaster", isGuest: false });
    await storage.createScore({
      userId: user.id,
      score: 1000,
      timeSeconds: 300,
      difficulty: "medium",
      completed: true,
      seed: "daily-1",
    });
  }
}
