import { type TileSpec } from "@/logic/stack/types";

export type TileAdjacency = {
  aboveIndices: number[][];
  leftIndex: Array<number | null>;
  rightIndex: Array<number | null>;
};

export function buildAdjacency(tiles: TileSpec[]): TileAdjacency {
  const indexByKey = new Map<string, number>();
  tiles.forEach((tile, index) => {
    indexByKey.set(positionKey(tile.x, tile.y, tile.z), index);
  });

  const aboveIndices: number[][] = tiles.map(() => []);
  const leftIndex: Array<number | null> = tiles.map(() => null);
  const rightIndex: Array<number | null> = tiles.map(() => null);

  tiles.forEach((tile, index) => {
    tiles.forEach((other, otherIndex) => {
      if (otherIndex === index) return;
      if (tile.x === other.x && tile.y === other.y && other.z > tile.z) {
        aboveIndices[index].push(otherIndex);
      }
    });
    const left = indexByKey.get(positionKey(tile.x - 1, tile.y, tile.z));
    const right = indexByKey.get(positionKey(tile.x + 1, tile.y, tile.z));
    leftIndex[index] = left ?? null;
    rightIndex[index] = right ?? null;
  });

  return { aboveIndices, leftIndex, rightIndex };
}

export function isFreeTile(index: number, present: boolean[], adjacency: TileAdjacency): boolean {
  if (!present[index]) return false;
  const above = adjacency.aboveIndices[index];
  for (const aboveIndex of above) {
    if (present[aboveIndex]) return false;
  }
  const left = adjacency.leftIndex[index];
  const right = adjacency.rightIndex[index];
  const leftBlocked = left !== null && present[left];
  const rightBlocked = right !== null && present[right];
  return !(leftBlocked && rightBlocked);
}

export function getFreeTiles(present: boolean[], adjacency: TileAdjacency): number[] {
  const free: number[] = [];
  for (let i = 0; i < present.length; i += 1) {
    if (isFreeTile(i, present, adjacency)) free.push(i);
  }
  return free;
}

function positionKey(x: number, y: number, z: number): string {
  return `${x},${y},${z}`;
}
