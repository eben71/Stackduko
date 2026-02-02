import { z } from 'zod';
import { insertScoreSchema, scores, users, insertUserSchema } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  users: {
    getOrCreate: {
      method: 'POST' as const,
      path: '/api/users',
      input: insertUserSchema.optional(),
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        201: z.custom<typeof users.$inferSelect>(),
      }
    }
  },
  scores: {
    list: {
      method: 'GET' as const,
      path: '/api/scores',
      responses: {
        200: z.array(z.custom<typeof scores.$inferSelect & { user?: typeof users.$inferSelect }>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/scores',
      input: insertScoreSchema,
      responses: {
        201: z.custom<typeof scores.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
