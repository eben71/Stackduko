import { create } from "zustand";
import { getProgress, getSettings, updateProgress, type Difficulty } from "@/game/state/storage";
import { generateLevel, type LevelData } from "@/logic/level/levelGenerator";
import { getConflictCells } from "@/logic/sudoku/validate";
import {
  applyMove,
  createInitialState,
  createSolverContext,
  getHintMove,
  getLegalMoves,
  isRevealLegal,
  isTileFree,
  type SolverContext,
  type SolverState,
} from "@/logic/solver/solver";
import { type TileSpec } from "@/logic/stack/types";

export type GamePhase =
  | "boot"
  | "menu"
  | "difficulty"
  | "tutorial"
  | "playing"
  | "paused"
  | "win"
  | "stuck";

export type AttemptResult = {
  ok: boolean;
  reason?: "blocked" | "illegal" | "tray-full" | "not-playing" | "not-free" | "tutorial-locked";
  conflicts?: { row: number; col: number }[];
};

export type TutorialTargets = {
  blockedIndex: number | null;
  illegalIndex: number | null;
};

export type GameState = {
  phase: GamePhase;
  difficulty: Difficulty;
  levelNumber: number;
  seed: number | null;
  layoutId: string | null;
  tiles: TileSpec[];
  present: boolean[];
  revealed: SolverState["revealed"];
  solverContext: SolverContext | null;
  tray: number[];
  trayLimit: number;
  hintsRemaining: number;
  hintsUsed: number;
  undoLimit: number | null;
  undoRemaining: number | null;
  undosUsed: number;
  moves: number;
  timeSeconds: number;
  hintTile: number | null;
  lastConflicts: { row: number; col: number }[];
  lastMessage: string | null;
  tutorialStep: number;
  tutorialTargets: TutorialTargets;
  tutorialMovesRequired: number;
  tutorialMovesDone: number;
  tutorialHintUsed: boolean;
  tutorialLastReveal: { row: number; col: number; value: number } | null;
  trayOverflowNotified: boolean;
  pausedFrom: GamePhase | null;
  startGame: (difficulty?: Difficulty, levelNumber?: number, seed?: number) => LevelData;
  startTutorial: () => void;
  finishTutorial: () => void;
  advanceTutorial: () => void;
  setPhase: (phase: GamePhase) => void;
  pauseGame: () => void;
  resumeGame: () => void;
  quitToMenu: () => void;
  restartLevel: () => void;
  incrementTime: () => void;
  attemptRemoveTile: (index: number) => AttemptResult;
  undoMove: () => boolean;
  useHint: () => number | null;
  clearHint: () => void;
  clearMessage: () => void;
};

const TRAY_LIMIT = 7;
const TUTORIAL_MOVES_REQUIRED = 5;

export const useGameStore = create<GameState>((set, get) => ({
  phase: "boot",
  difficulty: "medium",
  levelNumber: 1,
  seed: null,
  layoutId: null,
  tiles: [],
  present: [],
  revealed: [],
  solverContext: null,
  tray: [],
  trayLimit: TRAY_LIMIT,
  hintsRemaining: 0,
  hintsUsed: 0,
  undoLimit: null,
  undoRemaining: null,
  undosUsed: 0,
  moves: 0,
  timeSeconds: 0,
  hintTile: null,
  lastConflicts: [],
  lastMessage: null,
  tutorialStep: 0,
  tutorialTargets: { blockedIndex: null, illegalIndex: null },
  tutorialMovesRequired: TUTORIAL_MOVES_REQUIRED,
  tutorialMovesDone: 0,
  tutorialHintUsed: false,
  tutorialLastReveal: null,
  trayOverflowNotified: false,
  pausedFrom: null,

  startGame: (difficultyOverride, levelNumberOverride, seedOverride) => {
    const settings = getSettings();
    const difficulty = difficultyOverride ?? settings.defaultDifficulty;
    const progress = getProgress();
    const levelNumber = levelNumberOverride ?? progress.highestLevelUnlocked[difficulty];
    const seed = seedOverride ?? Date.now();

    const level = generateLevel({ seed, difficulty, levelNumber });
    const context = createSolverContext(level.tiles);
    const session = createInitialState(level.tiles);

    updateProgress({
      totalPlays: progress.totalPlays + 1,
      lastPlayedAt: new Date().toISOString(),
      lastDifficultyPlayed: difficulty,
      lastSeedPlayed: seed,
    });

    set({
      phase: "playing",
      difficulty,
      levelNumber,
      seed,
      layoutId: level.layoutId,
      tiles: level.tiles,
      present: session.present,
      revealed: session.revealed,
      solverContext: context,
      tray: [],
      hintsRemaining: settings.hintsPerLevel,
      hintsUsed: 0,
      undoLimit: settings.undoLimit,
      undoRemaining: settings.undoLimit === null ? null : settings.undoLimit,
      undosUsed: 0,
      moves: 0,
      timeSeconds: 0,
      hintTile: null,
      lastConflicts: [],
      lastMessage: null,
      tutorialStep: 0,
      tutorialTargets: { blockedIndex: null, illegalIndex: null },
      tutorialMovesDone: 0,
      tutorialMovesRequired: TUTORIAL_MOVES_REQUIRED,
      tutorialHintUsed: false,
      tutorialLastReveal: null,
      trayOverflowNotified: false,
      pausedFrom: null,
    });

    return level;
  },

  startTutorial: () => {
    const settings = getSettings();
    const seed = 777001;
    const level = generateLevel({ seed, difficulty: "easy", levelNumber: 1 });
    const context = createSolverContext(level.tiles);
    const session = createInitialState(level.tiles);

    const free = getLegalMoves(context, session);
    const blocked = level.tiles.findIndex((_, index) => !isTileFree(context, session, index));
    const illegalIndex = free.find((index) => index !== blocked) ?? free[0] ?? null;

    set({
      phase: "tutorial",
      difficulty: "easy",
      levelNumber: 1,
      seed,
      layoutId: level.layoutId,
      tiles: level.tiles,
      present: session.present,
      revealed: session.revealed,
      solverContext: context,
      tray: [],
      hintsRemaining: settings.hintsPerLevel,
      hintsUsed: 0,
      undoLimit: settings.undoLimit,
      undoRemaining: settings.undoLimit === null ? null : settings.undoLimit,
      undosUsed: 0,
      moves: 0,
      timeSeconds: 0,
      hintTile: null,
      lastConflicts: [],
      lastMessage: null,
      tutorialStep: 0,
      tutorialTargets: {
        blockedIndex: blocked >= 0 ? blocked : null,
        illegalIndex,
      },
      tutorialMovesDone: 0,
      tutorialMovesRequired: TUTORIAL_MOVES_REQUIRED,
      tutorialHintUsed: false,
      tutorialLastReveal: null,
      trayOverflowNotified: false,
      pausedFrom: null,
    });
  },

  finishTutorial: () => {
    updateProgress({ tutorialCompleted: true });
    set({ phase: "menu", tutorialStep: 0 });
  },

  advanceTutorial: () =>
    set((state) => {
      if (state.phase !== "tutorial") return {};
      if (state.tutorialStep === 0) {
        return { tutorialStep: 1, lastMessage: null };
      }
      if (state.tutorialStep === 1) {
        return { tutorialStep: 2, lastMessage: null };
      }
      if (state.tutorialStep === 7) {
        return {
          tutorialStep: 8,
          tutorialMovesDone: 0,
          tutorialHintUsed: false,
          hintTile: null,
          lastMessage: null,
        };
      }
      return {};
    }),

  setPhase: (phase) => set({ phase }),

  pauseGame: () =>
    set((state) => ({
      phase: "paused",
      pausedFrom: state.phase === "tutorial" ? "tutorial" : "playing",
    })),

  resumeGame: () =>
    set((state) => ({
      phase: state.pausedFrom ?? "playing",
      pausedFrom: null,
    })),

  quitToMenu: () => set({ phase: "menu", pausedFrom: null }),

  restartLevel: () => {
    const { difficulty, levelNumber, seed, phase, pausedFrom } = get();
    if (phase === "tutorial" || (phase === "paused" && pausedFrom === "tutorial")) {
      get().startTutorial();
      return;
    }
    get().startGame(difficulty, levelNumber, seed ?? Date.now());
  },

  incrementTime: () => set((state) => ({ timeSeconds: state.timeSeconds + 1 })),

  attemptRemoveTile: (index) => {
    const state = get();
    if (state.phase !== "playing" && state.phase !== "tutorial") {
      return { ok: false, reason: "not-playing" };
    }

    if (!state.present[index]) {
      return { ok: false, reason: "not-free" };
    }

    if (!state.solverContext) {
      return { ok: false, reason: "not-playing" };
    }

    if (state.phase === "tutorial" && state.tutorialStep < 2) {
      set({ lastMessage: "Read the tutorial panel, then press Next." });
      return { ok: false, reason: "tutorial-locked" };
    }

    if (state.phase === "tutorial" && state.tutorialStep === 7) {
      set({ lastMessage: "Review Undo History, then press Next to continue." });
      return { ok: false, reason: "tutorial-locked" };
    }

    if (state.phase === "tutorial" && state.tutorialStep === 3) {
      if (index === state.tutorialTargets.blockedIndex) {
        set({
          tutorialStep: 4,
          hintTile: state.tutorialTargets.illegalIndex,
          lastMessage:
            "Blocked tile: it has a tile on top or both sides are blocked. Look for an open side.",
        });
        return { ok: false, reason: "blocked" };
      }
      set({ lastMessage: "Tap the blocked tile highlighted in the stack." });
      return { ok: false, reason: "tutorial-locked" };
    }

    if (!isTileFree(state.solverContext, state, index)) {
      set({ lastMessage: "Blocked tile: one side must be open and nothing can sit on top." });
      return { ok: false, reason: "blocked" };
    }

    if (state.phase === "tutorial" && state.tutorialStep === 6) {
      if (!state.tutorialHintUsed) {
        set({ lastMessage: "Press Hint to highlight a safe tile first." });
        return { ok: false, reason: "tutorial-locked" };
      }
      if (state.hintTile !== null && index !== state.hintTile) {
        set({ lastMessage: "Remove the highlighted tile to complete the hint step." });
        return { ok: false, reason: "tutorial-locked" };
      }
    }

    if (state.phase === "tutorial" && state.tutorialStep === 4) {
      if (index === state.tutorialTargets.illegalIndex) {
        const demoConflicts = [
          { row: state.tiles[index].row, col: state.tiles[index].col },
          { row: state.tiles[index].row, col: Math.max(0, state.tiles[index].col - 1) },
        ];
        set({
          tutorialStep: 5,
          hintTile: null,
          lastConflicts: demoConflicts,
          lastMessage: `Illegal reveal: duplicates ${state.tiles[index].value} in this row.`,
        });
        return { ok: false, reason: "illegal", conflicts: demoConflicts };
      }
      set({ lastMessage: "Tap the highlighted tile to see a Sudoku conflict." });
      return { ok: false, reason: "tutorial-locked" };
    }

    const tile = state.tiles[index];
    if (!isRevealLegal(state.revealed, tile.row, tile.col, tile.value)) {
      const conflicts = getConflictCells(
        state.revealed.map((row) => row.map((cell) => cell ?? 0)),
        tile.row,
        tile.col,
        tile.value,
      );
      set({
        lastConflicts: conflicts,
        lastMessage: describeConflict(state.revealed, tile.row, tile.col, tile.value),
      });
      return { ok: false, reason: "illegal", conflicts };
    }

    const next = applyMove(state.solverContext, state, index);
    const nextTray = [...state.tray, index];
    const overflowed = nextTray.length > state.trayLimit;
    if (overflowed) {
      nextTray.shift();
    }
    const nextMoves = state.moves + 1;
    let nextPhase: GamePhase = state.phase;
    let lastMessage: string | null = `Revealed R${tile.row + 1} C${tile.col + 1} = ${tile.value}`;
    let tutorialStep = state.tutorialStep;
    let tutorialMovesDone = state.tutorialMovesDone;
    let tutorialHintUsed = state.tutorialHintUsed;
    let tutorialLastReveal = { row: tile.row, col: tile.col, value: tile.value };
    let trayOverflowNotified = state.trayOverflowNotified;

    if (state.phase === "tutorial") {
      if (tutorialStep === 2) {
        tutorialStep = 3;
      } else if (tutorialStep === 6 && tutorialHintUsed && state.hintTile === index) {
        tutorialStep = 7;
        tutorialHintUsed = false;
        lastMessage = "Nice! The hint showed a legal reveal.";
      } else if (tutorialStep >= 8) {
        tutorialMovesDone += 1;
      }
    }

    if (next.present.every((value) => !value)) {
      nextPhase = state.phase === "tutorial" ? "tutorial" : "win";
    } else if (getLegalMoves(state.solverContext, next).length === 0) {
      nextPhase = state.phase === "tutorial" ? "tutorial" : "stuck";
      lastMessage = "No legal reveals. Use hint or undo.";
    }

    set({
      present: next.present,
      revealed: next.revealed,
      tray: nextTray,
      moves: nextMoves,
      hintTile: null,
      lastConflicts: [],
      lastMessage,
      phase: nextPhase,
      tutorialStep,
      tutorialMovesDone,
      tutorialHintUsed,
      tutorialLastReveal,
      trayOverflowNotified: overflowed && !trayOverflowNotified ? true : state.trayOverflowNotified,
    });

    if (overflowed && !trayOverflowNotified) {
      set({
        lastMessage: `Undo history full. Older moves are locked in (undo affects the last ${state.trayLimit} reveals).`,
      });
    }

    if (nextPhase === "win") {
      finalizeWin(get());
    }

    return { ok: true };
  },

  undoMove: () => {
    const state = get();
    if (!state.solverContext) return false;
    if (state.tray.length === 0) return false;
    if (state.undoRemaining !== null && state.undoRemaining <= 0) return false;
    if (state.phase === "tutorial" && state.tutorialStep < 5) {
      set({ lastMessage: "Undo comes later in the tutorial." });
      return false;
    }

    const index = state.tray[state.tray.length - 1];
    const tile = state.tiles[index];
    const present = [...state.present];
    present[index] = true;

    const revealed = state.revealed.map((row) => [...row]);
    revealed[tile.row][tile.col] = null;

    const nextUndoRemaining =
      state.undoRemaining === null ? null : Math.max(0, state.undoRemaining - 1);

    let tutorialStep = state.tutorialStep;
    if (state.phase === "tutorial" && tutorialStep === 5) {
      tutorialStep = 6;
    }

    set({
      present,
      revealed,
      tray: state.tray.slice(0, -1),
      undosUsed: state.undosUsed + 1,
      undoRemaining: nextUndoRemaining,
      phase: state.phase === "paused" ? "paused" : state.phase,
      hintTile: null,
      lastMessage: "Undo restored the tile and hid the grid cell.",
      lastConflicts: [],
      tutorialStep,
      tutorialHintUsed: false,
    });

    return true;
  },

  useHint: () => {
    const state = get();
    if (!state.solverContext) return null;
    if (state.hintsRemaining <= 0) return null;
    if (state.phase === "tutorial" && state.tutorialStep < 6) {
      set({ lastMessage: "Hints come later in the tutorial." });
      return null;
    }
    const hintIndex = getHintMove(state.solverContext, state);
    if (hintIndex === null) return null;

    let tutorialStep = state.tutorialStep;
    if (state.phase === "tutorial" && tutorialStep === 6) {
      tutorialStep = 6;
    }

    set({
      hintTile: hintIndex,
      hintsRemaining: state.hintsRemaining - 1,
      hintsUsed: state.hintsUsed + 1,
      tutorialStep,
      tutorialHintUsed:
        state.phase === "tutorial" && state.tutorialStep === 6 ? true : state.tutorialHintUsed,
      lastMessage: state.phase === "tutorial" ? "Hint active: remove the highlighted tile." : null,
    });

    return hintIndex;
  },

  clearHint: () => set({ hintTile: null }),

  clearMessage: () => set({ lastMessage: null }),
}));

function finalizeWin(state: GameState) {
  if (state.seed === null) return;
  const progress = getProgress();
  const key = `${state.difficulty}:${state.seed}`;
  const timeMs = state.timeSeconds * 1000;
  const moves = state.moves;

  const currentBestTime = progress.bestTimesMs[key];
  const currentBestMoves = progress.bestMoves[key];

  const bestTimesMs =
    currentBestTime === undefined || timeMs < currentBestTime ? { [key]: timeMs } : {};
  const bestMoves =
    currentBestMoves === undefined || moves < currentBestMoves ? { [key]: moves } : {};

  updateProgress({
    totalWins: progress.totalWins + 1,
    bestTimesMs,
    bestMoves,
    highestLevelUnlocked: {
      ...progress.highestLevelUnlocked,
      [state.difficulty]: Math.max(
        progress.highestLevelUnlocked[state.difficulty],
        state.levelNumber + 1,
      ),
    },
  });
}

function describeConflict(
  revealed: SolverState["revealed"],
  row: number,
  col: number,
  value: number,
) {
  if (revealed[row][col] !== null) {
    return "Illegal reveal: that cell is already revealed.";
  }
  const rowConflict = revealed[row].some((cell, index) => index !== col && cell === value);
  const colConflict = revealed.some((cells, index) => index !== row && cells[col] === value);
  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;
  let boxConflict = false;
  for (let r = boxRow; r < boxRow + 3; r += 1) {
    for (let c = boxCol; c < boxCol + 3; c += 1) {
      if (r === row && c === col) continue;
      if (revealed[r][c] === value) {
        boxConflict = true;
        break;
      }
    }
    if (boxConflict) break;
  }
  const parts = [];
  if (rowConflict) parts.push("row");
  if (colConflict) parts.push("column");
  if (boxConflict) parts.push("box");
  if (parts.length === 0) {
    return "Illegal reveal.";
  }
  if (parts.length === 1) {
    return `Illegal reveal: duplicates ${value} in this ${parts[0]}.`;
  }
  if (parts.length === 2) {
    return `Illegal reveal: duplicates ${value} in this ${parts[0]} and ${parts[1]}.`;
  }
  return `Illegal reveal: duplicates ${value} in this row, column, and box.`;
}
