import React from "react";
import type { GameState } from "@/store/gameStore";

const steps = [
  "Goal: complete the 9x9 Sudoku and exhaust the tile stack. This loop is Reveal & Resolve, also called Pair & Place.",
  "Find free tiles first: a tile is free only when nothing is on top and at least one horizontal side is open.",
  "Remove only matching free tiles as a pair. Illegal attempts include blocked tiles, covered tiles, or mismatched values.",
  "Each legal pair adds 2 identical tokens to your buffer. Buffer capacity is 5, so if it fills up you must place tokens before removing more pairs.",
  "Select a token to highlight legal Sudoku cells. You can place only where the value does not repeat in the row, column, or 3x3 box.",
  "You have 3 undos and 3 lives per level. Use undo to recover from bad sequences or deadlocks before you lose a life.",
  "Stuck means no removable pairs, a full buffer, and no legal placements. Visible mode shows tile numbers; hidden mode conceals them.",
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
