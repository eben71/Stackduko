import React, { useEffect, useState } from "react";
import { SettingsOverlay } from "@/ui/SettingsOverlay";
import { useGameStore } from "@/store/gameStore";
import { TutorialOverlay } from "@/ui/TutorialOverlay";
import { useSettingsStore } from "@/store/settingsStore";
import { getProgress } from "@/game/state/storage";
import { HelpOverlay } from "@/ui/HelpOverlay";
import { HelpCircle } from "lucide-react";

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
    advanceTutorial,
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
  const [helpOpen, setHelpOpen] = useState(false);
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

  const openHelp = () => {
    setHelpOpen(true);
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
          onHelp={openHelp}
          onOptions={() => openSettings("menu")}
          onQuit={() => {
            window.close();
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
        phase === "fail" ||
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
          onQuit={quitToMenu}
          onHelp={openHelp}
        />
      )}

      {phase === "paused" && (
        <PauseMenu
          onResume={resumeGame}
          onHelp={openHelp}
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

      {(phase === "stuck" || phase === "fail") && (
        <StuckModal
          state={gameState}
          onUndo={() => undoMove()}
          onHint={() => hintAction()}
          onRestart={restartLevel}
          onQuit={quitToMenu}
        />
      )}

      {phase === "tutorial" && (
        <TutorialOverlay
          state={gameState}
          onFinish={finishTutorial}
          onAdvance={advanceTutorial}
          onBack={() =>
            useGameStore.setState((s) => ({ tutorialStep: Math.max(0, s.tutorialStep - 1) }))
          }
        />
      )}

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

      <HelpOverlay open={helpOpen} onClose={() => setHelpOpen(false)} />
    </div>
  );
}

function BootScreen() {
  return (
    <div className="overlay-screen overlay-boot">
      <div className="boot-card">
        <div className="boot-logo">Stackdoku</div>
        <div className="boot-subtitle">Pair & Place</div>
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
  onHelp,
  onOptions,
  onQuit,
}: {
  canContinue: boolean;
  onContinue: () => void;
  onPlay: () => void;
  onTutorial: () => void;
  onHelp: () => void;
  onOptions: () => void;
  onQuit: () => void;
}) {
  return (
    <div className="overlay-screen menu-screen">
      <div className="menu-card">
        <div className="menu-title">Stackdoku</div>
        <div className="menu-subtitle">Remove pairs. Place tokens. Complete Sudoku.</div>
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
          <button className="menu-secondary" onClick={onHelp}>
            How to Play
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
  onQuit,
  onHelp,
}: {
  state: GameSnapshot;
  onPause: () => void;
  onHint: () => void;
  onUndo: () => void;
  onRestart: () => void;
  onQuit: () => void;
  onHelp: () => void;
}) {
  const undoDisabled = state.undoRemaining !== null && state.undoRemaining <= 0;
  const hintDisabled = false;
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
          <div className="hud-label">Lives</div>
          <div className="hud-value">{state.lives}</div>
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
          <div className="tray-label">Token Buffer</div>
          <div className="tray-items">
            {state.trayTokens.length === 0 && <div className="tray-empty">Empty</div>}
            {state.trayTokens.map((value, idx) => (
              <button
                key={`t-${idx}`}
                className="tray-tile"
                onClick={() => useGameStore.getState().selectToken("tray", idx)}
              >
                {value}
              </button>
            ))}
          </div>
        </div>
        <div className="hud-actions">
          <button className="hud-action" onClick={onUndo} disabled={undoDisabled}>
            Undo
          </button>
          <button className="hud-action" onClick={onHint} disabled={hintDisabled}>
            Remove Pair Hint
          </button>
          <button className="hud-action" onClick={onRestart}>
            Restart
          </button>
          <button className="hud-action" onClick={onQuit}>
            Exit
          </button>
          <button className="hud-help" onClick={onHelp} aria-label="How to play">
            <HelpCircle size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}

function PauseMenu({
  onResume,
  onHelp,
  onOptions,
  onRestart,
  onQuit,
}: {
  onResume: () => void;
  onHelp: () => void;
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
          <button className="menu-secondary" onClick={onHelp}>
            How to Play
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
          <div>Lives left: {state.lives}</div>
          <div>Undos left: {state.undoRemaining ?? "∞"}</div>
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
  const undoDisabled = state.undoRemaining !== null && state.undoRemaining <= 0;
  const hintDisabled = false;
  return (
    <div className="overlay-modal">
      <div className="modal-card">
        <div className="modal-title">Stuck / No legal moves</div>
        <div className="modal-actions">
          <button className="menu-secondary" onClick={onUndo} disabled={undoDisabled}>
            Undo
          </button>
          <button className="menu-secondary" onClick={onHint} disabled={hintDisabled}>
            Remove Pair Hint
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
