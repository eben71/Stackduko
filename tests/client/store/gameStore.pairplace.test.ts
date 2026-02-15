import { beforeEach, describe, expect, it } from "vitest";
import { useGameStore } from "../../../client/src/store/gameStore";
import { createSolverContext } from "../../../client/src/logic/solver/solver";

const pairTiles = [
  { id: "a", x: 0, y: 0, z: 0, value: 1 },
  { id: "b", x: 2, y: 0, z: 0, value: 1 },
  { id: "c", x: 4, y: 0, z: 0, value: 2 },
  { id: "d", x: 6, y: 0, z: 0, value: 2 },
];

function primePlayingState() {
  const context = createSolverContext(pairTiles);
  useGameStore.setState({
    phase: "playing",
    tiles: pairTiles,
    present: [true, true, true, true],
    revealed: Array.from({ length: 9 }, () => Array(9).fill(null)),
    solverContext: context,
    handTokens: [],
    trayTokens: [],
    tray: [],
    selectedToken: null,
    pendingPairTile: null,
    pendingPairPlacements: 0,
    barrierMap: {},
    turn: 0,
    lives: 3,
    undoRemaining: 3,
    history: [],
    legalCells: [],
    seed: 99,
    difficulty: "medium",
  });
}

describe("pair & place store flows", () => {
  beforeEach(() => {
    useGameStore.setState(useGameStore.getInitialState(), true);
    primePlayingState();
  });

  it("handles pair selection, buffer move, placement and undo", () => {
    expect(useGameStore.getState().attemptRemoveTile(0).ok).toBe(true);
    expect(useGameStore.getState().attemptRemoveTile(1).ok).toBe(true);
    expect(useGameStore.getState().handTokens).toEqual([1, 1]);

    useGameStore.getState().selectToken("hand", 0);
    expect(useGameStore.getState().moveSelectedTokenToTray().ok).toBe(true);
    expect(useGameStore.getState().trayTokens.length).toBe(1);

    useGameStore.getState().selectToken("tray", 0);
    expect(useGameStore.getState().placeSelectedToken(0, 0).ok).toBe(true);
    expect(useGameStore.getState().revealed[0][0]).toBe(1);

    expect(useGameStore.getState().undoMove()).toBe(true);
    expect(useGameStore.getState().revealed[0][0]).toBeNull();
  });

  it("penalizes mismatch pair and illegal placements", () => {
    useGameStore.getState().attemptRemoveTile(0);
    const mismatch = useGameStore.getState().attemptRemoveTile(2);
    expect(mismatch.ok).toBe(false);
    expect(useGameStore.getState().lives).toBe(2);

    useGameStore.setState({
      handTokens: [1],
      selectedToken: { source: "hand", index: 0 },
      barrierMap: { "0,0": 2 },
    });
    const illegal = useGameStore.getState().placeSelectedToken(0, 0);
    expect(illegal.ok).toBe(false);
    expect(useGameStore.getState().lives).toBe(1);
  });

  it("supports hint, tutorial controls, pause flow and clear actions", () => {
    expect(useGameStore.getState().useHint()).not.toBeNull();
    useGameStore.getState().clearHint();
    useGameStore.getState().clearMessage();

    useGameStore.getState().startTutorial();
    expect(useGameStore.getState().phase).toBe("tutorial");
    useGameStore.getState().advanceTutorial();
    useGameStore.getState().pauseGame();
    expect(useGameStore.getState().phase).toBe("paused");
    useGameStore.getState().resumeGame();
    useGameStore.getState().quitToMenu();
    expect(useGameStore.getState().phase).toBe("menu");
  });
});
