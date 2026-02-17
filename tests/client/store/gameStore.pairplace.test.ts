import { beforeEach, describe, expect, it } from "vitest";
import { useGameStore } from "../../../client/src/store/gameStore";
import { buildAdjacency } from "../../../client/src/logic/stack/freeTile";

const pairTiles = [
  { id: "a", x: 0, y: 0, z: 0, value: 1 },
  { id: "b", x: 2, y: 0, z: 0, value: 1 },
  { id: "c", x: 4, y: 0, z: 0, value: 2 },
  { id: "d", x: 6, y: 0, z: 0, value: 2 },
];

function primePlayingState() {
  useGameStore.setState({
    phase: "playing",
    tiles: pairTiles,
    present: [true, true, true, true],
    revealed: Array.from({ length: 9 }, () => Array(9).fill(null)),
    solverContext: { adjacency: buildAdjacency(pairTiles) },
    trayTokens: [],
    tray: [],
    selectedToken: null,
    pendingPairTile: null,
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

  it("handles pair selection, placement and undo", () => {
    expect(useGameStore.getState().attemptRemoveTile(0).ok).toBe(true);
    expect(useGameStore.getState().attemptRemoveTile(1).ok).toBe(true);
    expect(useGameStore.getState().trayTokens).toEqual([1, 1]);

    useGameStore.getState().selectToken("tray", 0);
    expect(useGameStore.getState().placeSelectedToken(0, 0).ok).toBe(true);
    expect(useGameStore.getState().revealed[0][0]).toBe(1);

    expect(useGameStore.getState().undoMove()).toBe(true);
    expect(useGameStore.getState().revealed[0][0]).toBeNull();
  });

  it("blocks mismatched pair", () => {
    useGameStore.getState().attemptRemoveTile(0);
    const mismatch = useGameStore.getState().attemptRemoveTile(2);
    expect(mismatch.ok).toBe(false);
    expect(mismatch.reason).toBe("mismatch");
  });
});
