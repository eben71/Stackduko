import { isPlacementLegal, type SudokuGrid } from "@/logic/sudoku/validate";
import {
  buildAdjacency,
  getFreeTiles,
  isFreeTile,
  type TileAdjacency,
} from "@/logic/stack/freeTile";
import { type TileSpec } from "@/logic/stack/types";

export type RevealedGrid = Array<Array<number | null>>;

export type SolverState = {
  present: boolean[];
  revealed: RevealedGrid;
};

export type SolverContext = {
  tiles: TileSpec[];
  adjacency: TileAdjacency;
};

export type LegalMove = {
  index: number;
  score: number;
};

export function createSolverContext(tiles: TileSpec[]): SolverContext {
  return {
    tiles,
    adjacency: buildAdjacency(tiles),
  };
}

export function createInitialState(tiles: TileSpec[]): SolverState {
  return {
    present: tiles.map(() => true),
    revealed: createEmptyRevealed(),
  };
}

export function createEmptyRevealed(): RevealedGrid {
  return Array.from({ length: 9 }, () => Array(9).fill(null));
}

export function cloneRevealed(grid: RevealedGrid): RevealedGrid {
  return grid.map((row) => [...row]);
}

export function isRevealLegal(
  revealed: RevealedGrid,
  row: number,
  col: number,
  value: number,
): boolean {
  if (revealed[row][col] !== null) return false;
  const numericGrid = revealed.map((r) => r.map((cell) => cell ?? 0));
  return isPlacementLegal(numericGrid, row, col, value);
}

export function getLegalMoves(context: SolverContext, state: SolverState): number[] {
  const freeTiles = getFreeTiles(state.present, context.adjacency);
  const legal: number[] = [];
  for (const index of freeTiles) {
    const tile = context.tiles[index];
    if (isRevealLegal(state.revealed, tile.row, tile.col, tile.value)) {
      legal.push(index);
    }
  }
  return legal;
}

export function applyMove(context: SolverContext, state: SolverState, index: number): SolverState {
  const tile = context.tiles[index];
  const present = [...state.present];
  present[index] = false;
  const revealed = cloneRevealed(state.revealed);
  revealed[tile.row][tile.col] = tile.value;
  return { present, revealed };
}

export function getHintMove(context: SolverContext, state: SolverState): number | null {
  const scored = scoreMoves(context, state);
  if (scored.length === 0) return null;
  return scored[0].index;
}

export function isSolvable(context: SolverContext, state: SolverState): boolean {
  return solveBacktrack(context, state);
}

function solveBacktrack(context: SolverContext, state: SolverState): boolean {
  if (state.present.every((value) => !value)) return true;
  const legalMoves = scoreMoves(context, state);
  if (legalMoves.length === 0) return false;
  for (const move of legalMoves) {
    const next = applyMove(context, state, move.index);
    if (solveBacktrack(context, next)) return true;
  }
  return false;
}

function scoreMoves(context: SolverContext, state: SolverState): LegalMove[] {
  const moves = getLegalMoves(context, state);
  if (moves.length === 0) return [];
  const scored: LegalMove[] = moves.map((index) => ({
    index,
    score: computeMoveScore(context, state, index),
  }));
  scored.sort((a, b) => b.score - a.score);
  return scored;
}

function computeMoveScore(context: SolverContext, state: SolverState, index: number): number {
  const tile = context.tiles[index];
  const rarityScore = computeRarityScore(state.revealed, tile.row, tile.col, tile.value);

  const present = [...state.present];
  present[index] = false;
  const freeAfter = getFreeTiles(present, context.adjacency).length;

  const revealed = cloneRevealed(state.revealed);
  revealed[tile.row][tile.col] = tile.value;

  const legalAfter = getLegalMoves(context, { present, revealed }).length;
  const deadEndPenalty = legalAfter === 0 ? -50 : 0;

  return freeAfter * 3 + rarityScore * 2 + deadEndPenalty;
}

function computeRarityScore(
  revealed: RevealedGrid,
  row: number,
  col: number,
  value: number,
): number {
  let count = 0;
  for (let i = 0; i < 9; i += 1) {
    if (revealed[row][i] === value) count += 1;
    if (revealed[i][col] === value) count += 1;
  }
  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;
  for (let r = 0; r < 3; r += 1) {
    for (let c = 0; c < 3; c += 1) {
      if (revealed[boxRow + r][boxCol + c] === value) count += 1;
    }
  }
  return -count;
}

export function isTileFree(context: SolverContext, state: SolverState, index: number): boolean {
  return isFreeTile(index, state.present, context.adjacency);
}

export function toNumericGrid(revealed: RevealedGrid): SudokuGrid {
  return revealed.map((row) => row.map((cell) => cell ?? 0));
}
