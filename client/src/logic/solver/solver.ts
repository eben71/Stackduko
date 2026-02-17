import { isPlacementLegal, type SudokuGrid } from "@/logic/sudoku/validate";
import {
  buildAdjacency,
  getFreeTiles,
  isFreeTile,
  type TileAdjacency,
} from "@/logic/stack/freeTile";
import { type TileSpec } from "@/logic/stack/types";

export type RevealedGrid = Array<Array<number | null>>;
export type BarrierMap = Record<string, number>;

export type SolverState = {
  present: boolean[];
  grid: RevealedGrid;
  revealed: RevealedGrid;
  handTokens: number[];
  trayTokens: number[];
  selectedToken: { source: "hand" | "tray"; index: number } | null;
  pendingPairTile: number | null;
  pendingPairPlacements: number;
  lives: number;
  undosRemaining: number;
  barriers: BarrierMap;
  turn: number;
};

export type SolverContext = {
  tiles: TileSpec[];
  adjacency: TileAdjacency;
};

export function createSolverContext(tiles: TileSpec[]): SolverContext {
  return { tiles, adjacency: buildAdjacency(tiles) };
}

export function createEmptyRevealed(): RevealedGrid {
  return Array.from({ length: 9 }, () => Array(9).fill(null));
}

export function createInitialState(tiles: TileSpec[]): SolverState {
  const grid = createEmptyRevealed();
  return {
    present: tiles.map(() => true),
    grid,
    revealed: grid,
    handTokens: [],
    trayTokens: [],
    selectedToken: null,
    pendingPairTile: null,
    pendingPairPlacements: 0,
    lives: 3,
    undosRemaining: 3,
    barriers: {},
    turn: 0,
  };
}

export function cloneGrid(grid: RevealedGrid): RevealedGrid {
  return grid.map((row) => [...row]);
}

export function isTileFree(
  context: SolverContext,
  state: Pick<SolverState, "present">,
  index: number,
) {
  return isFreeTile(index, state.present, context.adjacency);
}

export function getOpenTiles(
  context: SolverContext,
  state: Pick<SolverState, "present">,
): number[] {
  return getFreeTiles(state.present, context.adjacency);
}

export function canPlaceToken(
  grid: RevealedGrid,
  value: number,
  row: number,
  col: number,
  barriers: BarrierMap,
): boolean {
  if (grid[row][col] !== null) return false;
  if (barriers[`${row},${col}`] !== undefined) return false;
  const numericGrid = grid.map((r) => r.map((cell) => cell ?? 0));
  return isPlacementLegal(numericGrid, row, col, value);
}

export function legalCellsForToken(
  grid: RevealedGrid,
  value: number,
  barriers: BarrierMap,
): Array<{ row: number; col: number }> {
  const legal: Array<{ row: number; col: number }> = [];
  for (let row = 0; row < 9; row += 1) {
    for (let col = 0; col < 9; col += 1) {
      if (canPlaceToken(grid, value, row, col, barriers)) {
        legal.push({ row, col });
      }
    }
  }
  return legal;
}

export function countTokens(tokens: number[]): Map<number, number> {
  const counts = new Map<number, number>();
  for (const value of tokens) {
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }
  return counts;
}

export function toNumericGrid(revealed: RevealedGrid): SudokuGrid {
  return revealed.map((row) => row.map((cell) => cell ?? 0));
}

export function getLegalMoves(
  context: SolverContext,
  state: Pick<SolverState, "present"> &
    Partial<Pick<SolverState, "grid" | "revealed" | "barriers">>,
): number[] {
  const open = getOpenTiles(context, state as Pick<SolverState, "present">);
  const byValue = new Map<number, number[]>();
  for (const index of open) {
    const value = context.tiles[index].value;
    const list = byValue.get(value) ?? [];
    list.push(index);
    byValue.set(value, list);
  }
  const legal: number[] = [];
  for (const indexes of Array.from(byValue.values())) {
    if (indexes.length >= 2) legal.push(...indexes);
  }
  return legal;
}

export function getHintMove(
  context: SolverContext,
  state: Pick<SolverState, "present"> &
    Partial<Pick<SolverState, "grid" | "revealed" | "barriers">>,
): number | null {
  const legal = getLegalMoves(context, state);
  return legal.length > 0 ? legal[0] : null;
}

export function isSolvable(context: SolverContext, state: SolverState): boolean {
  const openTiles = getOpenTiles(context, state);
  if (openTiles.length === 0 && state.handTokens.length === 0 && state.trayTokens.length === 0) {
    return true;
  }
  if (state.lives <= 0) return false;

  const activeTokens = [...state.handTokens, ...state.trayTokens];
  if (activeTokens.length > 0) {
    for (const value of activeTokens) {
      if (legalCellsForToken(state.grid, value, state.barriers).length === 0) {
        return false;
      }
    }
    return true;
  }

  const byValue = new Map<number, number[]>();
  for (const index of openTiles) {
    const value = context.tiles[index].value;
    const list = byValue.get(value) ?? [];
    list.push(index);
    byValue.set(value, list);
  }
  for (const indexes of Array.from(byValue.values())) {
    if (indexes.length >= 2) return true;
  }
  return false;
}
