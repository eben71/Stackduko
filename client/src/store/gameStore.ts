import { create } from "zustand";
import { getProgress, getSettings, updateProgress, type Difficulty } from "@/game/state/storage";
import { isStuckState } from "@/game/mechanics/livesUndos";
import { canPlaceValue, legalCellsForValue } from "@/game/mechanics/placement";
import { hasAnyRemovablePair, isRemovablePair } from "@/game/mechanics/pairRemoval";
import {
  TOKEN_BUFFER_CAPACITY,
  addTokens,
  canAddTokens,
  removeTokenAt,
} from "@/game/mechanics/tokenBuffer";
import { generateLevel, type LevelData } from "@/logic/level/levelGenerator";
import { buildAdjacency } from "@/logic/stack/freeTile";

export type GamePhase =
  | "boot"
  | "menu"
  | "difficulty"
  | "tutorial"
  | "playing"
  | "paused"
  | "win"
  | "stuck"
  | "fail";

export type AttemptResult = {
  ok: boolean;
  reason?:
    | "blocked"
    | "illegal"
    | "tray-full"
    | "not-playing"
    | "not-free"
    | "needs-placement"
    | "mismatch";
  conflicts?: { row: number; col: number }[];
};

type ActionRecord =
  | { type: "pair"; first: number; second: number; value: number }
  | { type: "placement"; row: number; col: number; value: number; tokenIndex: number };

type SelectedToken = { source: "tray"; index: number } | null;

export type GameState = {
  phase: GamePhase;
  difficulty: Difficulty;
  levelNumber: number;
  seed: number | null;
  layoutId: string | null;
  tiles: LevelData["tiles"];
  present: boolean[];
  revealed: Array<Array<number | null>>;
  solution: number[][];
  givens: boolean[][];
  trayTokens: number[];
  tray: number[];
  trayLimit: number;
  selectedToken: SelectedToken;
  pendingPairTile: number | null;
  lives: number;
  undoRemaining: number;
  moves: number;
  timeSeconds: number;
  hintTile: number | null;
  lastConflicts: { row: number; col: number }[];
  lastMessage: string | null;
  tutorialStep: number;
  pausedFrom: GamePhase | null;
  history: ActionRecord[];
  legalCells: Array<{ row: number; col: number }>;
  handTokens: number[];
  barrierMap: Record<string, number>;
  turn: number;
  pendingPairPlacements: number;
  hintsRemaining: number;
  hintsUsed: number;
  undosUsed: number;
  tutorialTargets: { blockedIndex: number | null; illegalIndex: number | null };
  tutorialMovesRequired: number;
  tutorialMovesDone: number;
  tutorialHintUsed: boolean;
  tutorialLastReveal: { row: number; col: number; value: number } | null;
  solverContext: { adjacency: ReturnType<typeof buildAdjacency> } | null;
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
  selectToken: (_source: "hand" | "tray", index: number) => void;
  moveSelectedTokenToTray: () => AttemptResult;
  placeSelectedToken: (row: number, col: number) => AttemptResult;
};

const baseGrid = () => Array.from({ length: 9 }, () => Array<number | null>(9).fill(null));
const baseBoolGrid = () => Array.from({ length: 9 }, () => Array<boolean>(9).fill(false));

export const useGameStore = create<GameState>((set, get) => ({
  phase: "boot",
  difficulty: "medium",
  levelNumber: 1,
  seed: null,
  layoutId: null,
  tiles: [],
  present: [],
  revealed: baseGrid(),
  solution: Array.from({ length: 9 }, () => Array(9).fill(0)),
  givens: baseBoolGrid(),
  trayTokens: [],
  tray: [],
  trayLimit: TOKEN_BUFFER_CAPACITY,
  selectedToken: null,
  pendingPairTile: null,
  lives: 3,
  undoRemaining: 3,
  moves: 0,
  timeSeconds: 0,
  hintTile: null,
  lastConflicts: [],
  lastMessage: null,
  tutorialStep: 0,
  pausedFrom: null,
  history: [],
  legalCells: [],
  handTokens: [],
  barrierMap: {},
  turn: 0,
  pendingPairPlacements: 0,
  hintsRemaining: 0,
  hintsUsed: 0,
  undosUsed: 0,
  tutorialTargets: { blockedIndex: null, illegalIndex: null },
  tutorialMovesRequired: 5,
  tutorialMovesDone: 0,
  tutorialHintUsed: false,
  tutorialLastReveal: null,
  solverContext: null,

  startGame: (difficultyOverride, levelNumberOverride, seedOverride) => {
    const settings = getSettings();
    const difficulty = difficultyOverride ?? settings.defaultDifficulty;
    const progress = getProgress();
    const levelNumber = levelNumberOverride ?? progress.highestLevelUnlocked[difficulty];
    const seed = seedOverride ?? Date.now();
    const level = generateLevel({ difficulty, levelNumber, seed });
    set({
      phase: "playing",
      difficulty,
      levelNumber,
      seed: level.seed,
      layoutId: level.layoutId,
      tiles: level.tiles,
      present: level.tiles.map(() => true),
      revealed: level.puzzle.map((row) => [...row]),
      solution: level.solution,
      givens: level.givens,
      trayTokens: [],
      tray: [],
      selectedToken: null,
      pendingPairTile: null,
      lives: 3,
      undoRemaining: 3,
      moves: 0,
      timeSeconds: 0,
      hintTile: null,
      lastConflicts: [],
      lastMessage: null,
      tutorialStep: 0,
      history: [],
      legalCells: [],
      handTokens: [],
      barrierMap: {},
      turn: 0,
      pendingPairPlacements: 0,
      hintsRemaining: 0,
      hintsUsed: 0,
      undosUsed: 0,
      solverContext: { adjacency: buildAdjacency(level.tiles) },
    });
    return level;
  },

  startTutorial: () => {
    get().startGame("easy", 1, 7001);
    set({ phase: "tutorial", tutorialStep: 0, lastMessage: "Welcome to Pair & Place." });
  },
  finishTutorial: () => {
    updateProgress({ tutorialCompleted: true });
    set({ phase: "menu", tutorialStep: 0 });
  },
  advanceTutorial: () => set((s) => ({ tutorialStep: Math.min(4, s.tutorialStep + 1) })),
  setPhase: (phase) => set({ phase }),
  pauseGame: () => set((state) => ({ phase: "paused", pausedFrom: state.phase })),
  resumeGame: () => set((state) => ({ phase: state.pausedFrom ?? "playing", pausedFrom: null })),
  quitToMenu: () => set({ phase: "menu", pausedFrom: null }),
  restartLevel: () => {
    const { difficulty, levelNumber, seed } = get();
    get().startGame(difficulty, levelNumber, seed ?? Date.now());
  },
  incrementTime: () => set((s) => ({ timeSeconds: s.timeSeconds + 1 })),

  attemptRemoveTile: (index) => {
    const s = get();
    if (s.phase !== "playing" && s.phase !== "tutorial")
      return { ok: false, reason: "not-playing" };
    if (!s.solverContext || !s.present[index]) return { ok: false, reason: "not-free" };
    if (s.trayTokens.length >= s.trayLimit) return { ok: false, reason: "tray-full" };

    if (s.pendingPairTile === null) {
      set({
        pendingPairTile: index,
        lastMessage: `Selected ${s.tiles[index].value}. Pick its open match.`,
      });
      return { ok: true };
    }

    const first = s.pendingPairTile;
    if (!isRemovablePair(s.tiles, s.present, s.solverContext.adjacency, first, index)) {
      set({
        pendingPairTile: null,
        lastMessage: "Only matching open tiles can be removed.",
        lastConflicts: [],
      });
      return { ok: false, reason: "mismatch" };
    }

    const value = s.tiles[index].value;
    if (!canAddTokens(s.trayTokens, 2, s.trayLimit)) {
      set({ pendingPairTile: null, lastMessage: "Token Buffer is full." });
      return { ok: false, reason: "tray-full" };
    }

    const present = [...s.present];
    present[first] = false;
    present[index] = false;
    const trayTokens = addTokens(s.trayTokens, value, 2);
    set({
      present,
      trayTokens,
      tray: trayTokens,
      selectedToken: { source: "tray", index: trayTokens.length - 1 },
      pendingPairTile: null,
      history: [...s.history, { type: "pair", first, second: index, value }],
      moves: s.moves + 1,
      legalCells: legalCellsForValue(s.revealed, value),
      lastMessage: `Pair removed. Added 2x ${value} to Token Buffer.`,
    });

    evaluateState();
    return { ok: true };
  },

  selectToken: (_source, index) => {
    const s = get();
    if (index < 0 || index >= s.trayTokens.length) return;
    const value = s.trayTokens[index];
    set({
      selectedToken: { source: "tray", index },
      legalCells: legalCellsForValue(s.revealed, value),
    });
  },

  moveSelectedTokenToTray: () => ({ ok: false, reason: "not-playing" }),

  placeSelectedToken: (row, col) => {
    const s = get();
    if (!s.selectedToken) return { ok: false, reason: "not-playing" };
    const value = s.trayTokens[s.selectedToken.index];
    if (value === undefined) return { ok: false, reason: "not-playing" };

    if (!canPlaceValue(s.revealed, row, col, value)) {
      set({
        lastConflicts: [{ row, col }],
        lastMessage: "Illegal placement.",
        legalCells: legalCellsForValue(s.revealed, value),
      });
      return { ok: false, reason: "illegal", conflicts: [{ row, col }] };
    }

    const revealed = s.revealed.map((r) => [...r]);
    revealed[row][col] = value;
    const removed = removeTokenAt(s.trayTokens, s.selectedToken.index);
    const trayTokens = removed.next;
    const nextSelected = trayTokens.length > 0 ? { source: "tray" as const, index: 0 } : null;
    set({
      revealed,
      trayTokens,
      tray: trayTokens,
      selectedToken: nextSelected,
      legalCells: nextSelected ? legalCellsForValue(revealed, trayTokens[nextSelected.index]) : [],
      history: [
        ...s.history,
        { type: "placement", row, col, value, tokenIndex: s.selectedToken.index },
      ],
      moves: s.moves + 1,
      lastConflicts: [],
      lastMessage: `Placed ${value} at R${row + 1} C${col + 1}`,
    });

    evaluateState();
    return { ok: true };
  },

  undoMove: () => {
    const s = get();
    if (s.undoRemaining <= 0 || s.history.length === 0) return false;
    const action = s.history[s.history.length - 1];
    const history = s.history.slice(0, -1);
    if (action.type === "placement") {
      const revealed = s.revealed.map((r) => [...r]);
      revealed[action.row][action.col] = null;
      const trayTokens = [...s.trayTokens];
      trayTokens.splice(Math.min(action.tokenIndex, trayTokens.length), 0, action.value);
      set({
        revealed,
        trayTokens,
        tray: trayTokens,
        selectedToken: {
          source: "tray",
          index: Math.min(action.tokenIndex, trayTokens.length - 1),
        },
        legalCells: legalCellsForValue(revealed, action.value),
        history,
        undoRemaining: s.undoRemaining - 1,
        undosUsed: s.undosUsed + 1,
        phase: "playing",
      });
      return true;
    }

    const present = [...s.present];
    present[action.first] = true;
    present[action.second] = true;
    const trayTokens = [...s.trayTokens];
    let removed = 0;
    for (let i = trayTokens.length - 1; i >= 0 && removed < 2; i -= 1) {
      if (trayTokens[i] === action.value) {
        trayTokens.splice(i, 1);
        removed += 1;
      }
    }
    set({
      present,
      trayTokens,
      tray: trayTokens,
      selectedToken: trayTokens.length ? { source: "tray", index: 0 } : null,
      legalCells: trayTokens.length ? legalCellsForValue(s.revealed, trayTokens[0]) : [],
      history,
      undoRemaining: s.undoRemaining - 1,
      undosUsed: s.undosUsed + 1,
      phase: "playing",
      pendingPairTile: null,
    });
    return true;
  },

  useHint: () => {
    const s = get();
    if (!s.solverContext) return null;
    const hasPairs = hasAnyRemovablePair(s.tiles, s.present, s.solverContext.adjacency);
    if (!hasPairs) return null;
    for (let i = 0; i < s.tiles.length; i += 1) {
      if (!s.present[i]) continue;
      set({
        hintTile: i,
        hintsUsed: s.hintsUsed + 1,
        lastMessage: "Hint: start with highlighted open tile.",
      });
      return i;
    }
    return null;
  },

  clearHint: () => set({ hintTile: null }),
  clearMessage: () => set({ lastMessage: null }),
}));

function evaluateState() {
  const s = useGameStore.getState();
  if (!s.solverContext) return;

  const completeGrid = s.revealed.every((row) => row.every((value) => value !== null));
  const allTilesRemoved = s.present.every((value) => !value);
  if (completeGrid && allTilesRemoved) {
    useGameStore.setState({ phase: "win" });
    finalizeWin(useGameStore.getState());
    return;
  }

  const stuck = isStuckState({
    tiles: s.tiles,
    present: s.present,
    adjacency: s.solverContext.adjacency,
    grid: s.revealed,
    tokens: s.trayTokens,
    bufferCapacity: s.trayLimit,
  });

  if (!stuck) {
    if (s.phase === "stuck") useGameStore.setState({ phase: "playing" });
    return;
  }

  if (s.undoRemaining > 0) {
    useGameStore.setState({ phase: "stuck", lastMessage: "Stuck: no legal moves. Use Undo." });
    return;
  }

  const nextLives = s.lives - 1;
  useGameStore.setState({
    lives: nextLives,
    phase: nextLives <= 0 ? "fail" : "playing",
    lastMessage: nextLives <= 0 ? "No lives left. Level failed." : "Lost a life from deadlock.",
  });
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
