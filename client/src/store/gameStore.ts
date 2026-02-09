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
  reason?: "blocked" | "illegal" | "tray-full" | "not-playing" | "not-free";
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
  pausedFrom: GamePhase | null;
  startGame: (difficulty?: Difficulty, levelNumber?: number, seed?: number) => LevelData;
  startTutorial: () => void;
  finishTutorial: () => void;
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
const TUTORIAL_MOVES_REQUIRED = 3;

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
      pausedFrom: null,
    });
  },

  finishTutorial: () => {
    updateProgress({ tutorialCompleted: true });
    set({ phase: "menu", tutorialStep: 0 });
  },

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

    if (state.tray.length >= state.trayLimit) {
      set({ lastMessage: "Tray full. Undo or restart." });
      return { ok: false, reason: "tray-full" };
    }

    if (!state.solverContext) {
      return { ok: false, reason: "not-playing" };
    }

    if (state.phase === "tutorial" && state.tutorialStep === 1) {
      if (index === state.tutorialTargets.blockedIndex) {
        set({
          tutorialStep: 2,
          hintTile: state.tutorialTargets.illegalIndex,
          lastMessage: "That tile is blocked. One side must be open.",
        });
      }
    }

    if (!isTileFree(state.solverContext, state, index)) {
      set({ lastMessage: "Tile is blocked." });
      return { ok: false, reason: "blocked" };
    }

    if (state.phase === "tutorial" && state.tutorialStep === 2) {
      if (index === state.tutorialTargets.illegalIndex) {
        const demoConflicts = [{ row: state.tiles[index].row, col: state.tiles[index].col }];
        set({
          tutorialStep: 3,
          hintTile: null,
          lastConflicts: demoConflicts,
          lastMessage: "Illegal move. That number conflicts with the row.",
        });
        return { ok: false, reason: "illegal", conflicts: demoConflicts };
      }
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
        lastMessage: "Illegal move.",
      });
      return { ok: false, reason: "illegal", conflicts };
    }

    const next = applyMove(state.solverContext, state, index);
    const nextTray = [...state.tray, index];
    const nextMoves = state.moves + 1;
    let nextPhase: GamePhase = state.phase;
    let lastMessage: string | null = null;
    let tutorialStep = state.tutorialStep;
    let tutorialMovesDone = state.tutorialMovesDone;

    if (state.phase === "tutorial") {
      if (tutorialStep === 0) {
        tutorialStep = 1;
      } else if (tutorialStep >= 5) {
        tutorialMovesDone += 1;
      }
    }

    if (next.present.every((value) => !value)) {
      nextPhase = state.phase === "tutorial" ? "tutorial" : "win";
    } else if (getLegalMoves(state.solverContext, next).length === 0) {
      nextPhase = state.phase === "tutorial" ? "tutorial" : "stuck";
      lastMessage = "No legal moves.";
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
    });

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

    const index = state.tray[state.tray.length - 1];
    const tile = state.tiles[index];
    const present = [...state.present];
    present[index] = true;

    const revealed = state.revealed.map((row) => [...row]);
    revealed[tile.row][tile.col] = null;

    const nextUndoRemaining =
      state.undoRemaining === null ? null : Math.max(0, state.undoRemaining - 1);

    let tutorialStep = state.tutorialStep;
    if (state.phase === "tutorial" && tutorialStep === 3) {
      tutorialStep = 4;
    }

    set({
      present,
      revealed,
      tray: state.tray.slice(0, -1),
      undosUsed: state.undosUsed + 1,
      undoRemaining: nextUndoRemaining,
      phase: state.phase === "paused" ? "paused" : state.phase,
      hintTile: null,
      lastMessage: null,
      lastConflicts: [],
      tutorialStep,
    });

    return true;
  },

  useHint: () => {
    const state = get();
    if (!state.solverContext) return null;
    if (state.hintsRemaining <= 0) return null;
    const hintIndex = getHintMove(state.solverContext, state);
    if (hintIndex === null) return null;

    let tutorialStep = state.tutorialStep;
    if (state.phase === "tutorial" && tutorialStep === 4) {
      tutorialStep = 5;
    }

    set({
      hintTile: hintIndex,
      hintsRemaining: state.hintsRemaining - 1,
      hintsUsed: state.hintsUsed + 1,
      tutorialStep,
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
