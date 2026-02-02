import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type CreateScoreRequest, type InsertUser } from "@shared/routes";
import { z } from "zod";

// ============================================
// USERS
// ============================================

export function useUser(username: string | null) {
  // This is a bit of a hack since we don't have a direct "get user" endpoint in the manifest
  // that takes just an ID/username without creating.
  // In a real app, we'd probably store the user in local storage or have a session endpoint.
  // For now, we'll assume the user is managed via the creation flow.
  return { username }; 
}

export function useGetOrCreateUser() {
  return useMutation({
    mutationFn: async (data: InsertUser) => {
      // Validate locally first just in case
      const validated = api.users.getOrCreate.input?.parse(data);
      
      const res = await fetch(api.users.getOrCreate.path, {
        method: api.users.getOrCreate.method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validated || data),
      });
      
      if (!res.ok) throw new Error('Failed to login/register');
      // The response schema has a union, usually we just parse with the success schema
      return api.users.getOrCreate.responses[200].parse(await res.json());
    },
  });
}

// ============================================
// SCORES
// ============================================

export function useScores() {
  return useQuery({
    queryKey: [api.scores.list.path],
    queryFn: async () => {
      const res = await fetch(api.scores.list.path);
      if (!res.ok) throw new Error('Failed to fetch scores');
      return api.scores.list.responses[200].parse(await res.json());
    },
  });
}

export function useSubmitScore() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateScoreRequest) => {
      const validated = api.scores.create.input.parse(data);
      const res = await fetch(api.scores.create.path, {
        method: api.scores.create.method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validated),
      });

      if (!res.ok) {
        if (res.status === 400) {
          const error = api.scores.create.responses[400].parse(await res.json());
          throw new Error(error.message);
        }
        throw new Error('Failed to submit score');
      }
      return api.scores.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.scores.list.path] });
    },
  });
}
