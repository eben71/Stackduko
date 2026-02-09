import Phaser from "phaser";

export class DifficultyScene extends Phaser.Scene {
  constructor() {
    super("DifficultyScene");
  }

  create() {
    this.cameras.main.setBackgroundColor(0xf1f5f9);
  }
}
