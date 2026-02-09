import React from "react";
import type { GameState } from "@/store/gameStore";

type TutorialOverlayProps = {
  state: GameState;
  onFinish: () => void;
};

type StepCopy = {
  message: string;
  reason: string;
};

function getStepCopy(step: number): StepCopy {
  if (step === 1) {
    return {
      message: "Tap a blocked tile to see why it cannot be removed.",
      reason: "Blocked tiles have a tile on top or are trapped on both sides, so they are locked.",
    };
  }

  if (step === 2) {
    return {
      message: "Tap the highlighted tile that causes a Sudoku conflict.",
      reason: "Duplicates are not allowed in any row, column, or 3x3 box, so conflicts are rejected.",
    };
  }

  if (step === 3) {
    return {
      message: "Use Undo to restore the last removed tile.",
      reason: "Undo helps recover from mistakes, but the number of uses can be limited by settings.",
    };
  }

  if (step === 4) {
    return {
      message: "Use Hint to highlight a legal move.",
      reason: "Hints point to a safe tile when you feel stuck, but the count is limited by settings.",
    };
  }

  if (step >= 5) {
    return {
      message: "Make three more moves, then finish the tutorial.",
      reason: "Keep the tray from filling, watch Sudoku legality, and press Finish Tutorial when ready.",
    };
  }

  return {
    message: "Tap a glowing free tile to remove it.",
    reason: "Free tiles are safe because at least one side is open and no tile sits on top.",
  };
}

export function TutorialOverlay({ state, onFinish }: TutorialOverlayProps) {
  const step = state.tutorialStep;
  const canFinish = step >= 5 && state.tutorialMovesDone >= state.tutorialMovesRequired;
  const { message, reason } = getStepCopy(step);

  return (
    <div className="tutorial-overlay">
      <div className="tutorial-card">
        <div className="tutorial-title">Tutorial</div>

        <div className="tutorial-section">
          <div className="tutorial-heading">How to Play</div>
          <div className="tutorial-objective">
            Reveal every tile by removing free tiles. Each removed tile reveals its number on the
            Sudoku grid. At the end, the grid must form a valid Sudoku.
          </div>
        </div>

        <div className="tutorial-section">
          <div className="tutorial-heading">Free tile rule</div>
          <ul className="tutorial-list">
            <li>No tile sits on top.</li>
            <li>At least one horizontal side is open.</li>
          </ul>
          <div className="tutorial-diagram" aria-hidden="true">
            <div className="tutorial-diagram-row">Open side → [Tile] ← Blocked side</div>
            <div className="tutorial-diagram-row">Top blocked: [Tile] + [Tile]</div>
          </div>
        </div>

        <div className="tutorial-section">
          <div className="tutorial-heading">Sudoku rules</div>
          <div className="tutorial-body">
            Duplicates are not allowed in any row, column, or 3x3 box. When a move is illegal, the
            grid highlights the conflicting cells so you can see where the duplicate appears.
          </div>
        </div>

        <div className="tutorial-section">
          <div className="tutorial-heading">Tools and Strategy</div>
          <ul className="tutorial-list">
            <li>
              <strong>Undo</strong> restores your last removed tile and is limited by settings.
            </li>
            <li>
              <strong>Hint</strong> highlights a safe tile when you are stuck and is limited by
              settings.
            </li>
            <li>
              <strong>Tray</strong> shows your last few moves, so avoid filling it to keep options
              open.
            </li>
            <li>
              Strategy tip: start with tiles that open access to more tiles or reveal rarer numbers.
            </li>
          </ul>
        </div>

        <div className="tutorial-section">
          <div className="tutorial-heading">Instruction</div>
          <div className="tutorial-message">{message}</div>
          <div className="tutorial-tip">{reason}</div>
        </div>

        {canFinish && (
          <button className="menu-primary tutorial-finish" onClick={onFinish}>
            Finish Tutorial
          </button>
        )}
      </div>
    </div>
  );
}
