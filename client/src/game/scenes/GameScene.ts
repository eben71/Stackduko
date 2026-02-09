import Phaser from "phaser";
import { getSettings, type Settings } from "@/game/state/storage";
import { BoardRenderer } from "@/game/rendering/BoardRenderer";
import { TileSprite } from "@/game/rendering/TileSprite";
import { useGameStore } from "@/store/gameStore";
import { isTileFree } from "@/logic/solver/solver";

const TILE_SIZE = 60;
const ISO_OFFSET_X = -6;
const ISO_OFFSET_Y = 10;

export class GameScene extends Phaser.Scene {
  private tiles: Map<number, TileSprite> = new Map();
  private boardRenderer?: BoardRenderer;
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
    const stackOriginX = (width - stackWidth) / 2;
    const stackOriginY = Math.max(30, gridOriginY - stackHeight - 30);

    const previousCellSize = this.layout.cellSize;
    this.layout = {
      stackOriginX,
      stackOriginY,
      gridOriginX,
      gridOriginY,
      cellSize: gridCellSize,
      minX,
      minY,
    };

    if (this.boardRenderer && previousCellSize !== gridCellSize) {
      this.boardRenderer.destroy();
      this.boardRenderer = undefined;
    }

    if (this.boardRenderer) {
      this.boardRenderer.updateOrigin({ x: gridOriginX, y: gridOriginY });
      this.boardRenderer.updateSettings(this.settings);
    }

    this.tiles.forEach((tileSprite) => {
      const position = this.computeTilePosition(tileSprite.tile);
      tileSprite.container.setPosition(position.x, position.y);
      tileSprite.container.setDepth(tileSprite.tile.z * 1000 + position.y);
    });
  }

  private computeTilePosition(tile: { x: number; y: number; z: number }) {
    return {
      x:
        this.layout.stackOriginX +
        (tile.x - this.layout.minX) * TILE_SIZE +
        TILE_SIZE / 2 +
        tile.z * ISO_OFFSET_X,
      y:
        this.layout.stackOriginY +
        (tile.y - this.layout.minY) * TILE_SIZE +
        TILE_SIZE / 2 -
        tile.z * ISO_OFFSET_Y,
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
    sprite.container.setDepth(tile.z * 1000 + position.y);
    sprite.setInteractive(() => this.handleTileClick(index));
    this.tiles.set(index, sprite);
  }

  private createBoard() {
    this.boardRenderer?.updateSettings(this.settings);
    if (!this.boardRenderer) {
      this.boardRenderer = new BoardRenderer(
        this,
        { x: this.layout.gridOriginX, y: this.layout.gridOriginY },
        this.layout.cellSize,
        this.settings,
      );
    }
  }

  private handleTileClick(index: number) {
    const result = useGameStore.getState().attemptRemoveTile(index);
    const tileSprite = this.tiles.get(index);
    if (!tileSprite) return;

    if (!result.ok) {
      const duration = this.getAnimDuration(80);
      tileSprite.shake(duration);
      if (result.conflicts && this.boardRenderer) {
        this.boardRenderer.showConflicts(result.conflicts);
      }
      return;
    }

    const duration = this.getAnimDuration(280);
    tileSprite.remove(duration, () => {
      this.tiles.delete(index);
      this.syncFromStore();
    });
  }

  private syncFromStore() {
    const state = useGameStore.getState();
    if (!state.solverContext) return;
    const context = state.solverContext;

    this.boardRenderer?.updateRevealed(state.revealed);

    state.tiles.forEach((_, index) => {
      if (!state.present[index]) return;
      if (this.tiles.has(index)) return;
      this.createTileSprite(index);
    });

    this.tiles.forEach((tileSprite, index) => {
      if (!state.present[index]) return;
      const isFree = isTileFree(context, state, index);
      const isHint = state.hintTile === index;
      tileSprite.setHighlight(isHint ? "hint" : isFree ? "free" : "none");
      tileSprite.setNumberVisible(this.settings.tileNumbersVisible);
      tileSprite.container.setAlpha(isFree ? 1 : 0.6);
    });
  }

  applySettings(next: Settings) {
    this.settings = next;
    this.tiles.forEach((tileSprite) => {
      tileSprite.setNumberVisible(next.tileNumbersVisible);
      tileSprite.setFontSize(next.largeText ? "36px" : "30px");
      tileSprite.setTextColor(next.highContrast ? "#0f172a" : "#475569");
    });
    this.boardRenderer?.updateSettings(next);
  }

  private getAnimDuration(base: number) {
    const intensity = this.settings.animationIntensity;
    if (intensity <= 0) return 0;
    return Math.max(0, Math.round(base * intensity));
  }
}
