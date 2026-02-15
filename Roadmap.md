# Stackdoku Roadmap

## Completed Work

- **Sudoku generator and validator are in place.** The project already generates full Sudoku solutions and validates placements/solutions, forming the backbone of level creation and legality checks. See `generateSolvedGrid` in the generator and `isPlacementLegal` / `isValidSolution` in the validator. 【F:client/src/logic/sudoku/generator.ts†L1-L35】【F:client/src/logic/sudoku/validate.ts†L1-L57】
- **3D stack layouts and free tile logic are implemented.** Layout templates and selection logic exist for the stacked board, along with adjacency-based “free tile” checks that mirror Mahjong-like removal rules. 【F:client/src/logic/stack/layouts.ts†L1-L113】【F:client/src/logic/stack/freeTile.ts†L1-L60】
- **Solver supports solvability checks and hinting.** The solver builds legal move lists, scores moves, validates solvability, and provides hint indices for the current state. 【F:client/src/logic/solver/solver.ts†L1-L166】
- **Level generation connects Sudoku, layouts, and solver validation.** The level generator chooses a layout, assigns values, and ensures the resulting stack is solvable before committing a level. 【F:client/src/logic/level/levelGenerator.ts†L1-L129】
- **Game state management with persistence is working.** The `useGameStore` zustand store tracks phases, moves, and tutorial flow, while `storage.ts` persists settings/progress in local storage. 【F:client/src/store/gameStore.ts†L1-L408】【F:client/src/game/state/storage.ts†L1-L329】
- **Basic tutorial sequence exists.** Tutorial steps, targets, and overlay messaging are wired into the store and UI layer. 【F:client/src/store/gameStore.ts†L57-L408】【F:client/src/ui/OverlayRoot.tsx†L172-L523】
- **Database schema for users and scores exists.** The shared schema defines `users` and `scores` tables for the API layer. 【F:shared/schema.ts†L1-L31】
- **Build system and routing are configured.** Vite + TypeScript + React + Phaser dependencies are set, and the app uses a basic router with a home and not-found route. 【F:package.json†L1-L113】【F:client/src/App.tsx†L1-L47】

## Outstanding Tasks

- **Polished UI**
  - Design and implement the full set of scenes (loading, menu, difficulty select, gameplay, pause, win, lose) using React and Phaser.
  - Ensure responsive layout, animations, sound effects, accessible color schemes, and consistent styling.

- **Tutorial Improvements**
  - Expand the tutorial with clear, user-friendly instructions.
  - Explain the goal (remove all tiles to reveal a valid Sudoku), the free tile rule, Sudoku constraints, when a move is illegal, how hints work, and suggest strategies.
  - Use overlays, tooltips, and progressive guidance so new players understand how to play and why.

- **App Store Readiness**
  - Integrate Capacitor (or a React Native wrapper) to build for iOS/Android.
  - Add app icons, splash screens, necessary metadata (package name, version, description), and ensure performance on mobile devices.
  - Configure CI to build and run automated tests.
  - Prepare privacy policy and terms as needed.

- **Advertisement & Premium Modes**
  - Implement ad integration (e.g., Google AdMob) for the free version, displaying ads only between levels.
  - Add a premium upgrade (in-app purchase) that removes ads, possibly grants unlimited hints, and stores purchase status securely.

- **Persisting Settings & Scores in Database**
  - Extend the existing database schema by adding tables for settings and scores.
  - Implement a lightweight Node/Express API using drizzle-ORM to read/write these values locally (and plan for remote sync in a future release).
  - Update the client to save/load settings and scores via this API rather than exclusively using localStorage.

- **Analytics & Telemetry (optional but recommended)**
  - Add opt-in analytics to understand user engagement, level difficulty, and hint usage.
  - Ensure compliance with privacy laws.

- **QA & Testing**
  - Add unit tests for UI components and integration tests for core gameplay flows.
  - Perform cross-device testing (desktop, tablet, phone) and fix any layout or input issues.

- **Accessibility & Localization**
  - Implement large-text and high-contrast modes, add keyboard navigation support, and prepare for translation to other languages.

## Future Enhancements

- **Post-launch features**
  - Daily challenges.
  - Leaderboards (local or online).
  - Theming/customization (tile skins, backgrounds, UI variants).
  - Additional layout templates for advanced levels.
  - Achievements and long-term progression goals.

- **Cross-device cloud sync**
  - Once the local database integration is stable, add a backend service to sync settings, progress, and scores between devices.
  - Plan for account management, conflict resolution, and offline-first fallbacks.
