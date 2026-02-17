import { create } from "zustand";
import { getProgress, resetProgress, updateProgress, type Progress } from "@/game/state/storage";

type ProgressStore = {
  progress: Progress;
  refresh: () => Progress;
  patch: (input: Parameters<typeof updateProgress>[0]) => Progress;
  reset: () => Progress;
};

export const useProgressStore = create<ProgressStore>((set) => ({
  progress: getProgress(),
  refresh: () => {
    const progress = getProgress();
    set({ progress });
    return progress;
  },
  patch: (input) => {
    const progress = updateProgress(input);
    set({ progress });
    return progress;
  },
  reset: () => {
    const progress = resetProgress();
    set({ progress });
    return progress;
  },
}));
