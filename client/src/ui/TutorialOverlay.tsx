import React from "react";
import type { GameState } from "@/store/gameStore";

const steps = [
  "The Sudoku starts prefilled. Finish all empty cells to win.",
  "Remove Mahjong-style pairs: both tiles must be open and match.",
  "Each removed pair adds 2 tokens to the Token Buffer (capacity 5).",
  "Select a token to highlight legal cells, then place it without breaking Sudoku rules.",
  "If you are stuck, use up to 3 undos. Without undos, stuck states cost a life (3 lives total).",
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
        <div className="tutorial-title">Pair &amp; Place Tutorial</div>
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
