## Packages

phaser | Game engine for the 3D isometric tile stack and board
framer-motion | For beautiful UI transitions and overlay animations
zustand | For managing game state between React and Phaser (score, time, settings)
clsx | Utility for conditional classes
tailwind-merge | Utility for merging tailwind classes

## Notes

The game uses a hybrid approach: Phaser handles the canvas (Board, Tiles, Interactions) and React handles the UI (HUD, Menus, Dialogs).
We need a robust communication layer between React and Phaser (likely via a global store or event emitter).
Sudoku generation and validation logic needs to be implemented client-side for immediate feedback.
