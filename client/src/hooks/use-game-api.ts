import { useQuery, useMutation } from "@tanstack/react-query";

type InsertUser = {
  username: string;
};

type CreateScoreRequest = {
  userId: number;
  score: number;
  timeSeconds: number;
  difficulty: string;
  completed: boolean;
  seed: string;
};

export function useUser(username: string | null) {
  return { username };
}

export function useGetOrCreateUser() {
  return useMutation({
    mutationFn: async (data: InsertUser) => {
      return { id: 1, username: data.username };
    },
  });
}

export function useScores() {
  return useQuery({
    queryKey: ["scores"],
    queryFn: async () => [],
  });
}

export function useSubmitScore() {
  return useMutation({
    mutationFn: async (data: CreateScoreRequest) => {
      void data;
      return { ok: true };
    },
  });
}
