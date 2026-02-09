import { createInitialState, createSolverContext, isSolvable } from "@/logic/solver/solver";
import { type TileSpec } from "@/logic/stack/types";

export function isLevelSolvable(tiles: TileSpec[]): boolean {
  const context = createSolverContext(tiles);
  const state = createInitialState(tiles);
  return isSolvable(context, state);
}
