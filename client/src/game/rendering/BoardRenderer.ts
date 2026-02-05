import Phaser from "phaser";
import { type Settings } from "@/game/state/storage";
import { type RevealedGrid } from "@/logic/solver/solver";

type ConflictCell = { row: number; col: number };

export class BoardRenderer {
  private scene: Phaser.Scene;
  private graphics: Phaser.GameObjects.Graphics;
  private conflictGraphics: Phaser.GameObjects.Graphics;
  private cellTexts: Phaser.GameObjects.Text[][];
  private origin: { x: number; y: number };
  private cellSize: number;

  constructor(
    scene: Phaser.Scene,
    origin: { x: number; y: number },
    cellSize: number,
    settings: Settings,
  ) {
    this.scene = scene;
    this.origin = origin;
    this.cellSize = cellSize;
    this.graphics = scene.add.graphics();
    this.conflictGraphics = scene.add.graphics();
    this.cellTexts = [];
    this.buildCells(settings);
    this.drawGrid(settings);
  }

  updateOrigin(origin: { x: number; y: number }) {
    this.origin = origin;
    for (let row = 0; row < 9; row += 1) {
      for (let col = 0; col < 9; col += 1) {
        const text = this.cellTexts[row][col];
        text.setPosition(
          this.origin.x + col * this.cellSize + this.cellSize / 2,
          this.origin.y + row * this.cellSize + this.cellSize / 2,
        );
      }
    }
  }

  updateSettings(settings: Settings) {
    this.drawGrid(settings);
    const fontSize = settings.largeText ? "30px" : "24px";
    const color = settings.highContrast ? "#0f172a" : "#2563eb";
    this.cellTexts.flat().forEach((text) => {
      text.setFontSize(fontSize);
      text.setColor(color);
    });
  }

  destroy() {
    this.graphics.destroy();
    this.conflictGraphics.destroy();
    this.cellTexts.flat().forEach((text) => text.destroy());
  }

  updateRevealed(revealed: RevealedGrid) {
    for (let row = 0; row < 9; row += 1) {
      for (let col = 0; col < 9; col += 1) {
        const value = revealed[row]?.[col];
        this.cellTexts[row][col].setText(value ? String(value) : "");
      }
    }
  }

  showConflicts(conflicts: ConflictCell[]) {
    this.conflictGraphics.clear();
    if (conflicts.length === 0) return;

    this.conflictGraphics.fillStyle(0xef4444, 0.18);
    conflicts.forEach((cell) => {
      this.conflictGraphics.fillRoundedRect(
        this.origin.x + cell.col * this.cellSize,
        this.origin.y + cell.row * this.cellSize,
        this.cellSize,
        this.cellSize,
        6,
      );
    });

    this.scene.tweens.add({
      targets: this.conflictGraphics,
      alpha: 0,
      duration: 500,
      onComplete: () => {
        this.conflictGraphics.clear();
        this.conflictGraphics.alpha = 1;
      },
    });
  }

  private buildCells(settings: Settings) {
    const fontSize = settings.largeText ? "30px" : "24px";
    const color = settings.highContrast ? "#0f172a" : "#2563eb";
    for (let row = 0; row < 9; row += 1) {
      this.cellTexts[row] = [];
      for (let col = 0; col < 9; col += 1) {
        const x = this.origin.x + col * this.cellSize + this.cellSize / 2;
        const y = this.origin.y + row * this.cellSize + this.cellSize / 2;
        const text = this.scene.add
          .text(x, y, "", {
            fontFamily: "Fredoka, sans-serif",
            fontSize,
            color,
          })
          .setOrigin(0.5)
          .setDepth(10);
        this.cellTexts[row][col] = text;
      }
    }
  }

  private drawGrid(settings: Settings) {
    this.graphics.clear();
    const gridColor = settings.highContrast ? 0x0f172a : 0x334155;
    const gridAlpha = settings.highContrast ? 0.9 : 0.6;

    for (let i = 0; i <= 9; i += 1) {
      const thickness =
        i % 3 === 0 ? (settings.highContrast ? 5 : 3) : settings.highContrast ? 2 : 1;
      this.graphics.lineStyle(thickness, gridColor, gridAlpha);
      this.graphics.lineBetween(
        this.origin.x,
        this.origin.y + i * this.cellSize,
        this.origin.x + 9 * this.cellSize,
        this.origin.y + i * this.cellSize,
      );
      this.graphics.lineBetween(
        this.origin.x + i * this.cellSize,
        this.origin.y,
        this.origin.x + i * this.cellSize,
        this.origin.y + 9 * this.cellSize,
      );
    }
  }
}
