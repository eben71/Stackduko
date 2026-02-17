import { hasAnyRemovablePair } from "@/game/mechanics/pairRemoval";
import { legalCellsForValue, type Grid } from "@/game/mechanics/placement";
import type { TileAdjacency } from "@/logic/stack/freeTile";
import type { TileSpec } from "@/logic/stack/types";

export function hasAnyLegalPlacement(grid: Grid, tokens: number[]) {
  return tokens.some((token) => legalCellsForValue(grid, token).length > 0);
}

export function isStuckState(params: {
  tiles: TileSpec[];
  present: boolean[];
  adjacency: TileAdjacency;
  grid: Grid;
  tokens: number[];
  bufferCapacity: number;
}) {
  const noPairs = !hasAnyRemovablePair(params.tiles, params.present, params.adjacency);
  const fullBuffer = params.tokens.length >= params.bufferCapacity;
  const noPlacement = !hasAnyLegalPlacement(params.grid, params.tokens);
  return noPairs && fullBuffer && noPlacement;
}
