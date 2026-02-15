import { create } from "zustand";
import { getProgress, getSettings, updateProgress, type Difficulty } from "@/game/state/storage";
import { generateLevel, type LevelData } from "@/logic/level/levelGenerator";
import { mulberry32 } from "@/logic/rng";
import {
  canPlaceToken,
  countTokens,
  createInitialState,
  createSolverContext,
  getOpenTiles,
  isSolvable,
  isTileFree,
  legalCellsForToken,
  type SolverContext,
  type SolverState,
} from "@/logic/solver/solver";

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
  reason?:
    | "blocked"
    | "illegal"
    | "tray-full"
    | "not-playing"
    | "not-free"
    | "tutorial-locked"
    | "needs-placement"
    | "mismatch";
  conflicts?: { row: number; col: number }[];
};

export type TutorialTargets = { blockedIndex: number | null; illegalIndex: number | null };

type ActionRecord =
  | { type: "pair"; first: number; second: number }
  | {
      type: "placement";
      row: number;
      col: number;
      value: number;
      source: "hand" | "tray";
      index: number;
      turnBefore: number;
      barriersBefore: Record<string, number>;
      pendingBefore: number;
    }
  | { type: "tray"; value: number; index: number };

export type GameState = {
  phase: GamePhase;
  difficulty: Difficulty;
  levelNumber: number;
  seed: number | null;
  layoutId: string | null;
  tiles: LevelData["tiles"];
  present: boolean[];
  revealed: SolverState["grid"];
  solverContext: SolverContext | null;
  handTokens: number[];
  trayTokens: number[];
  tray: number[];
  trayLimit: number;
  selectedToken: { source: "hand" | "tray"; index: number } | null;
  pendingPairTile: number | null;
  pendingPairPlacements: number;
  barrierMap: Record<string, number>;
  turn: number;
  lives: number;
  hintsRemaining: number;
  hintsUsed: number;
  undosUsed: number;
  undoRemaining: number | null;
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
  pausedFrom: GamePhase | null;
  history: ActionRecord[];
  legalCells: Array<{ row: number; col: number }>;
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
  selectToken: (source: "hand" | "tray", index: number) => void;
  moveSelectedTokenToTray: () => AttemptResult;
  placeSelectedToken: (row: number, col: number) => AttemptResult;
};

const TRAY_LIMIT = 5;
const TUTORIAL_MOVES_REQUIRED = 4;

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
  handTokens: [],
  trayTokens: [],
  tray: [],
  trayLimit: TRAY_LIMIT,
  selectedToken: null,
  pendingPairTile: null,
  pendingPairPlacements: 0,
  barrierMap: {},
  turn: 0,
  lives: 3,
  hintsRemaining: 0,
  hintsUsed: 0,
  undosUsed: 0,
  undoRemaining: 3,
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
  pausedFrom: null,
  history: [],
  legalCells: [],

  startGame: (difficultyOverride, levelNumberOverride, seedOverride) => {
    const settings = getSettings();
    const difficulty = difficultyOverride ?? settings.defaultDifficulty;
    const progress = getProgress();
    const levelNumber = levelNumberOverride ?? progress.highestLevelUnlocked[difficulty];
    const seed = seedOverride ?? Date.now();
    const level = generateLevel({ seed, difficulty, levelNumber });
    const context = createSolverContext(level.tiles);
    const session = createInitialState(level.tiles);

    set({
      phase: "playing",
      difficulty,
      levelNumber,
      seed,
      layoutId: level.layoutId,
      tiles: level.tiles,
      present: session.present,
      revealed: session.grid,
      solverContext: context,
      handTokens: [],
      trayTokens: [],
      tray: [],
      selectedToken: null,
      pendingPairTile: null,
      pendingPairPlacements: 0,
      barrierMap: {},
      turn: 0,
      lives: 3,
      hintsRemaining: 0,
      hintsUsed: 0,
      undosUsed: 0,
      undoRemaining: 3,
      moves: 0,
      timeSeconds: 0,
      hintTile: null,
      lastConflicts: [],
      lastMessage: null,
      tutorialStep: 0,
      tutorialTargets: { blockedIndex: null, illegalIndex: null },
      tutorialMovesDone: 0,
      tutorialHintUsed: false,
      tutorialLastReveal: null,
      pausedFrom: null,
      history: [],
      legalCells: [],
    });
    return level;
  },

  startTutorial: () => {
    get().startGame("easy", 1, 777001);
    set({
      phase: "tutorial",
      tutorialStep: 0,
      lastMessage: "Pair open matching tiles, then place both tokens.",
    });
  },

  finishTutorial: () => {
    updateProgress({ tutorialCompleted: true });
    set({ phase: "menu", tutorialStep: 0 });
  },

  advanceTutorial: () =>
    set((s) => ({ tutorialStep: Math.min(5, s.tutorialStep + 1), lastMessage: null })),
  setPhase: (phase) => set({ phase }),
  pauseGame: () => set((state) => ({ phase: "paused", pausedFrom: state.phase })),
  resumeGame: () => set((state) => ({ phase: state.pausedFrom ?? "playing", pausedFrom: null })),
  quitToMenu: () => set({ phase: "menu", pausedFrom: null }),
  restartLevel: () => {
    const { difficulty, levelNumber, seed, phase } = get();
    if (phase === "tutorial") return get().startTutorial();
    get().startGame(difficulty, levelNumber, seed ?? Date.now());
  },
  incrementTime: () => set((state) => ({ timeSeconds: state.timeSeconds + 1 })),

  attemptRemoveTile: (index) => {
    const state = get();
    if (state.phase !== "playing" && state.phase !== "tutorial")
      return { ok: false, reason: "not-playing" };
    if (!state.solverContext || !state.present[index]) return { ok: false, reason: "not-free" };
    if (!isTileFree(state.solverContext, state, index)) {
      set({ lastMessage: "Tile is not open." });
      return { ok: false, reason: "blocked" };
    }
    if (state.handTokens.length + state.trayTokens.length > 0) {
      set({ lastMessage: "Place buffered tokens before removing another pair." });
      return { ok: false, reason: "needs-placement" };
    }
    if (state.pendingPairTile === null) {
      set({
        pendingPairTile: index,
        hintTile: null,
        lastMessage: `Selected ${state.tiles[index].value}. Pick a matching open tile.`,
      });
      return { ok: true };
    }
    if (state.pendingPairTile === index) {
      set({ pendingPairTile: null, lastMessage: "Pair selection cleared." });
      return { ok: false, reason: "mismatch" };
    }
    const first = state.pendingPairTile;
    if (state.tiles[first].value !== state.tiles[index].value) {
      set({
        pendingPairTile: null,
        lives: Math.max(0, state.lives - 1),
        lastMessage: "Tiles must match. Life lost.",
      });
      return { ok: false, reason: "mismatch" };
    }
    const present = [...state.present];
    present[first] = false;
    present[index] = false;
    const value = state.tiles[index].value;
    const handTokens = [value, value];
    set({
      present,
      handTokens,
      trayTokens: [],
      tray: [],
      selectedToken: { source: "hand", index: 0 },
      pendingPairTile: null,
      pendingPairPlacements: 2,
      moves: state.moves + 1,
      hintTile: null,
      history: [...state.history, { type: "pair", first, second: index }],
      lastMessage: `Pair removed. Place two ${value} tokens.`,
      legalCells: legalCellsForToken(state.revealed, value, state.barrierMap),
    });
    return { ok: true };
  },

  selectToken: (source, index) => {
    const state = get();
    const pool = source === "hand" ? state.handTokens : state.trayTokens;
    if (index < 0 || index >= pool.length) return;
    const value = pool[index];
    set({
      selectedToken: { source, index },
      legalCells: legalCellsForToken(state.revealed, value, state.barrierMap),
    });
  },

  moveSelectedTokenToTray: () => {
    const state = get();
    if (!state.selectedToken || state.selectedToken.source !== "hand")
      return { ok: false, reason: "not-playing" };
    if (state.trayTokens.length >= state.trayLimit) return { ok: false, reason: "tray-full" };
    const hand = [...state.handTokens];
    const [value] = hand.splice(state.selectedToken.index, 1);
    const tray = [...state.trayTokens, value];
    set({
      handTokens: hand,
      trayTokens: tray,
      tray,
      selectedToken: tray.length > 0 ? { source: "tray", index: tray.length - 1 } : null,
      history: [...state.history, { type: "tray", value, index: state.selectedToken.index }],
      legalCells:
        tray.length > 0
          ? legalCellsForToken(state.revealed, tray[tray.length - 1], state.barrierMap)
          : [],
    });
    return { ok: true };
  },

  placeSelectedToken: (row, col) => {
    const state = get();
    if (!state.selectedToken) return { ok: false, reason: "not-playing" };
    const sourcePool = state.selectedToken.source === "hand" ? state.handTokens : state.trayTokens;
    const value = sourcePool[state.selectedToken.index];
    if (value === undefined) return { ok: false, reason: "not-playing" };

    if (!canPlaceToken(state.revealed, value, row, col, state.barrierMap)) {
      const lives = Math.max(0, state.lives - 1);
      set({ lives, lastMessage: "Illegal placement. Life lost.", lastConflicts: [{ row, col }] });
      return { ok: false, reason: "illegal", conflicts: [{ row, col }] };
    }

    const revealed = state.revealed.map((r) => [...r]);
    revealed[row][col] = value;
    const nextPool = [...sourcePool];
    nextPool.splice(state.selectedToken.index, 1);
    const handTokens = state.selectedToken.source === "hand" ? nextPool : [...state.handTokens];
    const trayTokens = state.selectedToken.source === "tray" ? nextPool : [...state.trayTokens];

    const nextTurn = state.turn + 1;
    const pendingPairPlacements = Math.max(0, state.pendingPairPlacements - 1);
    const barriersBefore = { ...state.barrierMap };
    let barrierMap = expireBarriers(state.barrierMap, nextTurn);
    if (pendingPairPlacements === 0 && state.pendingPairPlacements > 0) {
      barrierMap = applyFairBarriers({
        difficulty: state.difficulty,
        seed: state.seed ?? 0,
        turn: nextTurn,
        grid: revealed,
        barrierMap,
        requiredTokens: [...handTokens, ...trayTokens],
      });
    }

    const selectedToken =
      handTokens.length > 0
        ? { source: "hand" as const, index: 0 }
        : trayTokens.length > 0
          ? { source: "tray" as const, index: 0 }
          : null;
    const legalCells = selectedToken
      ? legalCellsForToken(
          revealed,
          (selectedToken.source === "hand" ? handTokens : trayTokens)[selectedToken.index],
          barrierMap,
        )
      : [];

    let phase = state.phase;
    if (state.lives <= 0) {
      phase = "stuck";
    } else if (revealed.every((r) => r.every((c) => c !== null))) {
      phase = "win";
    } else if (
      !isSolvable(state.solverContext!, {
        present: state.present,
        grid: revealed,
        revealed,
        handTokens,
        trayTokens,
        selectedToken,
        pendingPairTile: state.pendingPairTile,
        pendingPairPlacements,
        lives: state.lives,
        undosRemaining: state.undoRemaining ?? 0,
        barriers: barrierMap,
        turn: nextTurn,
      })
    ) {
      phase = "stuck";
    }

    set({
      revealed,
      handTokens,
      trayTokens,
      selectedToken,
      legalCells,
      barrierMap,
      turn: nextTurn,
      pendingPairPlacements,
      moves: state.moves + 1,
      hintTile: null,
      lastConflicts: [],
      lastMessage: `Placed ${value} at R${row + 1} C${col + 1}`,
      phase,
      history: [
        ...state.history,
        {
          type: "placement",
          row,
          col,
          value,
          source: state.selectedToken.source,
          index: state.selectedToken.index,
          turnBefore: state.turn,
          barriersBefore,
          pendingBefore: state.pendingPairPlacements,
        },
      ],
    });

    if (phase === "win") finalizeWin(get());
    return { ok: true };
  },

  undoMove: () => {
    const state = get();
    if (!state.history.length) return false;
    if (state.undoRemaining !== null && state.undoRemaining <= 0) return false;
    const action = state.history[state.history.length - 1];
    const history = state.history.slice(0, -1);
    if (action.type === "pair") {
      const present = [...state.present];
      present[action.first] = true;
      present[action.second] = true;
      set({
        present,
        handTokens: [],
        trayTokens: [],
        tray: [],
        selectedToken: null,
        pendingPairPlacements: 0,
        history,
        undoRemaining: (state.undoRemaining ?? 0) - 1,
        undosUsed: state.undosUsed + 1,
      });
      return true;
    }
    if (action.type === "tray") {
      const trayTokens = [...state.trayTokens];
      trayTokens.pop();
      set({
        handTokens: [...state.handTokens, action.value],
        trayTokens,
        tray: trayTokens,
        selectedToken: { source: "hand", index: state.handTokens.length },
        history,
        undoRemaining: (state.undoRemaining ?? 0) - 1,
        undosUsed: state.undosUsed + 1,
      });
      return true;
    }
    const revealed = state.revealed.map((r) => [...r]);
    revealed[action.row][action.col] = null;
    const handTokens = [...state.handTokens];
    const trayTokens = [...state.trayTokens];
    if (action.source === "hand") handTokens.splice(action.index, 0, action.value);
    else trayTokens.splice(action.index, 0, action.value);
    set({
      revealed,
      handTokens,
      trayTokens,
      tray: trayTokens,
      selectedToken: { source: action.source, index: action.index },
      barrierMap: action.barriersBefore,
      turn: action.turnBefore,
      pendingPairPlacements: action.pendingBefore,
      history,
      undoRemaining: (state.undoRemaining ?? 0) - 1,
      undosUsed: state.undosUsed + 1,
      phase: state.phase === "stuck" ? "playing" : state.phase,
    });
    return true;
  },

  useHint: () => {
    const state = get();
    if (!state.solverContext) return null;
    const openTiles = getOpenTiles(state.solverContext, state);
    const byValue = new Map<number, number[]>();
    for (const index of openTiles) {
      const value = state.tiles[index].value;
      const arr = byValue.get(value) ?? [];
      arr.push(index);
      byValue.set(value, arr);
    }
    const pair = Array.from(byValue.values()).find((arr) => arr.length >= 2);
    if (!pair) return null;
    const hintTile = pair[0];
    set({
      hintTile,
      hintsUsed: state.hintsUsed + 1,
      lastMessage: "Hint: start with a highlighted tile and find its match.",
    });
    return hintTile;
  },

  clearHint: () => set({ hintTile: null }),
  clearMessage: () => set({ lastMessage: null }),
}));

function expireBarriers(barrierMap: Record<string, number>, turn: number) {
  const next: Record<string, number> = {};
  Object.entries(barrierMap).forEach(([key, expiry]) => {
    if (expiry > turn) next[key] = expiry;
  });
  return next;
}

function applyFairBarriers(params: {
  difficulty: Difficulty;
  seed: number;
  turn: number;
  grid: SolverState["grid"];
  barrierMap: Record<string, number>;
  requiredTokens: number[];
}) {
  const countsByDifficulty: Record<Difficulty, number> = { easy: 2, medium: 3, hard: 4 };
  const count = countsByDifficulty[params.difficulty];
  const candidates: Array<{ row: number; col: number }> = [];
  for (let row = 0; row < 9; row += 1) {
    for (let col = 0; col < 9; col += 1) {
      if (params.grid[row][col] === null) candidates.push({ row, col });
    }
  }
  const rng = mulberry32(params.seed + params.turn * 101);
  const shuffled = [...candidates].sort(() => rng() - 0.5);
  const next = { ...params.barrierMap };
  for (const cell of shuffled) {
    if (Object.keys(next).length - Object.keys(params.barrierMap).length >= count) break;
    const key = `${cell.row},${cell.col}`;
    if (next[key] !== undefined) continue;
    const trial = { ...next, [key]: params.turn + 2 };
    if (isBarrierFair(params.grid, params.requiredTokens, trial)) {
      next[key] = params.turn + 2;
    }
  }
  return next;
}

function isBarrierFair(
  grid: SolverState["grid"],
  requiredTokens: number[],
  barrierMap: Record<string, number>,
) {
  const tokenCounts = countTokens(requiredTokens);
  for (const [value, needed] of Array.from(tokenCounts.entries())) {
    const legalCount = legalCellsForToken(grid, value, barrierMap).length;
    if (legalCount < needed) return false;
  }
  return true;
}

function finalizeWin(state: GameState) {
  if (state.seed === null) return;
  const progress = getProgress();
  const key = `${state.difficulty}:${state.seed}`;
  const timeMs = state.timeSeconds * 1000;
  updateProgress({
    totalWins: progress.totalWins + 1,
    bestTimesMs:
      progress.bestTimesMs[key] === undefined || timeMs < progress.bestTimesMs[key]
        ? { [key]: timeMs }
        : {},
    bestMoves:
      progress.bestMoves[key] === undefined || state.moves < progress.bestMoves[key]
        ? { [key]: state.moves }
        : {},
    highestLevelUnlocked: {
      ...progress.highestLevelUnlocked,
      [state.difficulty]: Math.max(
        progress.highestLevelUnlocked[state.difficulty],
        state.levelNumber + 1,
      ),
    },
  });
}
