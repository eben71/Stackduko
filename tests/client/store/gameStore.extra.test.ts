import { beforeEach, describe, expect, it } from "vitest";
import { useGameStore } from "../../../client/src/store/gameStore";

describe("gameStore extras", () => {
  beforeEach(() => {
    useGameStore.setState(useGameStore.getInitialState(), true);
    useGameStore.getState().startGame("easy", 1, 3333);
  });

  it("pauses and resumes to previous phase", () => {
    useGameStore.getState().pauseGame();
    expect(useGameStore.getState().phase).toBe("paused");
    useGameStore.getState().resumeGame();
    expect(useGameStore.getState().phase).toBe("playing");
  });

  it("blocks remove when tokens still need placement", () => {
    const state = useGameStore.getState();
    const firstOpen = state.present.findIndex(Boolean);
    useGameStore.getState().attemptRemoveTile(firstOpen);
    const again = useGameStore.getState().attemptRemoveTile(firstOpen);
    expect(again.ok).toBe(false);
  });

  it("returns false when undo unavailable", () => {
    expect(useGameStore.getState().undoMove()).toBe(false);
  });
});
