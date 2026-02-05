import React, { useEffect, useRef } from "react";
import Phaser from "phaser";
import { BootScene } from "@/game/scenes/BootScene";
import { MenuScene } from "@/game/scenes/MenuScene";
import { DifficultyScene } from "@/game/scenes/DifficultyScene";
import { TutorialScene } from "@/game/scenes/TutorialScene";
import { GameScene } from "@/game/scenes/GameScene";
import { gameEvents, GameEvent } from "@/game/events";
import { useGameStore, type GamePhase } from "@/store/gameStore";
import { useSettingsStore } from "@/store/settingsStore";

export const StackdokuGame: React.FC = () => {
  const gameRef = useRef<HTMLDivElement>(null);
  const phaserGameRef = useRef<Phaser.Game | null>(null);
  const phase = useGameStore((state) => state.phase as GamePhase);
  const seed = useGameStore((state) => state.seed);
  const pausedFrom = useGameStore((state) => state.pausedFrom);
  const settings = useSettingsStore((state) => state.settings);
  const lastSeedRef = useRef<number | null>(null);

  useEffect(() => {
    if (!gameRef.current) return;

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      parent: gameRef.current,
      width: "100%",
      height: "100%",
      transparent: true,
      scene: [BootScene, MenuScene, DifficultyScene, TutorialScene, GameScene],
      scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
    };

    phaserGameRef.current = new Phaser.Game(config);

    const handleBoot = () => {
      const store = useGameStore.getState();
      if (store.phase === "boot") {
        store.setPhase("menu");
      }
    };

    gameEvents.on(GameEvent.BootComplete, handleBoot);

    return () => {
      gameEvents.off(GameEvent.BootComplete, handleBoot);
      phaserGameRef.current?.destroy(true);
    };
  }, []);

  useEffect(() => {
    const game = phaserGameRef.current;
    if (!game) return;

    const phaseValue: GamePhase = phase;

    if (phaseValue === "menu" || phaseValue === "difficulty") {
      game.scene.stop("GameScene");
    }
    if (phaseValue !== "tutorial") {
      game.scene.stop("TutorialScene");
    }

    if (phaseValue === "menu") {
      game.scene.start("MenuScene");
      return;
    }

    if (phaseValue === "difficulty") {
      game.scene.start("DifficultyScene");
      return;
    }

    if (phaseValue === "tutorial") {
      game.scene.stop("TutorialScene");
      game.scene.start("TutorialScene");
      return;
    }

    if (
      phaseValue === "playing" ||
      (phaseValue === "paused" && pausedFrom !== "tutorial") ||
      phaseValue === "win" ||
      phaseValue === "stuck"
    ) {
      const shouldRestart = seed !== null && seed !== lastSeedRef.current;
      if (!game.scene.isActive("GameScene") || shouldRestart) {
        game.scene.stop("GameScene");
        game.scene.start("GameScene");
        lastSeedRef.current = seed ?? null;
      }
      if (phaseValue === "paused") {
        game.scene.pause(pausedFrom === "tutorial" ? "TutorialScene" : "GameScene");
      } else {
        game.scene.resume("GameScene");
      }
    }
  }, [phase, seed, pausedFrom]);

  useEffect(() => {
    const game = phaserGameRef.current;
    if (!game) return;
    const gameScene = game.scene.getScene("GameScene") as GameScene;
    const tutorialScene = game.scene.getScene("TutorialScene") as GameScene;
    if (gameScene && typeof gameScene.applySettings === "function") {
      gameScene.applySettings(settings);
    }
    if (tutorialScene && typeof tutorialScene.applySettings === "function") {
      tutorialScene.applySettings(settings);
    }
  }, [settings]);

  return <div ref={gameRef} id="game-container" />;
};
