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
        <div className="modal-title">How to play Pair &amp; Place</div>

        <div className="help-section">
          <div className="help-heading">1) Remove Pair</div>
          <p>Select two open matching tiles. Open = no tile above and at least one side free.</p>
        </div>

        <div className="help-section">
          <div className="help-heading">2) Token Buffer</div>
          <p>
            A removed pair gives 2 number tokens in the Token Buffer (max 5). If full, place tokens
            before removing another pair.
          </p>
        </div>

        <div className="help-section">
          <div className="help-heading">3) Place Token</div>
          <p>Choose a token, then place it in an empty cell that keeps row/column/box legal.</p>
          <p>Example: a token “7” cannot go where a 7 already exists in its row, column, or box.</p>
        </div>

        <div className="help-section">
          <div className="help-heading">4) Stuck, Lives, Undos</div>
          <ul>
            <li>Stuck = no removable pair + full buffer + no legal token placement.</li>
            <li>You have 3 undos per level.</li>
            <li>If no undo is left when stuck, you lose a life (3 lives total).</li>
          </ul>
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
