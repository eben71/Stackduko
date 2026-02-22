# Stackdoku – Reveal & Resolve

Stackdoku is a hybrid puzzle game that combines **Mahjong-style layered tile clearing** with **Sudoku solving**.

The core loop is:

1. Reveal playable moves by removing free matching tiles from the stack.
2. Resolve the Sudoku by placing earned number tokens into legal cells.

## Game Concept

Each level starts with:

- A layered stack of number tiles (Mahjong-like accessibility rules).
- A partially revealed Sudoku board.
- A tray/token buffer used to hold numbers earned from pair removals.

Players must balance two systems:

- **Board control**: keep revealing free pairs in the stack.
- **Constraint solving**: place tokens without breaking Sudoku rules.

## Gameplay Mechanics

Gameplay rules are maintained in one place: `docs/RULES.md`.

The in-game loop is also referred to as **Pair & Place**:

- **Pair**: remove free matching tiles to earn number tokens.
- **Place**: spend those tokens in legal Sudoku cells.

Highlights of the current hybrid rules:

- 9x9 Sudoku with difficulty-based prefills (easy has more givens, hard has fewer).
- Stack tiles are consumed as matching pairs and correspond to remaining empty cells.
- Free tile rule: no tile on top, and at least one horizontal edge free.
- Pair removal adds two identical tokens to a buffer with capacity 5.
- Tokens must be placed legally under Sudoku row/column/box constraints.
- Players get 3 lives and 3 undos per level.
- Stuck state is when no pair is removable, the buffer is full, and no legal placement exists.
- Victory requires both a legal full grid and an exhausted stack.

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

- Tutorial and help text are now aligned to the same Reveal & Resolve / Pair & Place rule set.
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

- Detailed gameplay rules (single source of truth): `docs/RULES.md`
- Design notes: `docs/GDD.md`
- Launch tracking: `Roadmap.md`
