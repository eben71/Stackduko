# Stackdoku GDD

## Overview

- Title: Stackdoku - Reveal and Resolve
- Genre: single player logic puzzle
- Session length: 5 to 15 minutes per puzzle
- Monetization placeholders
- Ads between levels, stub only
- Premium removes ads, stub only

## Rule Source of Truth

Gameplay rules are centralized in `docs/RULES.md`. Keep this document, README, and tutorial/help overlays aligned with that file.

## Core Loop

- Observe the layered tile stack.
- Identify free matching pairs.
- Remove a legal pair to earn two identical number tokens.
- Place tokens into legal Sudoku cells.
- Manage buffer pressure, lives, and undo budget.
- Win by legally filling the board and exhausting the stack.

## Key Concepts

- Levels use a 9x9 Sudoku board with difficulty-based prefilled counts.
- The stack is generated to map to empty-cell requirements.
- Pair removals produce token placements instead of directly revealing cells.

## Difficulty Model

- Easy
  - More Sudoku prefills
  - Tile numbers visible default on
  - Simpler stack pressure
- Medium
  - Balanced Sudoku prefills
  - Tile numbers visible default off
- Hard
  - Fewer Sudoku prefills
  - Tile numbers visible default off
  - Higher planning pressure

## Rules Summary

- Free Tile Rule
  - A tile is removable if no tile exists above and at least one horizontal side is open.
- Pair Rule
  - Only matching free tiles can be removed.
- Token Buffer Rule
  - Removing a legal pair adds two identical tokens.
  - Buffer capacity is 5.
  - If full, player must place tokens before removing more pairs.
- Placement Rule
  - Selecting a token highlights legal cells.
  - Token placement must satisfy Sudoku row, column, and 3x3 box constraints.
  - Illegal placements are blocked with feedback.
- Lives and Undo Rule
  - 3 lives per level.
  - 3 undos per level.
  - If stuck and no undos remain, player loses one life.
- Stuck Rule
  - No removable pairs, full buffer, and no legal placements.
  - Prompt undo or restart.
- Win Rule
  - All cells filled legally and stack exhausted.

## Modes

- Visible mode shows numbers on tile faces before removal.
- Hidden mode keeps tile values concealed until revealed by play.
- Toggling mid-level changes rendering only.

## Tray, Undo, Hints

- Tray (token buffer) stores earned tokens with hard capacity 5.
- Undo restores prior actions up to the per-level limit.
- Hints point to a likely legal remove-pair move.

## Tutorial Requirements

Tutorial should explicitly teach:

1. Free tile identification.
2. Matching pair removal.
3. Buffer capacity and forced placement flow.
4. Legal Sudoku placement and legal-cell highlighting.
5. Undo usage and stuck-state recovery.
6. Visible vs hidden modes.
