import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(httpServer: Server, app: Express): Promise<Server> {
  // Users
  app.post(api.users.getOrCreate.path, async (req, res) => {
    try {
      // Simple guest auth: if username exists, return it, else create
      // In a real app, we'd use Replit Auth or proper sessions
      const input = api.users.getOrCreate.input?.parse(req.body);

      if (!input?.username) {
        // Create generic guest
        const username = `Guest${Math.floor(Math.random() * 10000)}`;
        const user = await storage.createUser({ username, isGuest: true });
        return res.status(201).json(user);
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
    try {
      const input = api.scores.create.input.parse(req.body);
      const score = await storage.createScore(input);
      res.status(201).json(score);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join("."),
        });
      }
      throw err;
    }
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
