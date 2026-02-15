export type TileSpec = {
  id: string;
  x: number;
  y: number;
  z: number;
  value: number;
};

export type TilePosition = {
  x: number;
  y: number;
  z: number;
};

export const TILE_POSITION_KEYS = ["x", "y", "z"] as const;
