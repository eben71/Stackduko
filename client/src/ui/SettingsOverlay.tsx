import React, { useEffect, useMemo, useRef, useState } from "react";
import { useSettingsStore } from "@/store/settingsStore";
import { resetProgress, type Settings } from "@/game/state/storage";

interface SettingsOverlayProps {
  open: boolean;
  onClose: () => void;
  onProgressReset?: () => void;
  onSettingsReset?: () => void;
}

type ConfirmTarget = "progress" | "settings" | null;

const focusableSelector =
  "button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])";

export function SettingsOverlay({
  open,
  onClose,
  onProgressReset,
  onSettingsReset,
}: SettingsOverlayProps) {
  const { settings, updateSettings, resetSettings } = useSettingsStore();
  const [confirmTarget, setConfirmTarget] = useState<ConfirmTarget>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const confirmRef = useRef<HTMLDivElement>(null);
  const lastActiveElement = useRef<HTMLElement | null>(null);

  const volumeDisabled = !settings.sfxEnabled && !settings.musicEnabled;

  useEffect(() => {
    if (!open) return;
    lastActiveElement.current = document.activeElement as HTMLElement | null;

    const panel = panelRef.current;
    if (panel) {
      const focusables = panel.querySelectorAll<HTMLElement>(focusableSelector);
      (focusables[0] ?? panel).focus();
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== "Tab") return;
      const trapRoot = confirmTarget && confirmRef.current ? confirmRef.current : panelRef.current;
      if (!trapRoot) return;
      const focusables = trapRoot.querySelectorAll<HTMLElement>(focusableSelector);
      if (focusables.length === 0) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      lastActiveElement.current?.focus();
    };
  }, [open, onClose, confirmTarget]);

  useEffect(() => {
    if (!open) {
      setConfirmTarget(null);
    }
  }, [open]);

  useEffect(() => {
    if (!open || !confirmTarget) return;
    const panel = confirmRef.current;
    if (!panel) return;
    const focusables = panel.querySelectorAll<HTMLElement>(focusableSelector);
    (focusables[0] ?? panel).focus();
  }, [open, confirmTarget]);

  const difficultyOptions = useMemo<Array<{ value: Settings["defaultDifficulty"]; label: string }>>(
    () => [
      { value: "easy", label: "Easy" },
      { value: "medium", label: "Medium" },
      { value: "hard", label: "Hard" },
    ],
    [],
  );

  if (!open) return null;

  return (
    <div
      className="settings-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-title"
    >
      <div className="settings-backdrop" onClick={onClose} />
      <div className="settings-panel" ref={panelRef} tabIndex={-1}>
        <div className="settings-header">
          <div>
            <h2 id="settings-title">Settings</h2>
            <p className="settings-subtitle">Changes save automatically.</p>
          </div>
          <button
            className="settings-close"
            type="button"
            onClick={onClose}
            aria-label="Close settings"
          >
            ×
          </button>
        </div>

        <div className="settings-section">
          <h3>Gameplay</h3>

          <div className="settings-row">
            <div>
              <div className="settings-label">Difficulty default</div>
              <div className="settings-help">Sets the default when you hit Play.</div>
            </div>
            <div className="settings-segment">
              {difficultyOptions.map((option) => (
                <label key={option.value} className="settings-segment-option">
                  <input
                    type="radio"
                    name="defaultDifficulty"
                    value={option.value}
                    checked={settings.defaultDifficulty === option.value}
                    onChange={() =>
                      updateSettings({
                        defaultDifficulty: option.value,
                      })
                    }
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="settings-row">
            <div>
              <div className="settings-label">Show numbers on tiles (Visible mode)</div>
              <div className="settings-help">
                Easy defaults to visible. Medium and Hard default to hidden.
              </div>
            </div>
            <label className="settings-switch">
              <input
                type="checkbox"
                checked={settings.tileNumbersVisible}
                onChange={(event) => updateSettings({ tileNumbersVisible: event.target.checked })}
              />
              <span />
            </label>
          </div>

          <div className="settings-row">
            <div>
              <div className="settings-label">Hints per level</div>
              <div className="settings-help">Sets the starting hint counter.</div>
            </div>
            <div className="settings-stepper">
              <button
                type="button"
                onClick={() =>
                  updateSettings({ hintsPerLevel: Math.max(0, settings.hintsPerLevel - 1) })
                }
              >
                -
              </button>
              <input
                type="number"
                min={0}
                max={10}
                value={settings.hintsPerLevel}
                onChange={(event) => updateSettings({ hintsPerLevel: Number(event.target.value) })}
              />
              <button
                type="button"
                onClick={() =>
                  updateSettings({ hintsPerLevel: Math.min(10, settings.hintsPerLevel + 1) })
                }
              >
                +
              </button>
            </div>
          </div>

          <div className="settings-row">
            <div>
              <div className="settings-label">Undo limit</div>
              <div className="settings-help">Unlimited or capped per level.</div>
            </div>
            <div className="settings-undo">
              <label className="settings-checkbox">
                <input
                  type="checkbox"
                  checked={settings.undoLimit === null}
                  onChange={(event) =>
                    updateSettings({ undoLimit: event.target.checked ? null : 20 })
                  }
                />
                <span>Unlimited</span>
              </label>
              <div className={`settings-stepper ${settings.undoLimit === null ? "disabled" : ""}`}>
                <button
                  type="button"
                  disabled={settings.undoLimit === null}
                  onClick={() =>
                    updateSettings({ undoLimit: Math.max(0, (settings.undoLimit ?? 0) - 1) })
                  }
                >
                  -
                </button>
                <input
                  type="number"
                  min={0}
                  max={50}
                  disabled={settings.undoLimit === null}
                  value={settings.undoLimit ?? 0}
                  onChange={(event) => updateSettings({ undoLimit: Number(event.target.value) })}
                />
                <button
                  type="button"
                  disabled={settings.undoLimit === null}
                  onClick={() =>
                    updateSettings({ undoLimit: Math.min(50, (settings.undoLimit ?? 0) + 1) })
                  }
                >
                  +
                </button>
              </div>
            </div>
          </div>

          <div className="settings-row">
            <div>
              <div className="settings-label">Animation intensity</div>
              <div className="settings-help">0 for minimal motion, 100 for full effects.</div>
            </div>
            <div className="settings-slider">
              <input
                type="range"
                min={0}
                max={100}
                value={Math.round(settings.animationIntensity * 100)}
                onChange={(event) =>
                  updateSettings({ animationIntensity: Number(event.target.value) / 100 })
                }
              />
              <span>{Math.round(settings.animationIntensity * 100)}%</span>
            </div>
          </div>

          <div className="settings-row">
            <div>
              <div className="settings-label">Tutorial tips</div>
              <div className="settings-help">Show or hide instructional prompts.</div>
            </div>
            <label className="settings-switch">
              <input
                type="checkbox"
                checked={settings.tutorialTips}
                onChange={(event) => updateSettings({ tutorialTips: event.target.checked })}
              />
              <span />
            </label>
          </div>
        </div>

        <div className="settings-section">
          <h3>Audio</h3>

          <div className="settings-row">
            <div>
              <div className="settings-label">Sound effects</div>
              <div className="settings-help">Toggle all SFX playback.</div>
            </div>
            <label className="settings-switch">
              <input
                type="checkbox"
                checked={settings.sfxEnabled}
                onChange={(event) => updateSettings({ sfxEnabled: event.target.checked })}
              />
              <span />
            </label>
          </div>

          <div className="settings-row">
            <div>
              <div className="settings-label">Music</div>
              <div className="settings-help">Enable background music.</div>
            </div>
            <label className="settings-switch">
              <input
                type="checkbox"
                checked={settings.musicEnabled}
                onChange={(event) => updateSettings({ musicEnabled: event.target.checked })}
              />
              <span />
            </label>
          </div>

          <div className={`settings-row ${volumeDisabled ? "disabled" : ""}`}>
            <div>
              <div className="settings-label">Volume</div>
              <div className="settings-help">Applies to sound effects and music.</div>
            </div>
            <div className="settings-slider">
              <input
                type="range"
                min={0}
                max={100}
                disabled={volumeDisabled}
                value={Math.round(settings.volume * 100)}
                onChange={(event) => updateSettings({ volume: Number(event.target.value) / 100 })}
              />
              <span>{Math.round(settings.volume * 100)}%</span>
            </div>
          </div>
        </div>

        <div className="settings-section">
          <h3>Accessibility</h3>

          <div className="settings-row">
            <div>
              <div className="settings-label">High contrast</div>
              <div className="settings-help">Thicker outlines and stronger contrast.</div>
            </div>
            <label className="settings-switch">
              <input
                type="checkbox"
                checked={settings.highContrast}
                onChange={(event) => updateSettings({ highContrast: event.target.checked })}
              />
              <span />
            </label>
          </div>

          <div className="settings-row">
            <div>
              <div className="settings-label">Large text</div>
              <div className="settings-help">Increase HUD and number sizes.</div>
            </div>
            <label className="settings-switch">
              <input
                type="checkbox"
                checked={settings.largeText}
                onChange={(event) => updateSettings({ largeText: event.target.checked })}
              />
              <span />
            </label>
          </div>
        </div>

        <div className="settings-section">
          <h3>Data</h3>
          <div className="settings-row">
            <div>
              <div className="settings-label">Reset progress</div>
              <div className="settings-help">Clears saved progress and best scores.</div>
            </div>
            <button
              type="button"
              className="settings-danger"
              onClick={() => setConfirmTarget("progress")}
            >
              Reset Progress
            </button>
          </div>
          <div className="settings-row">
            <div>
              <div className="settings-label">Reset settings</div>
              <div className="settings-help">Restore defaults and save immediately.</div>
            </div>
            <button
              type="button"
              className="settings-secondary"
              onClick={() => setConfirmTarget("settings")}
            >
              Reset Settings
            </button>
          </div>
        </div>

        <div className="settings-footer">
          <button type="button" className="settings-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>

      {confirmTarget && (
        <div className="settings-confirm" role="alertdialog" aria-modal="true">
          <div className="settings-confirm-panel" ref={confirmRef} tabIndex={-1}>
            <h4>Confirm</h4>
            <p>
              {confirmTarget === "progress"
                ? "Reset all saved progress and best scores? This cannot be undone."
                : "Reset all settings to defaults?"}
            </p>
            <div className="settings-confirm-actions">
              <button
                type="button"
                className="settings-secondary"
                onClick={() => setConfirmTarget(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="settings-danger"
                onClick={() => {
                  if (confirmTarget === "progress") {
                    resetProgress();
                    onProgressReset?.();
                  } else {
                    resetSettings();
                    onSettingsReset?.();
                  }
                  setConfirmTarget(null);
                }}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
