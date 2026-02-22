# Stackdoku – Reveal & Resolve

Stackdoku is a hybrid puzzle game that combines **Mahjong-style layered tile clearing** with **Sudoku solving**.

The core loop is:

1. Reveal playable moves by removing free matching tiles from the stack.
2. Resolve the Sudoku by placing earned number tokens into legal cells.

> Internal UI text still references **Pair & Place** in some places. In this README, that loop is described as the current implementation of the broader Reveal & Resolve concept.

## Game Concept

Each level starts with:

- A layered stack of number tiles (Mahjong-like accessibility rules).
- A partially revealed Sudoku board.
- A tray/token buffer used to hold numbers earned from pair removals.

Players must balance two systems:

- **Board control**: keep revealing free pairs in the stack.
- **Constraint solving**: place tokens without breaking Sudoku rules.

## Gameplay Mechanics

### 1) Free tile rule (Mahjong-style)

A tile is removable only when it is **free/open**:

- No tile is directly above it.
- At least one horizontal side is open.

Only two matching, currently free tiles can be removed as a pair.

### 2) Reveal & Resolve loop

- Removing a legal pair grants two number tokens.
- Tokens go to the tray (buffer).
- A token can be placed only in an empty Sudoku cell where it is legal for row/column/3×3 box constraints.

### 3) Tray / Undo / Hint systems

- **Tray (Token Buffer):** limited capacity (default gameplay flow uses capped buffer).
- **Undo:** reverses recent actions up to the configured limit for the level/settings.
- **Hint:** highlights a likely next stack action (remove-pair guidance).

### 4) Visible vs Hidden tile-number mode

- **Visible mode:** tile numbers are shown directly (typically easier).
- **Hidden mode:** tile values are concealed until interaction patterns reveal intent (typically harder).

This behavior is configurable via settings and defaults by difficulty.

### 5) Win/Loss conditions

- **Win:** Sudoku is completed legally and the stack is fully resolved.
- **Loss/fail state:** player reaches repeated deadlocks with no recovery actions available (for example no legal moves and no remaining undos/lives under configured rules).

## Tech Stack

- **Build/runtime:** Vite + TypeScript
- **Game runtime:** Phaser 3
- **UI layer:** React (overlay/menu/settings screens around the game canvas)
- **Quality tooling:** ESLint + Prettier
- **Tests:** Vitest (coverage enforced in CI)

## Repository Structure

```text
client/
  src/
    game/                # Phaser scenes, rendering, game mechanics integration
      scenes/
      rendering/
      logic/
      mechanics/
      state/
    logic/               # Core puzzle/domain logic (Sudoku, stack, solver, generation)
      level/
      solver/
      stack/
      sudoku/
    ui/                  # React overlay UI (HUD, help, tutorial, settings)
    store/               # Zustand-like game/settings stores
    state/               # Additional persisted client state
    styles/              # Overlay/settings CSS
server/                  # API/server scaffolding
shared/                  # Shared schemas/routes between client/server
docs/                    # Design and gameplay docs
tests/                   # Unit and integration-style tests
script/                  # Build/dev helper scripts
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+

### Install

```bash
npm install
```

### Run in development

```bash
npm run dev
```

### Build for production

```bash
npm run build
```

### Run tests

```bash
npm run test
```

### Other useful checks

```bash
npm run check
npm run lint
npm run format:check
```

## Current Features

- Playable hybrid loop (remove matching free tiles + Sudoku token placement).
- Difficulty-driven level generation.
- Solver and solvability support for generated content.
- Tutorial overlay scaffold and help overlay.
- Basic HUD/menus/settings overlays.
- Local state scaffolding for settings and progress/best scores.

## Current Limitations

- Some UX wording still uses the legacy “Pair & Place” label.
- Limited polish for animation/audio/game-feel.
- Tutorial/help flow is functional but still lightweight compared with shipping quality onboarding.
- Persistence is currently local-first and does not include cloud sync or account progression.

## Next Improvements

- **Monetization tracks:** ad-supported free mode and premium ad-removal.
- **Daily puzzles:** seed-based rotating content and challenge tracks.
- **Cosmetics:** tile themes, board skins, and unlockable visual variants.
- **Analytics:** privacy-safe funnel and balancing telemetry.
- **Onboarding polish:** richer interactive tutorial, context-sensitive guidance, and accessibility-first hinting.
- **Platform readiness:** store assets, privacy disclosures, and release hardening.

## Additional Docs

- Detailed gameplay rules: `docs/GameRules.md`
- Design notes: `docs/GDD.md`
- Launch tracking: `Roadmap.md`
