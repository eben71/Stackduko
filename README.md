# Stackdoku - Pair & Place

## What It Is

- Stackdoku is a single-player puzzle that blends Mahjong-style pair removal with Sudoku placement.
- Levels start with a prefilled Sudoku grid.
- Remove matching open tile pairs to earn number tokens.
- Place tokens legally to complete the Sudoku.

## Core Rules

- Open tile rule: no tile above + at least one horizontal side free.
- Remove Pair: only open matching tiles can be removed.
- Token Buffer: capacity 5.
- Placement: must respect Sudoku row/column/box constraints.
- Stuck rule: no removable pairs + full buffer + no legal placements.
- Lives: 3 per level.
- Undos: 3 per level.

## Run Locally

- Ensure Docker Desktop is running.
- Copy `.env.example` to `.env` and keep `DATABASE_URL` set to the local Docker value.
- Run `make dev`.

## Storage

- Settings are stored in localStorage under `stackdoku.settings.v1`.
- Progress and best scores are stored under `stackdoku.progress.v1`.

## Repo Structure

- `client/` for the React + Phaser game
- `server/` for API scaffolding
- `shared/` for shared schemas
- `docs/` for design docs
- `tests/` for unit tests
