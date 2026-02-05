# Stackdoku - Reveal & Resolve

## What It Is
- Stackdoku is a single player puzzle that blends Mahjong style tile removal with Sudoku constraints.
- Remove free tiles to reveal numbers that lock into the Sudoku grid.
- Every level is generated with a seeded solver to ensure solvability.

## Run Locally
- npm install
- npm run dev
- npm run test
- npm run build

## Controls
- Tap or click a free tile to remove it.
- Use Undo to restore the last removed tile.
- Use Hint to highlight a legal move.
- Use Restart to reset the current level.
- Use Pause to open the pause menu.

## Settings
- Default difficulty selects the starting difficulty when you hit Play.
- Show numbers on tiles toggles Visible mode for tile faces.
- Hints per level sets the starting hint counter.
- Undo limit caps or removes undo availability per level.
- Animation intensity scales tween durations and shake effects.
- Tutorial tips toggles instructional prompts.
- Sound effects toggles SFX playback.
- Music toggles background music playback.
- Volume controls loudness for SFX and music.
- High contrast thickens outlines and increases tile and grid contrast.
- Large text increases HUD and tile font sizes.

## Storage
- Settings are stored in localStorage under stackdoku.settings.v1.
- Progress and best scores are stored under stackdoku.progress.v1.
- Use Reset Settings or Reset Progress in the Settings screen to clear data.

## Repo Structure
- client/ for the React and Phaser game
- server/ for the API scaffolding used by the template
- shared/ for shared schemas
- docs/ for the game design document
- tests/ for unit tests

## Next Improvements
- Ads integration between levels
- Premium toggle to remove ads
- Daily puzzle seed rotation
- Cosmetic themes and tile skins
- Analytics for difficulty tuning
