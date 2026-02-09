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
        <div className="modal-title">How to Play</div>

        <div className="help-section">
          <div className="help-heading">Big picture</div>
          <p>
            You do not place numbers. You reveal them by removing free tiles. Each 3D tile is bound
            to exactly one Sudoku cell.
          </p>
        </div>

        <div className="help-section">
          <div className="help-heading">Reveals & the grid</div>
          <ul>
            <li>Removing a free tile auto-fills its number into the grid.</li>
            <li>The grid shows revealed progress, not a placement board.</li>
            <li>Sudoku rules apply only to revealed cells.</li>
            <li>Hover/tap a free tile to see its row/column (value shown in Visible mode).</li>
          </ul>
        </div>

        <div className="help-section">
          <div className="help-heading">Free tiles</div>
          <ul>
            <li>No tile sits on top.</li>
            <li>At least one horizontal side is open.</li>
          </ul>
        </div>

        <div className="help-section">
          <div className="help-heading">Undo History (Tray)</div>
          <ul>
            <li>The tray is your undo history, not storage.</li>
            <li>If it fills, older reveals are locked in (play continues).</li>
          </ul>
        </div>

        <div className="help-section">
          <div className="help-heading">Win / Stuck</div>
          <ul>
            <li>Win: clear all tiles while keeping the revealed Sudoku valid.</li>
            <li>Stuck: no legal reveals remain — use Undo, Hint, or Restart.</li>
          </ul>
        </div>

        <div className="help-section">
          <div className="help-heading">Hints</div>
          <p>Hints highlight a legal free tile (safe reveal).</p>
        </div>

        <button className="menu-primary w-full mt-4" onClick={onClose}>
          Back to Game
        </button>
      </div>
    </div>
  );
}
