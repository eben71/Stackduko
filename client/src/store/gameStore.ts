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

  // Solving Layer
  selectedCell: { r: number, c: number } | null;
  board: number[][];
  userGrid: number[][];
  notes: boolean[][][]; // [row][col][num 1-9]
  isNotesMode: boolean;

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
  setSelectedCell: (cell: { r: number, c: number } | null) => void;
  setCellValue: (val: number) => void;
  toggleNote: (val: number) => void;
  toggleNotesMode: () => void;
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

  selectedCell: null,
  board: Array(9).fill(null).map(() => Array(9).fill(0)),
  userGrid: Array(9).fill(null).map(() => Array(9).fill(0)),
  notes: Array(9).fill(null).map(() => Array(9).fill(null).map(() => Array(10).fill(false))),
  isNotesMode: false,

  startGame: (difficulty) => set({ 
    isPlaying: true, 
    isPaused: false, 
    isGameOver: false, 
    gameWon: false,
    score: 0,
    timeSeconds: 0,
    mistakes: 0,
    difficulty,
    userGrid: Array(9).fill(null).map(() => Array(9).fill(0)),
    notes: Array(9).fill(null).map(() => Array(9).fill(null).map(() => Array(10).fill(false))),
    selectedCell: null
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
    mistakes: 0,
    userGrid: Array(9).fill(null).map(() => Array(9).fill(0)),
    selectedCell: null
  }),
  
  incrementTime: () => set((state) => ({ timeSeconds: state.timeSeconds + 1 })),
  
  addScore: (points) => set((state) => ({ score: state.score + points })),
  
  recordMistake: () => set((state) => ({ mistakes: state.mistakes + 1 })),

  setUser: (id, username) => set({ userId: id, username }),

  setSelectedCell: (cell) => set({ selectedCell: cell }),

  setCellValue: (val) => set((state) => {
    if (!state.selectedCell) return state;
    const { r, c } = state.selectedCell;
    const newUserGrid = [...state.userGrid.map(row => [...row])];
    
    // Validation
    if (val !== 0 && state.board[r][c] !== val) {
      // Mistake
      return { mistakes: state.mistakes + 1 };
    }

    newUserGrid[r][c] = val;
    return { userGrid: newUserGrid };
  }),

  toggleNote: (val) => set((state) => {
    if (!state.selectedCell) return state;
    const { r, c } = state.selectedCell;
    const newNotes = [...state.notes.map(row => row.map(col => [...col]))];
    newNotes[r][c][val] = !newNotes[r][c][val];
    return { notes: newNotes };
  }),

  toggleNotesMode: () => set((state) => ({ isNotesMode: !state.isNotesMode })),
}));
