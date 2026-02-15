import { beforeEach, describe, expect, it } from "vitest";
import { useGameStore } from "../../../client/src/store/gameStore";
import { getLegalMoves } from "../../../client/src/logic/solver/solver";

describe("useGameStore", () => {
  beforeEach(() => {
    useGameStore.setState(useGameStore.getInitialState(), true);
  });

  it("starts a game session with defaults", () => {
    useGameStore.getState().startGame("hard", 1, 1111);
    const state = useGameStore.getState();
    expect(state.difficulty).toBe("hard");
    expect(state.moves).toBe(0);
    expect(state.trayTokens.length).toBe(0);
  });

  it("increments time", () => {
    useGameStore.getState().incrementTime();
    expect(useGameStore.getState().timeSeconds).toBe(1);
  });

  it("selects first tile then clears selection when clicked again", () => {
    useGameStore.getState().startGame("easy", 1, 2222);
    const gs = useGameStore.getState();
    const freeIndex = gs.solverContext ? getLegalMoves(gs.solverContext, gs)[0] : -1;
    const first = useGameStore.getState().attemptRemoveTile(freeIndex);
    expect(first.ok).toBe(true);
    const second = useGameStore.getState().attemptRemoveTile(freeIndex);
    expect(second.ok).toBe(false);
  });
});
