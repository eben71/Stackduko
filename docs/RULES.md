# Stackdoku Rules (Reveal & Resolve / Pair & Place)

This is the single source of truth for gameplay rules. Keep this file aligned with code, tutorial text, and help text.

## 1. Level Setup

- Each level uses a 9x9 Sudoku grid.
- Difficulty controls prefilled cells: easy has more givens, hard has fewer.
- Empty cells count is `81 - n` where `n` is prefilled cells.
- The Mahjong-style tile stack is generated so its token values map to the remaining empty Sudoku cells.

## 2. Pair and Place Loop

- **Reveal / Pair**: remove free matching tiles from the stack.
- **Resolve / Place**: place earned number tokens into legal Sudoku cells.
- A level can require switching between these phases often to avoid buffer lock.

## 3. Free Tile Rule

A tile is removable only when both are true:

- No tile is on top of it.
- At least one horizontal edge is free.

Only matching free tiles can be removed as a legal pair.

## 4. Pair Removal and Token Buffer

- Removing a legal matching pair awards two identical number tokens.
- Tokens are placed into the token buffer (tray).
- Buffer capacity is 5.
- If the buffer is full, pair removal is blocked until at least one token is placed.

## 5. Sudoku Placement Rule

- Selecting a token highlights all legal target cells.
- Placement is allowed only in empty cells that satisfy Sudoku constraints:
  - no duplicate in row
  - no duplicate in column
  - no duplicate in 3x3 box
- Illegal placements are blocked with feedback.

## 6. Lives and Undo

- Players start each level with 3 lives.
- Players have 3 undos per level.
- Undo rewinds the most recent action and is the primary stuck-state recovery tool.
- If the player is stuck and has no undos left, resolving that stuck turn costs one life.

## 7. Stuck Condition

A state is stuck only when all are true:

- no removable pairs exist
- token buffer is full
- no legal placements remain for held tokens

When stuck, the player should be prompted to undo or restart.

## 8. Victory Condition

A level is solved only when both are true:

- all Sudoku cells are filled legally
- stack is exhausted

## 9. Modes

- Visible mode shows tile numbers before removal.
- Hidden mode conceals tile numbers and increases memory/planning difficulty.
- Switching modes mid-level changes rendering only, not puzzle state or rules.

## 10. Sync Requirement

If rules change, update all of the following in the same change:

- `docs/RULES.md`
- `README.md`
- `docs/GDD.md`
- `client/src/ui/TutorialOverlay.tsx`
- `client/src/ui/HelpOverlay.tsx`
