import React from "react";
import type { GameState } from "@/store/gameStore";

const steps = [
  "Goal: complete the 9x9 Sudoku and exhaust the stack. Difficulty changes how many cells are prefilled.",
  "Remove only legal pairs: both tiles must be open (no tile above and one horizontal side free) and values must match.",
  "Each legal pair adds 2 identical tokens to your buffer (capacity 5). If full, place tokens before removing more pairs.",
  "Select a token to highlight legal cells. Placement is blocked if the value repeats in its row, column, or 3x3 box.",
  "You have 3 undos and 3 lives per level. If you are stuck with no undos left, you lose one life.",
  "Stuck means no removable pairs, full buffer, and no legal placements. Use Undo or Restart to recover.",
  "Visible mode shows tile numbers and hidden mode conceals them. Change this in Settings.",
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
