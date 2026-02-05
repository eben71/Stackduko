import Phaser from "phaser";
import { gameEvents, GameEvent } from "@/game/events";

export class BootScene extends Phaser.Scene {
  constructor() {
    super("BootScene");
  }

  create() {
    const tileSize = 60;
    const tileHeight = 14;

    const graphics = this.make.graphics({ x: 0, y: 0 });

    graphics.fillStyle(0xffffff);
    graphics.fillRoundedRect(0, 0, tileSize, tileSize, 10);
    graphics.lineStyle(2, 0xe2e8f0, 1);
    graphics.strokeRoundedRect(0, 0, tileSize, tileSize, 10);
    graphics.generateTexture("tile-top", tileSize, tileSize);

    graphics.clear();
    graphics.fillStyle(0x94a3b8);
    graphics.fillRect(0, 0, tileHeight, tileSize);
    graphics.generateTexture("tile-side", tileHeight, tileSize);

    graphics.clear();
    graphics.fillStyle(0x000000, 0.2);
    graphics.fillEllipse(tileSize / 2, tileSize / 2, tileSize + 18, tileSize / 2);
    graphics.generateTexture("tile-shadow", tileSize + 20, tileSize);

    gameEvents.emit(GameEvent.BootComplete);
    this.scene.start("MenuScene");
  }
}
