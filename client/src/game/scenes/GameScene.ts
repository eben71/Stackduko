import Phaser from "phaser";
import { getSettings, type Settings } from "@/game/state/storage";
import { BoardRenderer } from "@/game/rendering/BoardRenderer";
import { TileSprite } from "@/game/rendering/TileSprite";
import { useGameStore } from "@/store/gameStore";
import { isFreeTile } from "@/logic/stack/freeTile";

const TILE_SIZE = 60;
const ISO_OFFSET_X = -6;
const ISO_OFFSET_Y = 10;

export class GameScene extends Phaser.Scene {
  private tiles: Map<number, TileSprite> = new Map();
  private boardRenderer?: BoardRenderer;
  private gridLabel?: Phaser.GameObjects.Text;
  private revealTooltip?: Phaser.GameObjects.Text;
  private infiniteEvent?: Phaser.Time.TimerEvent;
  private settings: Settings = getSettings();
  private unsubscribeStore?: () => void;
  private layout = {
    stackOriginX: 0,
    stackOriginY: 0,
    gridOriginX: 0,
    gridOriginY: 0,
    cellSize: 36,
    minX: 0,
    minY: 0,
  };

  constructor(key: string = "GameScene") {
    super(key);
  }

  create() {
    this.settings = getSettings();
    this.cameras.main.setBackgroundColor(0xf8fafc);
    this.setupLevel();
    this.scale.on("resize", () => this.layoutScene());
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.unsubscribeStore?.();
      this.unsubscribeStore = undefined;
      this.boardRenderer = undefined;
      this.gridLabel = undefined;
      this.revealTooltip = undefined;
      this.infiniteEvent?.destroy();
      this.infiniteEvent = undefined;
      this.tiles.clear();
    });
  }

  private setupLevel() {
    const state = useGameStore.getState();
    if (state.tiles.length === 0) return;
    this.tiles.forEach((tile) => tile.container.destroy());
    this.tiles.clear();

    this.layoutScene();
    this.createTiles();
    this.createBoard();
    this.input.off("pointerdown");
    this.input.on("pointerdown", this.handleBoardClick, this);
    this.syncFromStore();

    this.unsubscribeStore?.();
    this.unsubscribeStore = useGameStore.subscribe((next) => {
      if (
        next.phase === "playing" ||
        next.phase === "paused" ||
        next.phase === "win" ||
        next.phase === "stuck" ||
        next.phase === "tutorial"
      ) {
        this.syncFromStore();
      }
    });

    this.infiniteEvent?.destroy();
    if (state.difficulty === "infinite") {
      this.infiniteEvent = this.time.addEvent({
        delay: 6000,
        loop: true,
        callback: () => {
          if (useGameStore.getState().phase === "playing") {
            useGameStore.getState().dropInfinitePair();
          }
        },
      });
    }
  }

  private layoutScene() {
    const state = useGameStore.getState();
    const width = this.scale.width;
    const height = this.scale.height;

    if (state.tiles.length === 0) return;

    const gridCellSize = Math.max(28, Math.min(42, Math.floor((width - 40) / 9)));
    const gridWidth = gridCellSize * 9;
    const gridHeight = gridCellSize * 9;
    const gridOriginX = (width - gridWidth) / 2;
    const gridOriginY = Math.max(20, height - gridHeight - 24);

    const positions = state.tiles.map((tile) => ({ x: tile.x, y: tile.y, z: tile.z }));
    const minX = Math.min(...positions.map((pos) => pos.x));
    const maxX = Math.max(...positions.map((pos) => pos.x));
    const minY = Math.min(...positions.map((pos) => pos.y));
    const maxY = Math.max(...positions.map((pos) => pos.y));
    const maxZ = Math.max(...positions.map((pos) => pos.z));

    const stackWidth = (maxX - minX + 1) * TILE_SIZE + maxZ * Math.abs(ISO_OFFSET_X);
    const stackHeight = (maxY - minY + 1) * TILE_SIZE + maxZ * ISO_OFFSET_Y;

    // Scale stack if it's going to overlap with the grid or crop at the top
    const availableHeight = Math.max(10, gridOriginY - 40);
    const stackScale = stackHeight > availableHeight ? availableHeight / stackHeight : 1;

    const stackOriginX = (width - stackWidth * stackScale) / 2;
    const stackOriginY = Math.max(20, gridOriginY - stackHeight * stackScale - 20);

    const previousCellSize = this.layout.cellSize;
    this.layout = {
      stackOriginX,
      stackOriginY,
      gridOriginX,
      gridOriginY,
      cellSize: gridCellSize,
      minX,
      minY,
      stackScale,
    };

    if (this.boardRenderer && previousCellSize !== gridCellSize) {
      this.boardRenderer.destroy();
      this.boardRenderer = undefined;
    }

    if (this.boardRenderer) {
      this.boardRenderer.updateOrigin({ x: gridOriginX, y: gridOriginY });
      this.boardRenderer.updateSettings(this.settings);
    }

    if (this.gridLabel) {
      this.gridLabel.setPosition(gridOriginX, gridOriginY - 26);
    }

    this.tiles.forEach((tileSprite) => {
      const position = this.computeTilePosition(tileSprite.tile);
      tileSprite.container.setPosition(position.x, position.y);
      tileSprite.container.setDepth(tileSprite.tile.z * 1000 + position.y);
    });
  }

  private computeTilePosition(tile: { x: number; y: number; z: number }) {
    const scale = (this.layout as any).stackScale ?? 1;
    return {
      x:
        this.layout.stackOriginX +
        ((tile.x - this.layout.minX) * TILE_SIZE + TILE_SIZE / 2 + tile.z * ISO_OFFSET_X) * scale,
      y:
        this.layout.stackOriginY +
        ((tile.y - this.layout.minY) * TILE_SIZE + TILE_SIZE / 2 - tile.z * ISO_OFFSET_Y) * scale,
    };
  }

  private createTiles() {
    const state = useGameStore.getState();
    state.tiles.forEach((tile, index) => {
      this.createTileSprite(index);
    });
  }

  private createTileSprite(index: number) {
    const state = useGameStore.getState();
    const tile = state.tiles[index];
    if (!tile) return;
    const position = this.computeTilePosition(tile);
    const sprite = new TileSprite(this, index, tile, position, this.settings);
    const scale = (this.layout as any).stackScale ?? 1;
    sprite.setScale(scale);
    sprite.container.setDepth(tile.z * 1000 + position.y);
    sprite.setInteractive(
      () => this.handleTileClick(index),
      (hovered) => this.handleTileHover(index, hovered),
    );
    this.tiles.set(index, sprite);

    const duration = this.getAnimDuration(400);
    if (duration > 0) {
      const targetY = sprite.container.y;
      sprite.container.setY(targetY - 600 - Math.random() * 200);
      this.tweens.add({
        targets: sprite.container,
        y: targetY,
        duration: duration + Math.random() * 300,
        ease: "Bounce.easeOut",
      });
    }
  }

  private createBoard() {
    if (!this.boardRenderer) {
      this.boardRenderer = new BoardRenderer(
        this,
        { x: this.layout.gridOriginX, y: this.layout.gridOriginY },
        this.layout.cellSize,
        this.settings,
      );
    } else {
      this.boardRenderer.updateSettings(this.settings);
    }
    if (!this.gridLabel) {
      this.gridLabel = this.add
        .text(
          this.layout.gridOriginX,
          this.layout.gridOriginY - 26,
          "Sudoku Grid (place selected token)",
          {
            fontFamily: "Fredoka, sans-serif",
            fontSize: "16px",
            color: "#64748b",
          },
        )
        .setOrigin(0, 0.5)
        .setDepth(20);
    }
  }

  private handleTileClick(index: number) {
    const tileSprite = this.tiles.get(index);
    if (tileSprite) {
      const phase = useGameStore.getState().phase;
      if (phase === "playing" || phase === "tutorial") {
        this.showRevealTooltip(tileSprite);
      }
    }

    const result = useGameStore.getState().attemptRemoveTile(index);
    if (!tileSprite) return;

    if (!result.ok) {
      const duration = this.getAnimDuration(80);
      tileSprite.shake(duration);
      if (result.conflicts && this.boardRenderer) {
        this.boardRenderer.showConflicts(result.conflicts);
      }
      return;
    }

    if (result.pending) {
      this.syncFromStore();
      return;
    }

    if (result.removedNodes) {
      const [first, second] = result.removedNodes;
      const t1 = this.tiles.get(first);
      const t2 = this.tiles.get(second);
      const duration = this.getAnimDuration(280);

      t1?.remove(duration, () => {
        this.tiles.delete(first);
      });
      t2?.remove(duration, () => {
        this.tiles.delete(second);
        this.syncFromStore();
      });
      return;
    }

    const duration = this.getAnimDuration(280);
    tileSprite.remove(duration, () => {
      this.tiles.delete(index);
      this.syncFromStore();
    });
  }

  private handleTileHover(index: number, hovered: boolean) {
    if (!hovered) return;
    const tileSprite = this.tiles.get(index);
    if (!tileSprite) return;
    const phase = useGameStore.getState().phase;
    if (phase !== "playing" && phase !== "tutorial") return;
    this.showRevealTooltip(tileSprite);
  }

  private showRevealTooltip(tileSprite: TileSprite) {
    const state = useGameStore.getState();
    if (!state.solverContext) return;
    const isFree = isFreeTile(tileSprite.index, state.present, state.solverContext.adjacency);
    if (!isFree) return;

    const tile = tileSprite.tile;
    const label = `Tile ${tile.value} (open)`;

    this.revealTooltip?.destroy();
    const tooltip = this.add
      .text(tileSprite.container.x, tileSprite.container.y - 40, label, {
        fontFamily: "Fredoka, sans-serif",
        fontSize: "16px",
        color: "#0f172a",
        backgroundColor: "rgba(255, 255, 255, 0.92)",
        padding: { x: 8, y: 4 },
      })
      .setOrigin(0.5)
      .setDepth(100000)
      .setAlpha(0.95);
    this.revealTooltip = tooltip;

    this.tweens.add({
      targets: tooltip,
      alpha: 0,
      y: tileSprite.container.y - 60,
      duration: 900,
      ease: "Quad.easeOut",
      onComplete: () => {
        tooltip.destroy();
        if (this.revealTooltip === tooltip) {
          this.revealTooltip = undefined;
        }
      },
    });
  }

  private syncFromStore() {
    const state = useGameStore.getState();
    if (!state.solverContext) return;
    const context = state.solverContext;

    this.boardRenderer?.updateRevealed(state.revealed);
    this.boardRenderer?.updateLegalHighlights(state.legalCells, state.barrierMap, state.turn);

    state.tiles.forEach((_, index) => {
      if (!state.present[index]) return;
      if (this.tiles.has(index)) return;
      this.createTileSprite(index);
    });

    this.tiles.forEach((tileSprite, index) => {
      if (!state.present[index]) return;
      const isFree = isFreeTile(index, state.present, context.adjacency);
      const isPending = state.pendingPairTile === index;
      const isHint = state.hintTile === index;
      tileSprite.setHighlight(isPending ? "pending" : isHint ? "hint" : isFree ? "free" : "locked");
      tileSprite.setNumberVisible(this.settings.tileNumbersVisible);
      tileSprite.container.setAlpha(1); // Do not let tiles become translucent!
    });
  }

  private handleBoardClick(pointer: Phaser.Input.Pointer) {
    const state = useGameStore.getState();
    if (!state.selectedToken) return;
    const col = Math.floor((pointer.x - this.layout.gridOriginX) / this.layout.cellSize);
    const row = Math.floor((pointer.y - this.layout.gridOriginY) / this.layout.cellSize);
    if (row < 0 || row > 8 || col < 0 || col > 8) return;
    const result = useGameStore.getState().placeSelectedToken(row, col);
    if (!result.ok && result.conflicts && this.boardRenderer) {
      this.boardRenderer.showConflicts(result.conflicts);
    }
  }

  applySettings(next: Settings) {
    this.settings = next;
    if (!this.sys.isActive()) return;
    this.tiles.forEach((tileSprite) => {
      tileSprite.setNumberVisible(next.tileNumbersVisible);
      tileSprite.setFontSize(next.largeText ? "36px" : "30px");
      tileSprite.setTextColor(next.highContrast ? "#0f172a" : "#475569");
    });
    this.boardRenderer?.updateSettings(next);
    this.gridLabel?.setColor(next.highContrast ? "#0f172a" : "#64748b");
  }

  private getAnimDuration(base: number) {
    const intensity = this.settings.animationIntensity;
    if (intensity <= 0) return 0;
    return Math.max(0, Math.round(base * intensity));
  }
}
