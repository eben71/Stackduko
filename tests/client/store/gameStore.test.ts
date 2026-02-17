import { beforeEach, describe, expect, it } from "vitest";
import { useGameStore } from "../../../client/src/store/gameStore";

describe("useGameStore", () => {
  beforeEach(() => {
    useGameStore.setState(useGameStore.getInitialState(), true);
  });

  it("starts a game session with prefilled grid", () => {
    useGameStore.getState().startGame("hard", 1, 1111);
    const state = useGameStore.getState();
    expect(state.difficulty).toBe("hard");
    expect(state.moves).toBe(0);
    expect(state.revealed.flat().some((v) => v !== null)).toBe(true);
  });

  it("increments time", () => {
    useGameStore.getState().incrementTime();
    expect(useGameStore.getState().timeSeconds).toBe(1);
  });
});
