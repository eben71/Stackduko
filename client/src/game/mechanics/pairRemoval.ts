import { isFreeTile, type TileAdjacency } from "@/logic/stack/freeTile";
import type { TileSpec } from "@/logic/stack/types";

export function isRemovablePair(
  tiles: TileSpec[],
  present: boolean[],
  adjacency: TileAdjacency,
  first: number,
  second: number,
) {
  if (first === second || !present[first] || !present[second]) return false;
  if (!isFreeTile(first, present, adjacency) || !isFreeTile(second, present, adjacency))
    return false;
  return tiles[first].value === tiles[second].value;
}

export function hasAnyRemovablePair(
  tiles: TileSpec[],
  present: boolean[],
  adjacency: TileAdjacency,
) {
  const open: number[] = [];
  for (let i = 0; i < tiles.length; i += 1) {
    if (isFreeTile(i, present, adjacency)) open.push(i);
  }
  const counts = new Map<number, number>();
  for (const index of open) {
    const value = tiles[index].value;
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }
  return Array.from(counts.values()).some((count) => count >= 2);
}
