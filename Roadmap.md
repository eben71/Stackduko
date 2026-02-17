# Stackdoku Roadmap

## Completed in this update (Pair & Place core)

- Replaced Reveal & Resolve with the **Pair & Place** core loop.
- Added deterministic prefilled Sudoku generation by difficulty.
- Enforced odd given-count parity for each digit (1-9) to guarantee even missing counts.
- Added uniqueness checks for generated Sudoku puzzles.
- Updated level generation so the 3D stack uses **missing digits only**.
- Implemented pair removal validation (open + matching tiles only).
- Implemented **Token Buffer** mechanics with capacity = 5.
- Implemented legal Sudoku placement and live legal-cell highlighting.
- Implemented stuck detection, lives, undo behavior, fail, and victory transitions.
- Added/updated Pair & Place tutorial/help overlays and HUD terminology.
- Added unit tests for parity generation, pair removal, placement legality, token buffer limits, and stuck/undo behavior.

## Remaining launch-critical items

- Add additional level balancing telemetry for early/mid/late progression.
- Improve Phaser visual polish (tile depth cues, feedback VFX, and accessibility colors).
- Add dedicated Victory/Fail scene transitions and SFX hooks.
- Finalize mobile controls and haptic feedback.
- Add more integration tests that cover full gameplay loops with seeded snapshots.

## Future roadmap

### Gameplay content

- Daily seeded puzzles.
- Rotating challenge modifiers.
- Timed mode + score attack.

### Community & progression

- Local and cloud leaderboards.
- Profile progression tracks and achievements.
- Optional puzzle sharing by seed.

### Monetization options

- Free with inter-level ads.
- Premium no-ads purchase.
- Optional cosmetic bundles (themes/tiles only).

### Platform + ops

- Cloud sync for progress and settings.
- Crash analytics and balancing analytics (privacy-safe).
- Live-ops puzzle rotation tooling.
