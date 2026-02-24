export type Difficulty = "easy" | "medium" | "hard" | "infinite";

export type Settings = {
  version: 1;
  defaultDifficulty: Difficulty;
  tileNumbersVisible: boolean;
  hintsPerLevel: number;
  undoLimit: number | null;
  animationIntensity: number;
  tutorialTips: boolean;
  sfxEnabled: boolean;
  musicEnabled: boolean;
  volume: number;
  highContrast: boolean;
  largeText: boolean;
};

export type Progress = {
  version: 1;
  tutorialCompleted: boolean;
  highestLevelUnlocked: Record<Difficulty, number>;
  bestTimesMs: Record<string, number>;
  bestMoves: Record<string, number>;
  totalWins: number;
  totalPlays: number;
  lastPlayedAt: string | null;
  lastDifficultyPlayed: Difficulty;
  lastSeedPlayed: number | null;
};

const SETTINGS_KEY = "stackdoku.settings.v1";
const PROGRESS_KEY = "stackdoku.progress.v1";

const DEFAULT_SETTINGS: Settings = {
  version: 1,
  defaultDifficulty: "medium",
  tileNumbersVisible: false,
  hintsPerLevel: 3,
  undoLimit: null,
  animationIntensity: 0.7,
  tutorialTips: true,
  sfxEnabled: true,
  musicEnabled: false,
  volume: 0.8,
  highContrast: false,
  largeText: false,
};

const DEFAULT_PROGRESS: Progress = {
  version: 1,
  tutorialCompleted: false,
  highestLevelUnlocked: {
    easy: 1,
    medium: 1,
    hard: 1,
    infinite: 1,
  },
  bestTimesMs: {},
  bestMoves: {},
  totalWins: 0,
  totalPlays: 0,
  lastPlayedAt: null,
  lastDifficultyPlayed: "medium",
  lastSeedPlayed: null,
};

let memoryStorage: Storage | null = null;

function getStorage(): Storage {
  if (typeof window !== "undefined" && window.localStorage) {
    return window.localStorage;
  }
  if (
    typeof globalThis !== "undefined" &&
    (globalThis as { localStorage?: Storage }).localStorage
  ) {
    return (globalThis as { localStorage?: Storage }).localStorage as Storage;
  }

  if (!memoryStorage) {
    const memory = new Map<string, string>();
    memoryStorage = {
      getItem: (key: string) => (memory.has(key) ? memory.get(key)! : null),
      setItem: (key: string, value: string) => {
        memory.set(key, value);
      },
      removeItem: (key: string) => {
        memory.delete(key);
      },
      clear: () => {
        memory.clear();
      },
      key: (index: number) => Array.from(memory.keys())[index] ?? null,
      get length() {
        return memory.size;
      },
    } as Storage;
  }
  return memoryStorage;
}

function safeParse(raw: string | null): unknown {
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function clamp(num: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, num));
}

function isDifficulty(value: unknown): value is Difficulty {
  return value === "easy" || value === "medium" || value === "hard" || value === "infinite";
}

function defaultTileVisibilityForDifficulty(difficulty: Difficulty): boolean {
  return difficulty === "easy";
}

function normalizeSettings(input: unknown): Settings {
  const candidate = (input ?? {}) as Partial<Settings>;

  const defaultDifficulty = isDifficulty(candidate.defaultDifficulty)
    ? candidate.defaultDifficulty
    : DEFAULT_SETTINGS.defaultDifficulty;

  const tileNumbersVisible =
    typeof candidate.tileNumbersVisible === "boolean"
      ? candidate.tileNumbersVisible
      : DEFAULT_SETTINGS.tileNumbersVisible;

  const hintsPerLevel =
    typeof candidate.hintsPerLevel === "number"
      ? clamp(Math.round(candidate.hintsPerLevel), 0, 10)
      : DEFAULT_SETTINGS.hintsPerLevel;

  const undoLimit =
    candidate.undoLimit === null
      ? null
      : typeof candidate.undoLimit === "number"
        ? clamp(Math.round(candidate.undoLimit), 0, 50)
        : DEFAULT_SETTINGS.undoLimit;

  const animationIntensity =
    typeof candidate.animationIntensity === "number"
      ? clamp(candidate.animationIntensity, 0, 1)
      : DEFAULT_SETTINGS.animationIntensity;

  const tutorialTips =
    typeof candidate.tutorialTips === "boolean"
      ? candidate.tutorialTips
      : DEFAULT_SETTINGS.tutorialTips;

  const sfxEnabled =
    typeof candidate.sfxEnabled === "boolean" ? candidate.sfxEnabled : DEFAULT_SETTINGS.sfxEnabled;

  const musicEnabled =
    typeof candidate.musicEnabled === "boolean"
      ? candidate.musicEnabled
      : DEFAULT_SETTINGS.musicEnabled;

  const volume =
    typeof candidate.volume === "number" ? clamp(candidate.volume, 0, 1) : DEFAULT_SETTINGS.volume;

  const highContrast =
    typeof candidate.highContrast === "boolean"
      ? candidate.highContrast
      : DEFAULT_SETTINGS.highContrast;

  const largeText =
    typeof candidate.largeText === "boolean" ? candidate.largeText : DEFAULT_SETTINGS.largeText;

  return {
    version: 1,
    defaultDifficulty,
    tileNumbersVisible,
    hintsPerLevel,
    undoLimit,
    animationIntensity,
    tutorialTips,
    sfxEnabled,
    musicEnabled,
    volume,
    highContrast,
    largeText,
  };
}

function normalizeProgress(input: unknown): Progress {
  const candidate = (input ?? {}) as Partial<Progress>;

  const tutorialCompleted =
    typeof candidate.tutorialCompleted === "boolean"
      ? candidate.tutorialCompleted
      : DEFAULT_PROGRESS.tutorialCompleted;

  const highestLevelUnlocked = normalizeHighestLevelUnlocked(candidate.highestLevelUnlocked);

  const bestTimesMs =
    candidate.bestTimesMs && typeof candidate.bestTimesMs === "object"
      ? sanitizeRecord(candidate.bestTimesMs as Record<string, unknown>)
      : { ...DEFAULT_PROGRESS.bestTimesMs };

  const bestMoves =
    candidate.bestMoves && typeof candidate.bestMoves === "object"
      ? sanitizeRecord(candidate.bestMoves as Record<string, unknown>)
      : { ...DEFAULT_PROGRESS.bestMoves };

  const totalWins =
    typeof candidate.totalWins === "number"
      ? Math.max(0, Math.round(candidate.totalWins))
      : DEFAULT_PROGRESS.totalWins;

  const totalPlays =
    typeof candidate.totalPlays === "number"
      ? Math.max(0, Math.round(candidate.totalPlays))
      : DEFAULT_PROGRESS.totalPlays;

  const lastPlayedAt =
    typeof candidate.lastPlayedAt === "string" && !Number.isNaN(Date.parse(candidate.lastPlayedAt))
      ? candidate.lastPlayedAt
      : DEFAULT_PROGRESS.lastPlayedAt;

  const lastDifficultyPlayed = isDifficulty(candidate.lastDifficultyPlayed)
    ? candidate.lastDifficultyPlayed
    : DEFAULT_PROGRESS.lastDifficultyPlayed;

  const lastSeedPlayed =
    typeof candidate.lastSeedPlayed === "number" && Number.isFinite(candidate.lastSeedPlayed)
      ? Math.round(candidate.lastSeedPlayed)
      : DEFAULT_PROGRESS.lastSeedPlayed;

  return {
    version: 1,
    tutorialCompleted,
    highestLevelUnlocked,
    bestTimesMs,
    bestMoves,
    totalWins,
    totalPlays,
    lastPlayedAt,
    lastDifficultyPlayed,
    lastSeedPlayed,
  };
}

function sanitizeRecord(record: Record<string, unknown>): Record<string, number> {
  const result: Record<string, number> = {};
  Object.entries(record).forEach(([key, value]) => {
    if (typeof value === "number" && Number.isFinite(value) && value >= 0) {
      result[key] = Math.round(value);
    }
  });
  return result;
}

function saveSettings(settings: Settings) {
  getStorage().setItem(SETTINGS_KEY, JSON.stringify(settings));
}

function saveProgress(progress: Progress) {
  getStorage().setItem(PROGRESS_KEY, JSON.stringify(progress));
}

export function getSettings(): Settings {
  const stored = safeParse(getStorage().getItem(SETTINGS_KEY));
  const normalized = normalizeSettings(stored ?? DEFAULT_SETTINGS);
  saveSettings(normalized);
  return normalized;
}

export function updateSettings(patch: Partial<Settings>): Settings {
  const current = getSettings();
  let next: Settings = {
    ...current,
    ...patch,
    version: 1,
  };

  if (patch.defaultDifficulty && patch.tileNumbersVisible === undefined) {
    const previousDefaultVisibility = defaultTileVisibilityForDifficulty(current.defaultDifficulty);
    if (current.tileNumbersVisible === previousDefaultVisibility) {
      next.tileNumbersVisible = defaultTileVisibilityForDifficulty(patch.defaultDifficulty);
    }
  }

  next = normalizeSettings(next);
  saveSettings(next);
  return next;
}

export function resetSettings(): Settings {
  saveSettings(DEFAULT_SETTINGS);
  return { ...DEFAULT_SETTINGS };
}

export function getProgress(): Progress {
  const stored = safeParse(getStorage().getItem(PROGRESS_KEY));
  const normalized = normalizeProgress(stored ?? DEFAULT_PROGRESS);
  saveProgress(normalized);
  return normalized;
}

export function updateProgress(patch: Partial<Progress>): Progress {
  const current = getProgress();
  const next: Progress = normalizeProgress({
    ...current,
    ...patch,
    highestLevelUnlocked: {
      ...current.highestLevelUnlocked,
      ...(patch.highestLevelUnlocked ?? {}),
    },
    bestTimesMs: {
      ...current.bestTimesMs,
      ...(patch.bestTimesMs ?? {}),
    },
    bestMoves: {
      ...current.bestMoves,
      ...(patch.bestMoves ?? {}),
    },
  });

  saveProgress(next);
  return next;
}

export function resetProgress(): Progress {
  saveProgress(DEFAULT_PROGRESS);
  return { ...DEFAULT_PROGRESS };
}

export function getDefaultTileVisibilityForDifficulty(difficulty: Difficulty): boolean {
  return defaultTileVisibilityForDifficulty(difficulty);
}

export const SETTINGS_STORAGE_KEY = SETTINGS_KEY;
export const PROGRESS_STORAGE_KEY = PROGRESS_KEY;
export const SETTINGS_DEFAULTS = DEFAULT_SETTINGS;
export const PROGRESS_DEFAULTS = DEFAULT_PROGRESS;

function normalizeHighestLevelUnlocked(value: unknown): Record<Difficulty, number> {
  if (typeof value === "number") {
    const level = Math.max(1, Math.round(value));
    return { easy: level, medium: level, hard: level };
  }
  if (value && typeof value === "object") {
    const candidate = value as Partial<Record<Difficulty, unknown>>;
    return {
      easy: typeof candidate.easy === "number" ? Math.max(1, Math.round(candidate.easy)) : 1,
      medium: typeof candidate.medium === "number" ? Math.max(1, Math.round(candidate.medium)) : 1,
      hard: typeof candidate.hard === "number" ? Math.max(1, Math.round(candidate.hard)) : 1,
      infinite: typeof candidate.infinite === "number" ? Math.max(1, Math.round(candidate.infinite)) : 1,
    };
  }
  return { ...DEFAULT_PROGRESS.highestLevelUnlocked };
}
