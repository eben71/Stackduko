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

  it("illegal placement costs life", () => {
    useGameStore.getState().startGame("easy", 1, 4444);
    useGameStore.setState({
      handTokens: [1],
      selectedToken: { source: "hand", index: 0 },
      revealed: Array.from({ length: 9 }, () => Array(9).fill(null)),
      barrierMap: { "0,0": 2 },
    });
    const before = useGameStore.getState().lives;
    const result = useGameStore.getState().placeSelectedToken(0, 0);
    expect(result.ok).toBe(false);
    expect(useGameStore.getState().lives).toBe(before - 1);
  });

  it("selectToken updates legal highlights", () => {
    useGameStore.getState().startGame("easy", 1, 5555);
    useGameStore.setState({ handTokens: [1], selectedToken: null });
    useGameStore.getState().selectToken("hand", 0);
    expect(useGameStore.getState().legalCells.length).toBeGreaterThan(0);
  });
});
