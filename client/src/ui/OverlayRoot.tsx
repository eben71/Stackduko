import React, { useEffect, useState } from "react";
import { SettingsOverlay } from "@/ui/SettingsOverlay";
import { useGameStore } from "@/store/gameStore";
import { useSettingsStore } from "@/store/settingsStore";
import { getProgress } from "@/game/state/storage";

const DIFFICULTY_LABELS: Record<string, string> = {
  easy: "Easy",
  medium: "Medium",
  hard: "Hard",
};

type SettingsOrigin = "menu" | "pause";
type GameSnapshot = ReturnType<typeof useGameStore.getState>;

export function OverlayRoot() {
  const phase = useGameStore((state) => state.phase);
  const settings = useSettingsStore((state) => state.settings);
  const {
    startGame,
    startTutorial,
    finishTutorial,
    pauseGame,
    resumeGame,
    restartLevel,
    quitToMenu,
    incrementTime,
    useHint: hintAction,
    undoMove,
    clearMessage,
  } = useGameStore();

  const gameState = useGameStore();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsOrigin, setSettingsOrigin] = useState<SettingsOrigin>("menu");
  const [selectedDifficulty, setSelectedDifficulty] = useState(settings.defaultDifficulty);
  const [progressTick, setProgressTick] = useState(0);
  const [progress, setProgress] = useState(() => getProgress());

  useEffect(() => {
    setSelectedDifficulty(settings.defaultDifficulty);
  }, [settings.defaultDifficulty]);

  useEffect(() => {
    setProgress(getProgress());
  }, [progressTick, phase]);
  useEffect(() => {
    if (phase !== "playing" && phase !== "tutorial") return;
    const interval = setInterval(() => {
      if (
        useGameStore.getState().phase === "playing" ||
        useGameStore.getState().phase === "tutorial"
      ) {
        incrementTime();
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [phase, incrementTime]);

  useEffect(() => {
    if (!gameState.lastMessage) return;
    const timeout = setTimeout(() => {
      clearMessage();
    }, 1500);
    return () => clearTimeout(timeout);
  }, [gameState.lastMessage, clearMessage]);

  const openSettings = (origin: SettingsOrigin) => {
    setSettingsOrigin(origin);
    setSettingsOpen(true);
  };

  const closeSettings = () => {
    setSettingsOpen(false);
    if (settingsOrigin === "pause") {
      resumeGame();
    }
  };

  const handleContinue = () => {
    const difficulty = progress.lastDifficultyPlayed;
    const level = progress.highestLevelUnlocked[difficulty];
    const seed = progress.lastSeedPlayed ?? Date.now();
    startGame(difficulty, level, seed);
  };

  const canContinue = Boolean(progress.lastSeedPlayed);

  return (
    <div className="overlay-root">
      {phase === "boot" && <BootScreen />}

      {phase === "menu" && (
        <MainMenu
          canContinue={canContinue}
          onContinue={handleContinue}
          onPlay={() => useGameStore.getState().setPhase("difficulty")}
          onTutorial={() => startTutorial()}
          onOptions={() => openSettings("menu")}
          onQuit={() => {
            window.open("", "_self");
            window.close();
            setTimeout(() => {
              if (!window.closed) {
                window.alert(
                  "Your browser blocked closing this tab. Please close it manually (Ctrl+W / Cmd+W).",
                );
              }
            }, 150);
          }}
        />
      )}

      {phase === "difficulty" && (
        <DifficultySelect
          selected={selectedDifficulty}
          onSelect={setSelectedDifficulty}
          onStart={() => startGame(selectedDifficulty)}
          onBack={() => useGameStore.getState().setPhase("menu")}
          onOptions={() => openSettings("menu")}
        />
      )}

      {(phase === "playing" ||
        phase === "paused" ||
        phase === "win" ||
        phase === "stuck" ||
        phase === "tutorial") && (
        <Hud
          state={gameState}
          onPause={pauseGame}
          onHint={() => {
            hintAction();
          }}
          onUndo={() => {
            undoMove();
          }}
          onRestart={restartLevel}
        />
      )}

      {phase === "paused" && (
        <PauseMenu
          onResume={resumeGame}
          onOptions={() => openSettings("pause")}
          onRestart={restartLevel}
          onQuit={quitToMenu}
        />
      )}

      {phase === "win" && (
        <WinModal
          state={gameState}
          onNext={() => startGame(gameState.difficulty, gameState.levelNumber + 1)}
          onReplay={() =>
            startGame(gameState.difficulty, gameState.levelNumber, gameState.seed ?? Date.now())
          }
          onQuit={quitToMenu}
        />
      )}

      {phase === "stuck" && (
        <StuckModal
          state={gameState}
          onUndo={() => undoMove()}
          onHint={() => hintAction()}
          onRestart={restartLevel}
          onQuit={quitToMenu}
        />
      )}

      {phase === "tutorial" && <TutorialOverlay state={gameState} onFinish={finishTutorial} />}

      {gameState.lastMessage && settings.tutorialTips && (
        <div className="overlay-toast" role="status">
          {gameState.lastMessage}
        </div>
      )}

      <SettingsOverlay
        open={settingsOpen}
        onClose={closeSettings}
        onProgressReset={() => setProgressTick((value) => value + 1)}
      />
    </div>
  );
}

function BootScreen() {
  return (
    <div className="overlay-screen overlay-boot">
      <div className="boot-card">
        <div className="boot-logo">Stackdoku</div>
        <div className="boot-subtitle">Reveal and Resolve</div>
        <div className="boot-bar">
          <div className="boot-bar-fill" />
        </div>
      </div>
    </div>
  );
}

function MainMenu({
  canContinue,
  onContinue,
  onPlay,
  onTutorial,
  onOptions,
  onQuit,
}: {
  canContinue: boolean;
  onContinue: () => void;
  onPlay: () => void;
  onTutorial: () => void;
  onOptions: () => void;
  onQuit: () => void;
}) {
  return (
    <div className="overlay-screen menu-screen">
      <div className="menu-card">
        <div className="menu-title">Stackdoku</div>
        <div className="menu-subtitle">Reveal the numbers. Resolve the Sudoku.</div>
        <div className="menu-actions">
          {canContinue && (
            <button className="menu-primary" onClick={onContinue}>
              Continue
            </button>
          )}
          <button className="menu-primary" onClick={onPlay}>
            Play
          </button>
          <button className="menu-secondary" onClick={onTutorial}>
            Tutorial
          </button>
          <button className="menu-secondary" onClick={onOptions}>
            Options
          </button>
          <button className="menu-secondary" onClick={onQuit}>
            Quit
          </button>
        </div>
      </div>
    </div>
  );
}

function DifficultySelect({
  selected,
  onSelect,
  onStart,
  onBack,
  onOptions,
}: {
  selected: string;
  onSelect: (difficulty: "easy" | "medium" | "hard") => void;
  onStart: () => void;
  onBack: () => void;
  onOptions: () => void;
}) {
  return (
    <div className="overlay-screen menu-screen">
      <div className="menu-card">
        <div className="menu-title">Select Difficulty</div>
        <div className="difficulty-grid">
          {(["easy", "medium", "hard"] as const).map((difficulty) => (
            <button
              key={difficulty}
              className={`difficulty-card ${selected === difficulty ? "active" : ""}`}
              onClick={() => onSelect(difficulty)}
            >
              <div className="difficulty-label">{DIFFICULTY_LABELS[difficulty]}</div>
              <div className="difficulty-desc">
                {difficulty === "easy" && "More free tiles and visible numbers."}
                {difficulty === "medium" && "Balanced layouts and hidden tiles."}
                {difficulty === "hard" && "Denser stacks and fewer freebies."}
              </div>
            </button>
          ))}
        </div>
        <div className="menu-actions">
          <button className="menu-primary" onClick={onStart}>
            Start
          </button>
          <button className="menu-secondary" onClick={onOptions}>
            Options
          </button>
          <button className="menu-secondary" onClick={onBack}>
            Back
          </button>
        </div>
      </div>
    </div>
  );
}

function Hud({
  state,
  onPause,
  onHint,
  onUndo,
  onRestart,
}: {
  state: GameSnapshot;
  onPause: () => void;
  onHint: () => void;
  onUndo: () => void;
  onRestart: () => void;
}) {
  const undoDisabled =
    state.tray.length === 0 || (state.undoRemaining !== null && state.undoRemaining <= 0);
  const hintDisabled = state.hintsRemaining <= 0;
  const showPause = state.phase === "playing" || state.phase === "tutorial";
  return (
    <div className="hud-root">
      <div className="hud-top">
        <div className="hud-card">
          <div className="hud-label">Level</div>
          <div className="hud-value">{state.levelNumber}</div>
        </div>
        <div className="hud-card">
          <div className="hud-label">Difficulty</div>
          <div className="hud-value">{DIFFICULTY_LABELS[state.difficulty]}</div>
        </div>
        <div className="hud-card">
          <div className="hud-label">Hints</div>
          <div className="hud-value">{state.hintsRemaining}</div>
        </div>
        <div className="hud-card">
          <div className="hud-label">Time</div>
          <div className="hud-value">
            {Math.floor(state.timeSeconds / 60)}:
            {(state.timeSeconds % 60).toString().padStart(2, "0")}
          </div>
        </div>
        {showPause && (
          <button className="hud-pause" onClick={onPause}>
            Pause
          </button>
        )}
      </div>

      <div className="hud-bottom">
        <div className="tray">
          <div className="tray-label">Tray</div>
          <div className="tray-items">
            {state.tray.length === 0 && <div className="tray-empty">No tiles removed yet.</div>}
            {state.tray.map((index, idx) => (
              <div key={`${index}-${idx}`} className="tray-tile">
                {state.tiles[index]?.value ?? ""}
              </div>
            ))}
          </div>
        </div>
        <div className="hud-actions">
          <button className="hud-action" onClick={onUndo} disabled={undoDisabled}>
            Undo
          </button>
          <button className="hud-action" onClick={onHint} disabled={hintDisabled}>
            Hint
          </button>
          <button className="hud-action" onClick={onRestart}>
            Restart
          </button>
        </div>
      </div>
    </div>
  );
}

function PauseMenu({
  onResume,
  onOptions,
  onRestart,
  onQuit,
}: {
  onResume: () => void;
  onOptions: () => void;
  onRestart: () => void;
  onQuit: () => void;
}) {
  return (
    <div className="overlay-modal">
      <div className="modal-card">
        <div className="modal-title">Paused</div>
        <div className="modal-actions">
          <button className="menu-primary" onClick={onResume}>
            Resume
          </button>
          <button className="menu-secondary" onClick={onOptions}>
            Options
          </button>
          <button className="menu-secondary" onClick={onRestart}>
            Restart
          </button>
          <button className="menu-secondary" onClick={onQuit}>
            Quit
          </button>
        </div>
      </div>
    </div>
  );
}

function WinModal({
  state,
  onNext,
  onReplay,
  onQuit,
}: {
  state: GameSnapshot;
  onNext: () => void;
  onReplay: () => void;
  onQuit: () => void;
}) {
  return (
    <div className="overlay-modal">
      <div className="modal-card">
        <div className="modal-title">Level Complete</div>
        <div className="modal-stats">
          <div>Time: {state.timeSeconds}s</div>
          <div>Moves: {state.moves}</div>
          <div>Undos used: {state.undosUsed}</div>
          <div>Hints used: {state.hintsUsed}</div>
        </div>
        <div className="modal-actions">
          <button className="menu-primary" onClick={onNext}>
            Next Level
          </button>
          <button className="menu-secondary" onClick={onReplay}>
            Replay
          </button>
          <button className="menu-secondary" onClick={onQuit}>
            Quit
          </button>
        </div>
      </div>
    </div>
  );
}

function StuckModal({
  state,
  onUndo,
  onHint,
  onRestart,
  onQuit,
}: {
  state: GameSnapshot;
  onUndo: () => void;
  onHint: () => void;
  onRestart: () => void;
  onQuit: () => void;
}) {
  const undoDisabled =
    state.tray.length === 0 || (state.undoRemaining !== null && state.undoRemaining <= 0);
  const hintDisabled = state.hintsRemaining <= 0;
  return (
    <div className="overlay-modal">
      <div className="modal-card">
        <div className="modal-title">No legal moves</div>
        <div className="modal-actions">
          <button className="menu-secondary" onClick={onUndo} disabled={undoDisabled}>
            Undo
          </button>
          <button className="menu-secondary" onClick={onHint} disabled={hintDisabled}>
            Hint
          </button>
          <button className="menu-secondary" onClick={onRestart}>
            Restart
          </button>
          <button className="menu-secondary" onClick={onQuit}>
            Quit
          </button>
        </div>
      </div>
    </div>
  );
}

function TutorialOverlay({ state, onFinish }: { state: GameSnapshot; onFinish: () => void }) {
  const step = state.tutorialStep;
  const canFinish = step >= 5 && state.tutorialMovesDone >= state.tutorialMovesRequired;

  let message = "Tap a glowing free tile to remove it.";
  let reason = "Free tiles have at least one open side and can be removed.";

  if (step === 1) {
    message = "Tap a blocked tile.";
    reason = "Blocked tiles are locked because they have tiles on both sides.";
  }

  if (step === 2) {
    message = "Try the highlighted tile to see an illegal move.";
    reason = "Revealed numbers must follow Sudoku rules: no duplicates in row, column, or box.";
  }

  if (step === 3) {
    message = "Use Undo to restore the last tile.";
    reason = "Undo lets you recover from a bad move. It may be limited by settings.";
  }

  if (step === 4) {
    message = "Use Hint to highlight a safe move.";
    reason = "Hints point to a legal reveal when you are stuck.";
  }

  if (step >= 5) {
    message = "Make a few more moves, then finish the tutorial.";
    reason = "Keep the tray from filling up, and watch for legal placements as numbers appear.";
  }

  return (
    <div className="tutorial-overlay">
      <div className="tutorial-card">
        <div className="tutorial-title">Tutorial</div>
        <div className="tutorial-objective">
          Objective: clear all tiles by revealing numbers that obey Sudoku rules.
        </div>
        <div className="tutorial-label">What to do</div>
        <div className="tutorial-message">{message}</div>
        <div className="tutorial-label">Why it matters</div>
        <div className="tutorial-tip">{reason}</div>
        {canFinish && (
          <button className="menu-primary" onClick={onFinish}>
            Finish Tutorial
          </button>
        )}
      </div>
    </div>
  );
}
