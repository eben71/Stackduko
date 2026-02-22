import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import type { z } from "zod/v4";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  isGuest: boolean("is_guest").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const scores = pgTable("scores", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  score: integer("score").notNull(),
  timeSeconds: integer("time_seconds").notNull(),
  difficulty: text("difficulty").notNull(), // "easy", "medium", "hard"
  completed: boolean("completed").default(false),
  seed: text("seed"), // For replaying/daily challenges
  createdAt: timestamp("created_at").defaultNow(),
});

// Schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertScoreSchema = createInsertSchema(scores).omit({ id: true, createdAt: true });

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Score = typeof scores.$inferSelect;
export type InsertScore = z.infer<typeof insertScoreSchema>;

export type CreateScoreRequest = InsertScore;
export type ScoreResponse = Score & { user?: User };
