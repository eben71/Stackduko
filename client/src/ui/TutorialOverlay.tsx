import React from "react";
import type { GameState } from "@/store/gameStore";

export function TutorialOverlay({
  state,
  onFinish,
  onAdvance,
}: {
  state: GameState;
  onFinish: () => void;
  onAdvance: () => void;
}) {
  const steps = [
    "Remove two open matching tiles to create tokens.",
    "Select a token from Hand and place it on a legal Sudoku cell.",
    "Use Token Buffer (max 5) to delay placement.",
    "Blocked barrier cells appear after each completed pair and expire in 2 turns.",
    "You have 3 lives and 3 undos.",
    "Finish by filling the grid.",
  ];
  const step = Math.min(state.tutorialStep, steps.length - 1);
  return (
    <div className="tutorial-overlay">
      <div className="tutorial-card tutorial-guided" role="dialog" aria-live="polite">
        <div className="tutorial-title">Pair &amp; Place Tutorial</div>
        <div className="tutorial-step">
          Step {step + 1} of {steps.length}
        </div>
        <div className="tutorial-body">{steps[step]}</div>
        <div className="tutorial-actions">
          {step < steps.length - 1 && (
            <button className="menu-primary" onClick={onAdvance}>
              Next
            </button>
          )}
          {step === steps.length - 1 && (
            <button className="menu-primary" onClick={onFinish}>
              Finish Tutorial
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
