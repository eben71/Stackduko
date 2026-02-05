import { describe, expect, it } from "vitest";
import { useGameStore } from "../../../client/src/store/gameStore";
import { getLegalMoves } from "../../../client/src/logic/solver/solver";

describe("useGameStore", () => {
  it("starts a game session with defaults", () => {
    useGameStore.getState().startGame("hard", 1, 123);
    const state = useGameStore.getState();
    expect(state.phase).toBe("playing");
    expect(state.difficulty).toBe("hard");
    expect(state.moves).toBe(0);
    expect(state.tray.length).toBe(0);
  });

  it("increments time", () => {
    useGameStore.getState().incrementTime();
    const state = useGameStore.getState();
    expect(state.timeSeconds).toBe(1);
  });

  it("removes and undoes a legal tile", () => {
    useGameStore.getState().startGame("easy", 1, 456);
    const state = useGameStore.getState();
    const context = state.solverContext;
    expect(context).toBeTruthy();
    if (!context) return;
    const legalMoves = getLegalMoves(context, {
      present: state.present,
      revealed: state.revealed,
    });
    expect(legalMoves.length).toBeGreaterThan(0);
    const result = useGameStore.getState().attemptRemoveTile(legalMoves[0]);
    expect(result.ok).toBe(true);
    expect(useGameStore.getState().tray.length).toBe(1);
    expect(useGameStore.getState().undoMove()).toBe(true);
    expect(useGameStore.getState().tray.length).toBe(0);
  });
});
