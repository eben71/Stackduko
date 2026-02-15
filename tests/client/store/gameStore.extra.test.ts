import { describe, expect, it } from "vitest";
import { useGameStore } from "../../../client/src/store/gameStore";
import {
  createInitialState,
  createSolverContext,
  isTileFree,
} from "../../../client/src/logic/solver/solver";

describe("gameStore extras", () => {
  it("pauses and resumes to previous phase", () => {
    useGameStore.getState().startTutorial();
    useGameStore.getState().pauseGame();
    expect(useGameStore.getState().phase).toBe("paused");
    useGameStore.getState().resumeGame();
    expect(useGameStore.getState().phase).toBe("tutorial");
  });

  it("drops oldest undo history entry when history is full", () => {
    const tiles = [
      { id: "a", x: 0, y: 0, z: 0, row: 0, col: 0, value: 1 },
      { id: "b", x: 1, y: 0, z: 0, row: 0, col: 1, value: 2 },
    ];
    const context = createSolverContext(tiles);
    const session = createInitialState(tiles);
    useGameStore.setState({
      phase: "playing",
      tiles,
      present: session.present,
      revealed: session.revealed,
      solverContext: context,
      tray: [0],
      trayLimit: 1,
    });

    const result = useGameStore.getState().attemptRemoveTile(1);
    expect(result.ok).toBe(true);
    expect(useGameStore.getState().tray).toEqual([1]);
  });

  it("blocks move when tile is covered", () => {
    const tiles = [
      { id: "a", x: 0, y: 0, z: 0, row: 0, col: 0, value: 1 },
      { id: "b", x: 0, y: 0, z: 1, row: 0, col: 1, value: 2 },
    ];
    const context = createSolverContext(tiles);
    const session = createInitialState(tiles);
    useGameStore.setState({
      phase: "playing",
      tiles,
      present: session.present,
      revealed: session.revealed,
      solverContext: context,
      tray: [],
      trayLimit: 7,
    });

    const result = useGameStore.getState().attemptRemoveTile(0);
    expect(result.ok).toBe(false);
    expect(result.reason).toBe("blocked");
  });

  it("returns false when hint or undo unavailable", () => {
    useGameStore.setState({
      phase: "playing",
      hintsRemaining: 0,
      undoRemaining: 0,
      tray: [0],
    });
    expect(useGameStore.getState().useHint()).toBeNull();
    expect(useGameStore.getState().undoMove()).toBe(false);
  });

  it("marks tutorial complete and returns to menu", () => {
    useGameStore.getState().startTutorial();
    useGameStore.getState().finishTutorial();
    expect(useGameStore.getState().phase).toBe("menu");
  });

  it("allows tutorial step 6 progress when hints are unavailable", () => {
    useGameStore.getState().startTutorial();
    useGameStore.setState({
      tutorialStep: 6,
      hintsRemaining: 0,
      hintTile: null,
      tutorialHintUsed: false,
    });

    const state = useGameStore.getState();
    const legalFreeTile = state.tiles.findIndex((_, tileIndex) => {
      if (!state.solverContext) return false;
      if (!state.present[tileIndex]) return false;
      return isTileFree(state.solverContext, state, tileIndex);
    });

    expect(legalFreeTile).toBeGreaterThanOrEqual(0);
    const result = useGameStore.getState().attemptRemoveTile(legalFreeTile);
    expect(result.ok).toBe(true);
    expect(useGameStore.getState().tutorialStep).toBe(7);
  });

  it("allows a legal move and sets hint", () => {
    useGameStore.getState().startGame("easy", 1, 101);
    const state = useGameStore.getState();
    const hintIndex = useGameStore.getState().useHint();
    expect(hintIndex).not.toBeNull();
    const result = useGameStore.getState().attemptRemoveTile(hintIndex ?? -1);
    expect(result.ok).toBe(true);
    expect(useGameStore.getState().moves).toBeGreaterThan(state.moves);
  });
});
