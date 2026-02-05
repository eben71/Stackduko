import { db } from "./db";
import {
  users,
  scores,
  type User,
  type InsertUser,
  type Score,
  type InsertScore,
} from "@shared/schema";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Scores
  createScore(score: InsertScore): Promise<Score>;
  getTopScores(limit?: number): Promise<(Score & { user: User | undefined })[]>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async createScore(insertScore: InsertScore): Promise<Score> {
    const [score] = await db.insert(scores).values(insertScore).returning();
    return score;
  }

  async getTopScores(limit = 10): Promise<(Score & { user: User | undefined })[]> {
    // Join with users for leaderboard
    const results = await db
      .select({
        score: scores,
        user: users,
      })
      .from(scores)
      .leftJoin(users, eq(scores.userId, users.id))
      .orderBy(desc(scores.score))
      .limit(limit);

    return results.map((r) => ({ ...r.score, user: r.user ?? undefined }));
  }
}

export const storage = new DatabaseStorage();
