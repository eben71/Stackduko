import Phaser from "phaser";
import { type Settings } from "@/game/state/storage";
import { type RevealedGrid } from "@/logic/solver/solver";

type ConflictCell = { row: number; col: number };

export class BoardRenderer {
  private scene: Phaser.Scene;
  private graphics: Phaser.GameObjects.Graphics;
  private conflictGraphics: Phaser.GameObjects.Graphics;
  private legalGraphics: Phaser.GameObjects.Graphics;
  private barrierGraphics: Phaser.GameObjects.Graphics;
  private barrierLabels: Phaser.GameObjects.Text[] = [];
  private cellTexts: Phaser.GameObjects.Text[][];
  private cellDots: Phaser.GameObjects.Text[][];
  private origin: { x: number; y: number };
  private cellSize: number;
  private lastRevealed: RevealedGrid | null = null;

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
    this.legalGraphics = scene.add.graphics();
    this.barrierGraphics = scene.add.graphics();
    this.cellTexts = [];
    this.cellDots = [];
    this.buildCells(settings);
    this.drawGrid(settings);
  }

  updateOrigin(origin: { x: number; y: number }) {
    this.origin = origin;
    for (let row = 0; row < 9; row += 1) {
      for (let col = 0; col < 9; col += 1) {
        const x = this.origin.x + col * this.cellSize + this.cellSize / 2;
        const y = this.origin.y + row * this.cellSize + this.cellSize / 2;
        this.cellTexts[row][col].setPosition(x, y);
        this.cellDots[row][col].setPosition(x, y);
      }
    }
  }

  updateSettings(settings: Settings) {
    this.drawGrid(settings);
  }

  destroy() {
    this.graphics.destroy();
    this.conflictGraphics.destroy();
    this.legalGraphics.destroy();
    this.barrierGraphics.destroy();
    this.barrierLabels.forEach((label) => label.destroy());
    this.cellTexts.flat().forEach((text) => text.destroy());
    this.cellDots.flat().forEach((dot) => dot.destroy());
  }

  updateRevealed(revealed: RevealedGrid) {
    for (let row = 0; row < 9; row += 1) {
      for (let col = 0; col < 9; col += 1) {
        const value = revealed[row]?.[col];
        const previous = this.lastRevealed?.[row]?.[col] ?? null;
        this.cellTexts[row][col].setText(value ? String(value) : "");
        this.cellDots[row][col].setAlpha(value ? 0 : 0.25);

        if (!previous && value) {
          this.flashCell(row, col);
        } else if (previous && !value) {
          this.vaporizeCell(row, col, previous);
        }
      }
    }
    this.lastRevealed = revealed.map((row) => [...row]);
  }

  updateLegalHighlights(
    cells: Array<{ row: number; col: number }>,
    barriers: Record<string, number>,
    turn: number,
  ) {
    this.legalGraphics.clear();
    this.legalGraphics.fillStyle(0x22c55e, 0.2);
    cells.forEach(({ row, col }) => {
      this.legalGraphics.fillRoundedRect(
        this.origin.x + col * this.cellSize + 3,
        this.origin.y + row * this.cellSize + 3,
        this.cellSize - 6,
        this.cellSize - 6,
        6,
      );
    });

    this.barrierGraphics.clear();
    this.barrierLabels.forEach((label) => label.destroy());
    this.barrierLabels = [];
    Object.entries(barriers).forEach(([key, expiry]) => {
      const [row, col] = key.split(",").map(Number);
      const cellX = this.origin.x + col * this.cellSize;
      const cellY = this.origin.y + row * this.cellSize;
      const centerX = cellX + this.cellSize / 2;
      const centerY = cellY + this.cellSize / 2;

      // Stronger blocked-cell treatment: dark slab, red cross, and rocky center.
      this.barrierGraphics.fillStyle(0x111827, 0.65);
      this.barrierGraphics.fillRect(cellX, cellY, this.cellSize, this.cellSize);

      this.barrierGraphics.lineStyle(4, 0xef4444, 0.95);
      this.barrierGraphics.lineBetween(
        cellX + 6,
        cellY + 6,
        cellX + this.cellSize - 6,
        cellY + this.cellSize - 6,
      );
      this.barrierGraphics.lineBetween(
        cellX + this.cellSize - 6,
        cellY + 6,
        cellX + 6,
        cellY + this.cellSize - 6,
      );

      this.barrierGraphics.fillStyle(0x4b5563, 0.95);
      this.barrierGraphics.fillCircle(centerX, centerY, Math.max(6, this.cellSize * 0.16));

      this.barrierGraphics.lineStyle(2, 0x9ca3af, 0.85);
      this.barrierGraphics.strokeCircle(centerX, centerY, Math.max(6, this.cellSize * 0.16));

      const turnsLeft = Math.max(0, expiry - turn);

      this.barrierGraphics.fillStyle(0xb91c1c, 1);
      this.barrierGraphics.fillRoundedRect(cellX + this.cellSize - 20, cellY + 2, 18, 16, 4);
      const label = this.scene.add
        .text(cellX + this.cellSize - 11, cellY + 10, String(turnsLeft), {
          fontFamily: "Fredoka, sans-serif",
          fontSize: "11px",
          color: "#ffffff",
          fontStyle: "700",
        })
        .setOrigin(0.5)
        .setDepth(30);
      this.barrierLabels.push(label);
    });
  }

  showConflicts(conflicts: ConflictCell[]) {
    this.conflictGraphics.clear();
    this.conflictGraphics.lineStyle(3, 0xef4444, 0.9);
    conflicts.forEach((cell) => {
      this.conflictGraphics.strokeRoundedRect(
        this.origin.x + cell.col * this.cellSize,
        this.origin.y + cell.row * this.cellSize,
        this.cellSize,
        this.cellSize,
        6,
      );
    });
  }

  private buildCells(settings: Settings) {
    for (let row = 0; row < 9; row += 1) {
      this.cellTexts[row] = [];
      this.cellDots[row] = [];
      for (let col = 0; col < 9; col += 1) {
        const x = this.origin.x + col * this.cellSize + this.cellSize / 2;
        const y = this.origin.y + row * this.cellSize + this.cellSize / 2;
        this.cellDots[row][col] = this.scene.add
          .text(x, y, "·", {
            fontFamily: "Fredoka, sans-serif",
            fontSize: settings.largeText ? "20px" : "16px",
            color: "#94a3b8",
          })
          .setOrigin(0.5);
        this.cellTexts[row][col] = this.scene.add
          .text(x, y, "", {
            fontFamily: "Fredoka, sans-serif",
            fontSize: settings.largeText ? "30px" : "24px",
            color: "#2563eb",
            fontStyle: "700",
          })
          .setOrigin(0.5)
          .setDepth(10);
      }
    }
  }

  private drawGrid(settings: Settings) {
    this.graphics.clear();
    const gridColor = settings.highContrast ? 0x0f172a : 0x334155;
    for (let i = 0; i <= 9; i += 1) {
      const thickness = i % 3 === 0 ? 3 : 1;
      this.graphics.lineStyle(thickness, gridColor, 0.7);
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

  private flashCell(row: number, col: number) {
    const highlight = this.scene.add.graphics();
    highlight.fillStyle(0x60a5fa, 0.25);
    highlight.fillRoundedRect(
      this.origin.x + col * this.cellSize,
      this.origin.y + row * this.cellSize,
      this.cellSize,
      this.cellSize,
      6,
    );
    this.scene.tweens.add({
      targets: highlight,
      alpha: 0,
      duration: 500,
      onComplete: () => highlight.destroy(),
    });
  }

  private vaporizeCell(row: number, col: number, value: number) {
    const x = this.origin.x + col * this.cellSize + this.cellSize / 2;
    const y = this.origin.y + row * this.cellSize + this.cellSize / 2;

    const text = this.scene.add
      .text(x, y, String(value), {
        fontFamily: "Fredoka, sans-serif",
        fontSize: "24px",
        color: "#ffffff",
        fontStyle: "700",
        backgroundColor: "#60a5fa",
        padding: { x: 8, y: 8 },
      })
      .setOrigin(0.5)
      .setDepth(100);

    const highlight = this.scene.add.graphics();
    highlight.fillStyle(0x60a5fa, 0.8);
    highlight.fillRoundedRect(
      this.origin.x + col * this.cellSize,
      this.origin.y + row * this.cellSize,
      this.cellSize,
      this.cellSize,
      6,
    );
    highlight.setDepth(99);

    this.scene.tweens.add({
      targets: [text, highlight],
      y: y - 40,
      alpha: 0,
      scale: 1.5,
      angle: (Math.random() - 0.5) * 45,
      duration: 600,
      ease: "Cubic.out",
      onComplete: () => {
        text.destroy();
        highlight.destroy();
      },
    });
  }
}
