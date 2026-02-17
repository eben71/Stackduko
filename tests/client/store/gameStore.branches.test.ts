import { beforeEach, describe, expect, it } from "vitest";
import { useGameStore } from "../../../client/src/store/gameStore";

describe("gameStore branches", () => {
  beforeEach(() => {
    useGameStore.setState(useGameStore.getInitialState(), true);
  });

  it("returns not-playing when attempting remove outside gameplay", () => {
    const result = useGameStore.getState().attemptRemoveTile(0);
    expect(result.reason).toBe("not-playing");
  });

  it("starts tutorial mode", () => {
    useGameStore.getState().startTutorial();
    expect(useGameStore.getState().phase).toBe("tutorial");
  });

  it("selectToken updates legal highlights from token buffer", () => {
    useGameStore.getState().startGame("easy", 1, 5555);
    useGameStore.setState({ trayTokens: [1], selectedToken: null });
    useGameStore.getState().selectToken("tray", 0);
    expect(useGameStore.getState().legalCells.length).toBeGreaterThan(0);
  });
});
