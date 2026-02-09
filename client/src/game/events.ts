import Phaser from "phaser";

export const gameEvents = new Phaser.Events.EventEmitter();

export const GameEvent = {
  BootComplete: "boot-complete",
} as const;
