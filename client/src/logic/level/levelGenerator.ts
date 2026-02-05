import { mulberry32, shuffle, type Rng } from "@/logic/rng";
import { generateSolvedGrid } from "@/logic/sudoku/generator";
import { isValidSolution } from "@/logic/sudoku/validate";
import {
  getLayoutTemplates,
  pickLayoutTemplate,
  shufflePositions,
  type Difficulty,
  type LayoutTemplate,
} from "@/logic/stack/layouts";
import { type TileSpec } from "@/logic/stack/types";
import { createInitialState, createSolverContext, isSolvable } from "@/logic/solver/solver";

export type LevelData = {
  seed: number;
  difficulty: Difficulty;
  levelNumber: number;
  layoutId: string;
  tiles: TileSpec[];
  solution: number[][];
};

export type LevelOptions = {
  seed: number;
  difficulty: Difficulty;
  levelNumber: number;
  attemptCap?: number;
};

const DEFAULT_ATTEMPT_CAP = 50;

export function generateLevel(options: LevelOptions): LevelData {
  const attemptCap = options.attemptCap ?? DEFAULT_ATTEMPT_CAP;
  let seed = options.seed;

  while (true) {
    const rng = mulberry32(seed);
    const baseTemplate = pickLayoutTemplate(options.difficulty, options.levelNumber, rng);
    const templates = [baseTemplate, ...getLayoutTemplates().filter((t) => t.id !== baseTemplate.id)];

    const attempt = tryGenerateWithTemplates(
      options,
      rng,
      templates,
      attemptCap,
    );
    if (attempt) {
      return {
        ...attempt,
        seed,
        difficulty: options.difficulty,
        levelNumber: options.levelNumber,
      };
    }
    seed += 1;
  }
}

function tryGenerateWithTemplates(
  options: LevelOptions,
  rng: Rng,
  templates: LayoutTemplate[],
  attemptCap: number,
): Omit<LevelData, "seed" | "difficulty" | "levelNumber"> | null {
  for (let attempt = 0; attempt < attemptCap; attempt += 1) {
    const template = templates[Math.min(attempt, templates.length - 1)];
    const positions = shufflePositions(rng, template.positions);
    const solution = generateSolvedGrid(rng);
    if (!isValidSolution(solution)) continue;
    const tiles = assignTiles(solution, positions, rng);
    const context = createSolverContext(tiles);
    const state = createInitialState(tiles);
    if (isSolvable(context, state)) {
      return {
        layoutId: template.id,
        tiles,
        solution,
      };
    }
  }

  const easiest = templates.find((template) => template.id === "low-pyramid") ?? templates[0];
  for (let attempt = 0; attempt < attemptCap; attempt += 1) {
    const positions = shufflePositions(rng, easiest.positions);
    const solution = generateSolvedGrid(rng);
    if (!isValidSolution(solution)) continue;
    const tiles = assignTiles(solution, positions, rng);
    const context = createSolverContext(tiles);
    const state = createInitialState(tiles);
    if (isSolvable(context, state)) {
      return {
        layoutId: easiest.id,
        tiles,
        solution,
      };
    }
  }

  return null;
}

function assignTiles(solution: number[][], positions: { x: number; y: number; z: number }[], rng: Rng): TileSpec[] {
  if (positions.length !== 81) {
    throw new Error("Layout must define 81 tile positions.");
  }
  const cells: Array<{ row: number; col: number; value: number }> = [];
  for (let row = 0; row < 9; row += 1) {
    for (let col = 0; col < 9; col += 1) {
      cells.push({ row, col, value: solution[row][col] });
    }
  }
  const shuffledCells = shuffle(rng, cells);
  return positions.map((pos, index) => {
    const cell = shuffledCells[index];
    return {
      id: `tile-${index}`,
      x: pos.x,
      y: pos.y,
      z: pos.z,
      row: cell.row,
      col: cell.col,
      value: cell.value,
    };
  });
}
