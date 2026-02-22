# Stackdoku Game Rules (Reveal & Resolve)

This document defines the current intended rules for Stackdoku’s Mahjong–Sudoku hybrid gameplay.

## 1. Core Objective

Clear the layered tile stack and complete the Sudoku grid with legal placements.

A run is successful only when both are true:

- All required Sudoku cells are correctly filled.
- Stack tiles have been fully resolved by legal removals.

## 2. Mahjong Layer: Free Tile Conditions

A tile can be selected for pair removal only when it is **free**:

- No tile is directly above it.
- At least one horizontal side is not blocked by a neighboring tile.

A removal action is legal when:

- Two selected tiles are both free.
- Both tiles carry the same numeric value.

If either condition fails, the move is illegal and should provide clear player feedback.

## 3. Sudoku Layer: Constraint Checks

Removing a legal pair yields two number tokens for placement.

A placement is legal only if:

- Target Sudoku cell is currently empty.
- Token value does not already exist in the same row.
- Token value does not already exist in the same column.
- Token value does not already exist in the same 3×3 box.

Illegal placements must be blocked (not committed) and surfaced through UI messaging/highlights.

## 4. Tray / Buffer, Undo, and Hints

## Tray / Buffer

- Earned tokens enter the tray.
- Tray has a configurable maximum capacity (default game flow assumes a capped buffer).
- If tray is full, player must place tokens before removing more pairs.

## Undo

- Undo reverses the most recent valid action(s) according to current implementation.
- Undo count can be limited per level or configured to unlimited via settings.

## Hints

- Hint action points players toward a likely legal remove-pair move.
- Hint quantity/availability is configurable through settings and may be constrained per level.

## Configurable Limits (current settings model)

- Hints per level
- Undo cap (finite or unlimited)
- Visible vs hidden tile-number mode

## 5. Visible vs Hidden Mode

Tile number visibility can be toggled:

- **Visible mode:** tile values shown directly, reducing memory burden.
- **Hidden mode:** tile values concealed/less explicit, increasing challenge.

Recommended defaults by difficulty:

- Easy: visible
- Medium: hidden
- Hard: hidden

## 6. Difficulty Modes and Seed-Based Generation

Each run is generated from a seed so content can be deterministic/reproducible.

Difficulty modes should adjust at least:

- Stack density and accessibility profile (free-tile availability over time).
- Sudoku prefill density/complexity.
- Initial pressure from tray/undo/hint constraints.

Seed + difficulty + level index should be sufficient to reconstruct the same challenge for testing and daily content scenarios.

## 7. Deadlock, Recovery, Win/Loss

A deadlock/stuck state is reached when no productive legal action remains under current constraints (e.g., no removable pairs and no legal placements for held tokens).

Recovery tools:

- Undo (if available)
- Hint guidance
- Restart level

Failure occurs when the player exhausts configured recovery/life conditions.

## 8. Tutorial Level Scripting Goals

Tutorial scripting should teach, in order:

1. How to identify free tiles.
2. How to remove a legal matching pair.
3. How tokens enter the tray and why tray capacity matters.
4. How to place tokens legally using Sudoku constraints.
5. How and when to use hint and undo tools.
6. How visible/hidden settings affect readability and planning.
7. What causes stuck states and how to recover.

Expected tutorial outcome: player can independently complete an early easy level without external guidance.
