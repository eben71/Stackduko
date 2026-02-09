# Stackdoku GDD

## Overview

- Title: Stackdoku - Reveal and Resolve
- Genre: single player logic puzzle
- Session length: 5 to 15 minutes per puzzle
- Monetization placeholders
- Ads between levels, stub only
- Premium removes ads, stub only

## Core Loop

- Observe the isometric tile stack
- Identify free tiles
- Evaluate Sudoku implications
- Remove a legal tile
- Reveal the number in the grid
- Use undo or hints if needed
- Win by revealing all 81 cells with no constraint violations

## Key Concepts

- Each tile maps to a Sudoku cell and carries that solution value
- Tiles start present and unrevealed
- Removing a tile reveals and locks its number unless undone

## Difficulty Model

- Easy
- Tile numbers visible default on
- More hints
- Simpler stack layouts
- Medium
- Tile numbers visible default off
- Balanced layouts
- Hard
- Tile numbers visible default off
- Denser layouts
- Difficulty influences layout weights, hint defaults, and undo limits

## Rules

- Free Tile Rule
- A tile is removable if no tile exists directly above it at the same x and y
- A tile is removable if at least one horizontal side is open on its layer
- Reveal Rule
- Removing a tile reveals its value in the Sudoku grid
- Constraint Rule
- A move is illegal if it creates duplicates in row, column, or box among revealed values
- Illegal moves are blocked with feedback and highlights
- Win Condition
- All tiles removed with no violations
- Stuck Condition
- No legal free tiles remain
- Show a modal with Undo, Hint, Restart, Quit

## Modes

- Visible mode shows numbers on tile faces before removal
- Hidden mode keeps tiles blank until revealed
- Toggling mid level only changes rendering

## Tray, Undo, Hints

- Tray stores the last N removed tiles
- If the tray is full, removing another tile is blocked
- Undo restores the last removed tile and unreveals its cell
- Hints highlight a legal tile using solver heuristics
