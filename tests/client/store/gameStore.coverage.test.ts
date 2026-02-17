import { beforeEach, describe, expect, it } from "vitest";
import { useGameStore } from "../../../client/src/store/gameStore";

describe("gameStore additional coverage", () => {
  beforeEach(() => {
    useGameStore.setState(useGameStore.getInitialState(), true);
  });

  it("covers menu and pause controls", () => {
    useGameStore.getState().setPhase("menu");
    useGameStore.getState().startTutorial();
    expect(useGameStore.getState().phase).toBe("tutorial");
    useGameStore.getState().advanceTutorial();
    useGameStore.getState().pauseGame();
    expect(useGameStore.getState().phase).toBe("paused");
    useGameStore.getState().resumeGame();
    useGameStore.getState().clearHint();
    useGameStore.getState().clearMessage();
    useGameStore.getState().finishTutorial();
    expect(useGameStore.getState().phase).toBe("menu");
  });

  it("covers restart, hint, undo fallthrough, and quit", () => {
    useGameStore.getState().startGame("easy", 1, 9001);
    useGameStore.getState().restartLevel();
    const hint = useGameStore.getState().useHint();
    expect(hint === null || typeof hint === "number").toBe(true);
    expect(useGameStore.getState().undoMove()).toBe(false);
    useGameStore.getState().quitToMenu();
    expect(useGameStore.getState().phase).toBe("menu");
  });
});
