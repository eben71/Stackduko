import { create } from 'zustand';

// Types for Game State
export type Difficulty = 'easy' | 'medium' | 'hard';

interface GameState {
  // Game Status
  isPlaying: boolean;
  isPaused: boolean;
  isGameOver: boolean;
  gameWon: boolean;
  
  // Stats
  score: number;
  timeSeconds: number;
  mistakes: number;
  difficulty: Difficulty;
  
  // User Info
  userId: number | null;
  username: string | null;

  // Actions
  startGame: (difficulty: Difficulty) => void;
  endGame: (won: boolean) => void;
  pauseGame: () => void;
  resumeGame: () => void;
  resetGame: () => void;
  incrementTime: () => void;
  addScore: (points: number) => void;
  recordMistake: () => void;
  setUser: (id: number, username: string) => void;
}

export const useGameStore = create<GameState>((set) => ({
  isPlaying: false,
  isPaused: false,
  isGameOver: false,
  gameWon: false,
  
  score: 0,
  timeSeconds: 0,
  mistakes: 0,
  difficulty: 'medium',
  
  userId: null,
  username: null,

  startGame: (difficulty) => set({ 
    isPlaying: true, 
    isPaused: false, 
    isGameOver: false, 
    gameWon: false,
    score: 0,
    timeSeconds: 0,
    mistakes: 0,
    difficulty 
  }),

  endGame: (won) => set({ isPlaying: false, isGameOver: true, gameWon: won }),
  
  pauseGame: () => set({ isPaused: true }),
  
  resumeGame: () => set({ isPaused: false }),
  
  resetGame: () => set({ 
    isPlaying: false, 
    isPaused: false, 
    isGameOver: false, 
    score: 0, 
    timeSeconds: 0, 
    mistakes: 0 
  }),
  
  incrementTime: () => set((state) => ({ timeSeconds: state.timeSeconds + 1 })),
  
  addScore: (points) => set((state) => ({ score: state.score + points })),
  
  recordMistake: () => set((state) => ({ mistakes: state.mistakes + 1 })),

  setUser: (id, username) => set({ userId: id, username }),
}));
