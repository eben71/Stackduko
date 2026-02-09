import React from "react";
import type { GameState } from "@/store/gameStore";

type TutorialOverlayProps = {
  state: GameState;
  onFinish: () => void;
  onAdvance: () => void;
};

type StepContent = {
  title: string;
  body: string;
  bullets?: string[];
  action?: string;
};

function getStepContent(state: GameState): StepContent {
  const { tutorialLastReveal, tutorialMovesDone, tutorialMovesRequired } = state;
  switch (state.tutorialStep) {
    case 0:
      return {
        title: "Big picture",
        body: "You do NOT place numbers. You reveal them.",
        bullets: [
          "Each 3D tile is linked to one Sudoku cell.",
          "Removing a tile auto-fills its number into the grid.",
          "The grid shows revealed progress, not placement choices.",
          "Goal: clear all tiles and keep the revealed Sudoku valid.",
        ],
        action: "Press Next to begin.",
      };
    case 1:
      return {
        title: "Free tiles",
        body: "Free tiles glow. A tile is free when nothing is on top and at least one side is open.",
        bullets: ["Tap a glowing tile when you're ready.", "You reveal the bound cell automatically."],
        action: "Press Next to practice a reveal.",
      };
    case 2:
      return {
        title: "Reveal a free tile",
        body: "Remove any glowing tile.",
        bullets: ["Watch the grid auto-fill after the tile disappears."],
      };
    case 3: {
      const revealText = tutorialLastReveal
        ? `This tile revealed R${tutorialLastReveal.row + 1} C${
            tutorialLastReveal.col + 1
          } = ${tutorialLastReveal.value}.`
        : "Nice reveal!";
      return {
        title: "Blocked tiles",
        body: revealText,
        bullets: ["Tap the blocked tile to see why it cannot be removed."],
      };
    }
    case 4:
      return {
        title: "Sudoku conflicts",
        body: "Revealed numbers must follow Sudoku rules.",
        bullets: ["Tap the highlighted tile to see a conflict.", "Conflicts show a red outline."],
      };
    case 5:
      return {
        title: "Undo",
        body: "Undo reverses your last reveal and hides the grid cell again.",
        bullets: ["Press Undo once."],
      };
    case 6:
      return {
        title: "Hint",
        body: "Hints point to a legal, free tile.",
        bullets: ["Press Hint, then remove the highlighted tile."],
      };
    case 7:
      return {
        title: "Undo History",
        body: "The tray is your Undo History, not storage.",
        bullets: [
          "Undo only affects your most recent reveals.",
          "When full, older moves are locked in (play continues).",
        ],
        action: "Press Next to enter free play.",
      };
    case 8: {
      const remaining = Math.max(0, tutorialMovesRequired - tutorialMovesDone);
      return {
        title: "Free play",
        body: `Make ${remaining} more reveal${remaining === 1 ? "" : "s"}, then finish.`,
        bullets: ["Use Undo or Hint if you get stuck.", "Clear all tiles to win."],
      };
    }
    default:
      return {
        title: "Tutorial",
        body: "Follow the steps to learn the rules.",
      };
  }
}

export function TutorialOverlay({ state, onFinish, onAdvance }: TutorialOverlayProps) {
  const step = state.tutorialStep;
  const canFinish = step >= 8 && state.tutorialMovesDone >= state.tutorialMovesRequired;
  const content = getStepContent(state);
  const showNext = step === 0 || step === 1 || step === 7;

  return (
    <div className="tutorial-overlay">
      <div className="tutorial-card tutorial-guided" role="dialog" aria-live="polite">
        <div className="tutorial-header">
          <div>
            <div className="tutorial-title">Tutorial</div>
            <div className="tutorial-step">{`Step ${Math.min(step + 1, 9)} of 9`}</div>
          </div>
        </div>

        <div className="tutorial-section">
          <div className="tutorial-heading">{content.title}</div>
          <div className="tutorial-body">{content.body}</div>
          {content.bullets && (
            <ul className="tutorial-list">
              {content.bullets.map((bullet) => (
                <li key={bullet}>{bullet}</li>
              ))}
            </ul>
          )}
          {content.action && <div className="tutorial-tip">{content.action}</div>}
        </div>

        <div className="tutorial-actions">
          {showNext && (
            <button className="menu-primary" onClick={onAdvance}>
              Next
            </button>
          )}
          {canFinish && (
            <button className="menu-primary" onClick={onFinish}>
              Finish Tutorial
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
