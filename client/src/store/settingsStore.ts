import { create } from "zustand";
import {
  getSettings,
  resetSettings as resetStoredSettings,
  updateSettings as updateStoredSettings,
  type Settings,
} from "@/game/state/storage";

interface SettingsState {
  settings: Settings;
  updateSettings: (patch: Partial<Settings>) => Settings;
  resetSettings: () => Settings;
  reloadSettings: () => Settings;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  settings: getSettings(),
  updateSettings: (patch) => {
    const updated = updateStoredSettings(patch);
    set({ settings: updated });
    return updated;
  },
  resetSettings: () => {
    const updated = resetStoredSettings();
    set({ settings: updated });
    return updated;
  },
  reloadSettings: () => {
    const updated = getSettings();
    set({ settings: updated });
    return updated;
  },
}));
