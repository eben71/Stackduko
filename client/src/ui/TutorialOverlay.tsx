import React from "react";
import type { GameState } from "@/store/gameStore";

const steps = [
  "Goal: reveal legal moves in the stack and resolve the Sudoku. Fill every empty cell correctly to win.",
  "Remove only legal pairs: both tiles must be open (no tile above + one side free) and values must match.",
  "Each legal pair adds 2 tokens to your tray (capacity 5). If full, place tokens before removing more pairs.",
  "Place tokens only in legal Sudoku cells. A value is illegal if it repeats in the same row, column, or 3×3 box.",
  "Use Remove Pair Hint for guidance and Undo to recover mistakes. If no recovery is left in a stuck state, you lose a life.",
  "Visible mode shows tile numbers. Hidden mode conceals them for higher difficulty. You can change this in Settings.",
];

export function TutorialOverlay({
  state,
  onFinish,
  onAdvance,
  onBack,
}: {
  state: GameState;
  onFinish: () => void;
  onAdvance: () => void;
  onBack: () => void;
}) {
  const step = Math.min(state.tutorialStep, steps.length - 1);
  return (
    <div className="tutorial-overlay">
      <div className="tutorial-card tutorial-guided" role="dialog" aria-live="polite">
        <div className="tutorial-title">Stackdoku Tutorial</div>
        <div className="tutorial-step">
          Step {step + 1} of {steps.length}
        </div>
        <div className="tutorial-body">{steps[step]}</div>
        <div className="tutorial-actions">
          <button className="menu-secondary" onClick={onBack} disabled={step === 0}>
            Back
          </button>
          {step < steps.length - 1 ? (
            <button className="menu-primary" onClick={onAdvance}>
              Next
            </button>
          ) : (
            <button className="menu-primary" onClick={onFinish}>
              Finish Tutorial
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
