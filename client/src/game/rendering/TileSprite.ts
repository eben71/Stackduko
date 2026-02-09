import Phaser from "phaser";
import { type TileSpec } from "@/logic/stack/types";
import { type Settings } from "@/game/state/storage";

type HighlightMode = "none" | "free" | "hint";

export class TileSprite {
  container: Phaser.GameObjects.Container;
  private label: Phaser.GameObjects.Text;
  private base: Phaser.GameObjects.Image;
  private hintTween?: Phaser.Tweens.Tween;
  readonly index: number;
  readonly tile: TileSpec;

  constructor(
    scene: Phaser.Scene,
    index: number,
    tile: TileSpec,
    position: { x: number; y: number },
    settings: Settings,
  ) {
    this.index = index;
    this.tile = tile;

    const shadow = scene.add.image(8, 10, "tile-shadow").setOrigin(0.5);
    shadow.setAlpha(0.2);

    this.base = scene.add.image(0, 0, "tile-top").setOrigin(0.5);

    this.label = scene.add
      .text(0, 0, settings.tileNumbersVisible ? String(tile.value) : "", {
        fontFamily: "Fredoka, sans-serif",
        fontSize: settings.largeText ? "36px" : "30px",
        color: settings.highContrast ? "#0f172a" : "#475569",
      })
      .setOrigin(0.5);

    this.container = scene.add.container(position.x, position.y, [shadow, this.base, this.label]);
    this.container.setData("tileIndex", index);
  }

  setNumberVisible(visible: boolean) {
    this.label.setText(visible ? String(this.tile.value) : "");
  }

  setFontSize(size: string) {
    this.label.setFontSize(size);
  }

  setTextColor(color: string) {
    this.label.setColor(color);
  }

  setHighlight(mode: HighlightMode) {
    this.base.clearTint();
    this.hintTween?.stop();
    this.hintTween = undefined;

    if (mode === "free") {
      this.base.setTint(0xc7d2fe);
    } else if (mode === "hint") {
      this.base.setTint(0xfde68a);
      this.hintTween = this.base.scene.tweens.add({
        targets: this.container,
        scale: 1.05,
        duration: 420,
        yoyo: true,
        repeat: -1,
      });
    }
  }

  setInteractive(onClick: () => void, onHover?: (hovered: boolean) => void) {
    const hitArea = new Phaser.Geom.Rectangle(-30, -30, 60, 60);
    this.container.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains);
    this.container.on("pointerdown", onClick);
    if (onHover) {
      this.container.on("pointerover", () => onHover(true));
      this.container.on("pointerout", () => onHover(false));
    }
  }

  shake(duration: number) {
    if (duration <= 0) return;
    this.base.scene.tweens.add({
      targets: this.container,
      x: this.container.x + 6,
      duration,
      yoyo: true,
      repeat: 3,
    });
  }

  remove(duration: number, onComplete: () => void) {
    if (duration <= 0) {
      this.container.destroy();
      onComplete();
      return;
    }
    this.base.scene.tweens.add({
      targets: this.container,
      scaleX: 0,
      scaleY: 0,
      alpha: 0,
      duration,
      ease: "Back.in",
      onComplete: () => {
        this.container.destroy();
        onComplete();
      },
    });
  }
}
