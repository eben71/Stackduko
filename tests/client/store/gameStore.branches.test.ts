import { describe, expect, it } from "vitest";
import { useGameStore } from "../../../client/src/store/gameStore";
import { createInitialState, createSolverContext } from "../../../client/src/logic/solver/solver";
import { resetProgress, getProgress } from "../../../client/src/game/state/storage";

describe("gameStore branches", () => {
  it("returns not-playing when attempting remove outside gameplay", () => {
    const tiles = [{ id: "t0", x: 0, y: 0, z: 0, row: 0, col: 0, value: 1 }];
    const context = createSolverContext(tiles);
    const session = createInitialState(tiles);
    useGameStore.setState({
      phase: "menu",
      tiles,
      present: session.present,
      revealed: session.revealed,
      solverContext: context,
      tray: [],
      trayLimit: 7,
    });

    const result = useGameStore.getState().attemptRemoveTile(0);
    expect(result.ok).toBe(false);
    expect(result.reason).toBe("not-playing");
  });

  it("returns not-free when tile is already removed", () => {
    const tiles = [{ id: "t0", x: 0, y: 0, z: 0, row: 0, col: 0, value: 1 }];
    const context = createSolverContext(tiles);
    const session = createInitialState(tiles);
    session.present[0] = false;
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
    expect(result.reason).toBe("not-free");
  });

  it("returns not-playing when solver context is missing", () => {
    const tiles = [{ id: "t0", x: 0, y: 0, z: 0, row: 0, col: 0, value: 1 }];
    const session = createInitialState(tiles);
    useGameStore.setState({
      phase: "playing",
      tiles,
      present: session.present,
      revealed: session.revealed,
      solverContext: null,
      tray: [],
      trayLimit: 7,
    });

    const result = useGameStore.getState().attemptRemoveTile(0);
    expect(result.ok).toBe(false);
    expect(result.reason).toBe("not-playing");
  });

  it("returns illegal when reveal violates constraints", () => {
    const tiles = [{ id: "t0", x: 0, y: 0, z: 0, row: 0, col: 1, value: 1 }];
    const context = createSolverContext(tiles);
    const session = createInitialState(tiles);
    session.revealed[0][0] = 1;

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
    expect(result.reason).toBe("illegal");
    expect(result.conflicts?.length).toBeGreaterThan(0);
  });

  it("reports row-only conflict text", () => {
    const tiles = [{ id: "t0", x: 0, y: 0, z: 0, row: 0, col: 8, value: 1 }];
    const context = createSolverContext(tiles);
    const session = createInitialState(tiles);
    session.revealed[0][0] = 1;

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
    expect(useGameStore.getState().lastMessage).toBe("Illegal reveal: duplicates 1 in this row.");
  });

  it("reports row and column conflict text", () => {
    const tiles = [{ id: "t0", x: 0, y: 0, z: 0, row: 0, col: 8, value: 1 }];
    const context = createSolverContext(tiles);
    const session = createInitialState(tiles);
    session.revealed[0][0] = 1;
    session.revealed[4][8] = 1;

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
    expect(useGameStore.getState().lastMessage).toBe(
      "Illegal reveal: duplicates 1 in this row and column.",
    );
  });

  it("reports row, column, and box conflict text", () => {
    const tiles = [{ id: "t0", x: 0, y: 0, z: 0, row: 1, col: 1, value: 1 }];
    const context = createSolverContext(tiles);
    const session = createInitialState(tiles);
    session.revealed[1][3] = 1;
    session.revealed[4][1] = 1;
    session.revealed[0][0] = 1;

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
    expect(useGameStore.getState().lastMessage).toBe(
      "Illegal reveal: duplicates 1 in this row, column, and box.",
    );
  });

  it("marks win and updates progress on final tile", () => {
    resetProgress();
    const tiles = [{ id: "t0", x: 0, y: 0, z: 0, row: 0, col: 0, value: 1 }];
    const context = createSolverContext(tiles);
    const session = createInitialState(tiles);

    useGameStore.setState({
      phase: "playing",
      difficulty: "easy",
      levelNumber: 1,
      seed: 555,
      timeSeconds: 12,
      moves: 2,
      tiles,
      present: session.present,
      revealed: session.revealed,
      solverContext: context,
      tray: [],
      trayLimit: 7,
      hintsRemaining: 0,
      hintsUsed: 0,
      undoLimit: null,
      undoRemaining: null,
      undosUsed: 0,
    });

    const result = useGameStore.getState().attemptRemoveTile(0);
    expect(result.ok).toBe(true);
    expect(useGameStore.getState().phase).toBe("win");

    const progress = getProgress();
    expect(progress.totalWins).toBe(1);
    expect(progress.bestTimesMs["easy:555"]).toBe(12000);
    expect(progress.bestMoves["easy:555"]).toBe(3);
  });
});
