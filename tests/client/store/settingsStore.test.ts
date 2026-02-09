import { describe, expect, it } from "vitest";
import { useSettingsStore } from "../../../client/src/store/settingsStore";
import { SETTINGS_DEFAULTS } from "../../../client/src/game/state/storage";

describe("settingsStore", () => {
  it("loads defaults on first run", () => {
    const state = useSettingsStore.getState();
    expect(state.settings.defaultDifficulty).toBe(SETTINGS_DEFAULTS.defaultDifficulty);
  });

  it("updates settings and clamps values", () => {
    const updated = useSettingsStore.getState().updateSettings({
      hintsPerLevel: 99,
      undoLimit: 999,
      animationIntensity: 2,
      volume: -1,
    });

    expect(updated.hintsPerLevel).toBe(10);
    expect(updated.undoLimit).toBe(50);
    expect(updated.animationIntensity).toBe(1);
    expect(updated.volume).toBe(0);
  });

  it("resets settings to defaults", () => {
    useSettingsStore.getState().updateSettings({ sfxEnabled: false });
    const reset = useSettingsStore.getState().resetSettings();
    expect(reset.sfxEnabled).toBe(SETTINGS_DEFAULTS.sfxEnabled);
  });

  it("reloads settings from storage", () => {
    useSettingsStore.getState().updateSettings({ musicEnabled: true });
    const reloaded = useSettingsStore.getState().reloadSettings();
    expect(reloaded.musicEnabled).toBe(true);
  });
});
