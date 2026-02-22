# Stackdoku Rules (Pair & Place)

This is the single source of truth for gameplay rules. Keep this file aligned with code and tutorial text.

## 1. Tile Setup

- Each level uses a 9x9 Sudoku grid.
- Difficulty controls prefilled cells: easy has more givens, hard has fewer.
- Empty cells count is `81 - n` where `n` is prefilled cells.
- The stack must contain tokens that correspond exactly to those empty cells.

## 2. Tile Pairs

- The Mahjong-style stack contains only open matching pairs.
- Every removable value appears exactly twice per pair action.
- If a number is prefilled in the Sudoku, unmatched copies of that number are excluded from stack generation.
- Result: stack token counts map exactly to remaining empty Sudoku cells.

## 3. Free Tile Rule

A tile is removable only when both are true:

- No tile is on top of it.
- At least one horizontal edge is free.

## 4. Pair Removal and Tokens

- Removing a legal matching pair awards two identical number tokens.
- Tokens are placed into the token buffer.
- Buffer capacity is 5.
- If the buffer is full, the player must place tokens before removing more pairs.

## 5. Placement

- Selecting a token highlights all legal cells.
- Placement must obey Sudoku constraints:
  - no duplicate in row
  - no duplicate in column
  - no duplicate in 3x3 box
- Illegal placements are blocked and feedback is shown.

## 6. Lives and Undo

- Players start each level with 3 lives.
- Players have 3 undos per level.
- If the player reaches a stuck state and has no undo left, resolving the turn costs one life.

## 7. Stuck Condition

Prompt the player to undo or restart when all are true:

- no removable pairs exist
- token buffer is full
- no legal placements remain for held tokens

## 8. Victory

A level is solved only when both are true:

- all Sudoku cells are filled legally
- stack is exhausted

## 9. Sync Requirement

If rules change, update all of the following in the same change:

- `docs/RULES.md`
- `README.md`
- `docs/GDD.md`
- `client/src/ui/TutorialOverlay.tsx`
