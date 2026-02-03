import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { generateSudoku } from './logic/sudoku/generator';
import { useGameStore } from '@/store/gameStore';

// --- PHASER CONFIGURATION ---

const TILE_SIZE = 60;
const TILE_HEIGHT = 15;
const BOARD_OFFSET_X = 400;
const BOARD_OFFSET_Y = 150;

class MainScene extends Phaser.Scene {
  private board: number[][] = [];
  private tiles: Phaser.GameObjects.Container[] = [];
  private gridGraphics!: Phaser.GameObjects.Graphics;
  private selectedTile: Phaser.GameObjects.Container | null = null;
  
  // Store refs to react store actions to call them from Phaser
  private storeActions: any;

  constructor() {
    super('MainScene');
  }

  init(data: { storeActions: any, difficulty: string }) {
    this.storeActions = data.storeActions;
    this.board = generateSudoku(data.difficulty as any);
  }

  preload() {
    // Generate textures programmatically to avoid external asset dependencies for this demo
    const graphics = this.make.graphics({ x: 0, y: 0, add: false });
    
    // Tile Top
    graphics.fillStyle(0xffffff);
    graphics.fillRoundedRect(0, 0, TILE_SIZE, TILE_SIZE, 8);
    graphics.lineStyle(2, 0xe2e8f0, 1);
    graphics.strokeRoundedRect(0, 0, TILE_SIZE, TILE_SIZE, 8);
    graphics.generateTexture('tile-top', TILE_SIZE, TILE_SIZE);
    
    // Tile Side (Left)
    graphics.clear();
    graphics.fillStyle(0xcbd5e1);
    graphics.fillRect(0, 0, TILE_HEIGHT, TILE_SIZE);
    graphics.generateTexture('tile-side-left', TILE_HEIGHT, TILE_SIZE);

    // Tile Side (Bottom)
    graphics.clear();
    graphics.fillStyle(0x94a3b8);
    graphics.fillRect(0, 0, TILE_SIZE, TILE_HEIGHT);
    graphics.generateTexture('tile-side-bottom', TILE_SIZE, TILE_HEIGHT);

    // Shadow
    graphics.clear();
    graphics.fillStyle(0x000000, 0.2);
    graphics.fillEllipse(TILE_SIZE/2, TILE_SIZE/2, TILE_SIZE + 10, TILE_SIZE/2);
    graphics.generateTexture('shadow', TILE_SIZE + 20, TILE_SIZE);
  }

  create() {
    // 1. Draw Sudoku Grid base
    this.drawGridBase();

    // 2. Create Stack of Tiles
    // For this MVP, we will just fill the grid with "hidden" tiles.
    // In a full implementation, this would be a 3D structure.
    this.createTileStack();
    
    // 3. Camera Controls
    // Simple pan for now
    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
        if (pointer.isDown) {
            this.cameras.main.scrollX -= (pointer.x - pointer.prevPosition.x);
            this.cameras.main.scrollY -= (pointer.y - pointer.prevPosition.y);
        }
    });
  }

  drawGridBase() {
    const graphics = this.add.graphics();
    graphics.lineStyle(2, 0x334155, 0.5); // Grid lines

    // Center grid in world
    const startX = (this.scale.width - (9 * TILE_SIZE)) / 2;
    const startY = (this.scale.height - (9 * TILE_SIZE)) / 2;
    
    // Draw cells
    for(let r=0; r<=9; r++) {
        const thickness = r % 3 === 0 ? 4 : 1;
        graphics.lineStyle(thickness, 0x334155, 0.8);
        
        // Horizontal
        graphics.moveTo(startX, startY + r * TILE_SIZE);
        graphics.lineTo(startX + 9 * TILE_SIZE, startY + r * TILE_SIZE);
        
        // Vertical
        graphics.moveTo(startX + r * TILE_SIZE, startY);
        graphics.lineTo(startX + r * TILE_SIZE, startY + 9 * TILE_SIZE);
    }
    
    graphics.strokePath();

    // Draw the actual numbers on the "floor"
    for(let r=0; r<9; r++) {
        for(let c=0; c<9; c++) {
            const num = this.board[r][c];
            this.add.text(
                startX + c * TILE_SIZE + TILE_SIZE/2,
                startY + r * TILE_SIZE + TILE_SIZE/2,
                num.toString(),
                { 
                    fontFamily: 'Fredoka, sans-serif',
                    fontSize: '32px', 
                    color: '#475569' 
                }
            ).setOrigin(0.5);
        }
    }
    
    // Store grid offset for tiles
    this.data.set('gridOrigin', { x: startX, y: startY });
  }

  createTileStack() {
    const { x: gridOriginX, y: gridOriginY } = this.data.get('gridOrigin');
    
    // Generate 81 available slots in a 3D pyramid-like structure
    // We need exactly 81 slots.
    // Simple layout: 
    // Layer 0: 8x8 (64) - slightly smaller than 9x9
    // Layer 1: 4x4 (16) - centered
    // Layer 2: 1x1 (1) - peak
    // Total: 64 + 16 + 1 = 81. Perfect!
    
    const slots: {x: number, y: number, z: number}[] = [];
    
    // Layer 0 (8x8) - Centered on 9x9 grid (0.5 to 7.5)
    // We map visual coords to fit nicely over the board
    for(let r=0; r<8; r++) {
        for(let c=0; c<8; c++) {
            slots.push({ x: r + 0.5, y: c + 0.5, z: 0 });
        }
    }
    
    // Layer 1 (4x4) - Centered (2.5 to 5.5)
    for(let r=0; r<4; r++) {
        for(let c=0; c<4; c++) {
            slots.push({ x: r + 2.5, y: c + 2.5, z: 1 });
        }
    }
    
    // Layer 2 (1x1) - Centered (4, 4)
    slots.push({ x: 4, y: 4, z: 2 });
    
    // Shuffle the slots to randomise which Sudoku number goes where
    // OR shuffle the Sudoku cells. Both achieve the same.
    // Let's iterate Sudoku cells and assign to popped slots.
    
    // Get all 81 sudoku cells
    const cells: {r: number, c: number, val: number}[] = [];
    for(let r=0; r<9; r++) {
        for(let c=0; c<9; c++) {
            cells.push({ r, c, val: this.board[r][c] });
        }
    }
    
    // Shuffle cells
    for (let i = cells.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [cells[i], cells[j]] = [cells[j], cells[i]];
    }
    
    // Assign
    cells.forEach((cell, index) => {
        const slot = slots[index];
        this.createTile(cell.r, cell.c, cell.val, slot.x, slot.y, slot.z, gridOriginX, gridOriginY);
    });
    
    // Sort tiles by depth (Painter's algorithm: bottom-back first)
    // Z asc, Y asc, X asc
    this.tiles.sort((a, b) => {
        const az = a.getData('z');
        const bz = b.getData('z');
        if (az !== bz) return az - bz;
        return a.y - b.y; // Simplified depth sorting
    });
    
    // Re-add to display list in order
    this.tiles.forEach(t => {
        t.setDepth(t.getData('z') * 100 + t.y); // dynamic depth
    });
  }

  createTile(row: number, col: number, value: number, slotX: number, slotY: number, slotZ: number, startX: number, startY: number) {
    // Calculate visual position
    // grid is 9x9. slotX/Y are relative to that.
    const x = startX + slotX * TILE_SIZE + TILE_SIZE/2;
    const y = startY + slotY * TILE_SIZE + TILE_SIZE/2 - (slotZ * 15); // Lift up by Z

    const container = this.add.container(x, y);
    
    // Visuals
    const shadow = this.add.image(5 + slotZ*2, 5 + slotZ*2, 'shadow').setOrigin(0.5).setAlpha(0.3 - slotZ*0.05);
    const bg = this.add.image(0, 0, 'tile-top').setOrigin(0.5);
    
    // Add side panels for 3D effect if not at bottom (or just always for style)
    const leftSide = this.add.image(-TILE_SIZE/2 + TILE_HEIGHT/2, TILE_SIZE/2, 'tile-side-left').setOrigin(0.5, 0).setAngle(0);
    // Actually our generated textures were simple. Let's just use the top for MVP 
    // and maybe a slight offset "thick" look if we had sprites.
    // For now, simple shadow implies height.
    
    const text = this.add.text(0, 0, '?', {
        fontFamily: 'Fredoka',
        fontSize: '32px',
        color: '#64748b'
    }).setOrigin(0.5);

    // If visible mode, show number immediately (can handle via react state later)
    // For now hidden.

    container.add([shadow, bg, text]);
    
    // Data
    container.setData('row', row);
    container.setData('col', col);
    container.setData('value', value);
    container.setData('slotX', slotX);
    container.setData('slotY', slotY);
    container.setData('z', slotZ);

    // Interaction
    const shape = new Phaser.Geom.Rectangle(-TILE_SIZE/2, -TILE_SIZE/2, TILE_SIZE, TILE_SIZE);
    container.setInteractive(shape, Phaser.Geom.Rectangle.Contains);

    container.on('pointerover', () => {
        this.tweens.add({
            targets: container,
            y: y - 5,
            duration: 100
        });
        bg.setTint(0xf1f5f9);
    });

    container.on('pointerout', () => {
        this.tweens.add({
            targets: container,
            y: y,
            duration: 100
        });
        bg.clearTint();
    });

    container.on('pointerdown', () => {
        this.handleTileClick(container);
    });

    this.tiles.push(container);
  }

  handleTileClick(tile: Phaser.GameObjects.Container) {
    // GAME LOGIC: Free Tile Rule
    const tx = tile.getData('slotX');
    const ty = tile.getData('slotY');
    const tz = tile.getData('z');
    
    // 1. Check if covered by any active tile above
    const isCovered = this.tiles.some(t => {
        if (!t.active) return false;
        const ox = t.getData('slotX');
        const oy = t.getData('slotY');
        const oz = t.getData('z');
        
        // Simple overlap check: if directly above (same x,y)
        // Since we used floats for coordinates (0.5), we check for close proximity
        // But our layout is grid-aligned relative to layers.
        // Let's assume strict overlap if distance < 0.5?
        // Actually, Layer 1 (2.5) covers Layer 0 (2.5) exactly?
        // Layer 0 has 2.5 (from r=2, c=2 => 2.5, 2.5).
        // Layer 1 has 2.5 (from r=0, c=0 => 0+2.5 = 2.5).
        // Yes, they align perfectly.
        return (oz > tz) && (Math.abs(ox - tx) < 0.1) && (Math.abs(oy - ty) < 0.1);
    });
    
    if (isCovered) {
        // blocked feedback
        this.tweens.add({
            targets: tile,
            x: tile.x + 5,
            duration: 50,
            yoyo: true,
            repeat: 3
        });
        return;
    }
    
    // 2. Check open horizontal side (Left OR Right)
    // Left neighbor: same Z, same Y, X - 1
    // Right neighbor: same Z, same Y, X + 1
    const hasLeft = this.tiles.some(t => t.active && t.getData('z') === tz && Math.abs(t.getData('slotY') - ty) < 0.1 && Math.abs(t.getData('slotX') - (tx - 1)) < 0.1);
    const hasRight = this.tiles.some(t => t.active && t.getData('z') === tz && Math.abs(t.getData('slotY') - ty) < 0.1 && Math.abs(t.getData('slotX') - (tx + 1)) < 0.1);
    
    if (hasLeft && hasRight) {
        // blocked
         this.tweens.add({
            targets: tile,
            x: tile.x + 5,
            duration: 50,
            yoyo: true,
            repeat: 3
        });
        return;
    }

    // Reveal animation
    this.tweens.add({
        targets: tile,
        scaleX: 0,
        scaleY: 0,
        alpha: 0,
        duration: 300,
        ease: 'Back.in',
        onComplete: () => {
            tile.destroy(); // marks as active=false (actually destroys it, remove from list or check active property)
            // Note: destroy() removes from scene but we keep ref in this.tiles. 
            // We should filter or check .active property.
            // Phaser objects have .active = true by default. destroy() sets it false? 
            // No, destroy() removes it. We should manually flag it or remove from array.
            // Better: use active property if not fully removed, or remove from array.
            const idx = this.tiles.indexOf(tile);
            if (idx > -1) this.tiles.splice(idx, 1);
            
            // Reveal on board (optional visual effect, numbers already there)
            
            // Check win condition
            if (this.tiles.length === 0) {
                this.storeActions.endGame(true);
            } else {
                this.storeActions.addScore(100);
            }
        }
    });
  }
}

export const StackdokuGame: React.FC = () => {
  const gameRef = useRef<HTMLDivElement>(null);
  const phaserGameRef = useRef<Phaser.Game | null>(null);
  const { 
    addScore, 
    endGame, 
    difficulty 
  } = useGameStore();

  useEffect(() => {
    if (!gameRef.current) return;

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      parent: gameRef.current,
      width: '100%',
      height: '100%',
      transparent: true,
      physics: {
        default: 'arcade',
      },
      scene: MainScene,
      scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH
      }
    };

    phaserGameRef.current = new Phaser.Game(config);

    // Pass React state/actions to Phaser via registry or scene init
    phaserGameRef.current.scene.start('MainScene', { 
        storeActions: { addScore, endGame },
        difficulty
    });

    return () => {
      phaserGameRef.current?.destroy(true);
    };
  }, []); // Only run once on mount

  return <div ref={gameRef} id="game-container" />;
};
