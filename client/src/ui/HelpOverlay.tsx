import React from "react";
import { X } from "lucide-react";

type HelpOverlayProps = {
  open: boolean;
  onClose: () => void;
};

export function HelpOverlay({ open, onClose }: HelpOverlayProps) {
  if (!open) return null;

  return (
    <div className="overlay-modal" role="dialog" aria-modal="true">
      <div className="help-card">
        <button className="help-close" onClick={onClose} aria-label="Close help">
          <X size={20} />
        </button>
        <div className="modal-title">How to play Stackdoku: Reveal &amp; Resolve</div>

        <div className="help-section">
          <div className="help-heading">1) Reveal: Remove a legal pair</div>
          <p>
            Select two open matching tiles. Open means no tile above and at least one horizontal
            side free.
          </p>
          <p>Illegal move examples: blocked tile, covered tile, or mismatched values.</p>
        </div>

        <div className="help-section">
          <div className="help-heading">2) Tray (Token Buffer)</div>
          <p>
            A removed pair gives 2 number tokens in the tray (max 5). If full, place tokens before
            removing another pair.
          </p>
        </div>

        <div className="help-section">
          <div className="help-heading">3) Resolve: Place tokens legally</div>
          <p>Choose a token, then place it in an empty cell that keeps row/column/box legal.</p>
          <p>Example: a token “7” cannot go where a 7 already exists in its row, column, or box.</p>
          <p>Tip: selecting a tray token highlights legal target cells.</p>
        </div>

        <div className="help-section">
          <div className="help-heading">4) Hints, Undos, and stuck states</div>
          <ul>
            <li>Use Remove Pair Hint to highlight a likely open tile to start from.</li>
            <li>Undo reverses recent actions and can recover deadlocks.</li>
            <li>Stuck = no removable pair + full buffer + no legal token placement.</li>
            <li>You have a configurable undo limit (default play flow uses 3 per level).</li>
            <li>If no undo is left when stuck, you lose a life (3 lives total).</li>
          </ul>
        </div>

        <div className="help-section">
          <div className="help-heading">5) Visible vs hidden mode</div>
          <p>
            In visible mode, tile numbers are shown. In hidden mode, tile values are concealed for a
            harder memory/planning challenge.
          </p>
        </div>

        <div className="help-section">
          <div className="help-heading">Win</div>
          <p>Remove all tiles and fill the Sudoku correctly.</p>
        </div>

        <button className="menu-primary w-full mt-4" onClick={onClose}>
          Back to Game
        </button>
      </div>
    </div>
  );
}
