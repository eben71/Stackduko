import { generatePrefilledSudoku } from "@/game/logic/sudoku/generator";
import { mulberry32, shuffle } from "@/logic/rng";
import { pickLayoutTemplate, shufflePositions, type Difficulty } from "@/logic/stack/layouts";
import { type TileSpec } from "@/logic/stack/types";

export type LevelData = {
  seed: number;
  difficulty: Difficulty;
  levelNumber: number;
  layoutId: string;
  tiles: TileSpec[];
  solution: number[][];
  puzzle: Array<Array<number | null>>;
  givens: Array<Array<boolean>>;
};

export type LevelOptions = {
  seed: number;
  difficulty: Difficulty;
  levelNumber: number;
};

export function generateLevel(options: LevelOptions): LevelData {
  const puzzleData = generatePrefilledSudoku(options.seed, options.difficulty);
  const rng = mulberry32(puzzleData.seed + options.levelNumber * 131);
  const template = pickLayoutTemplate(options.difficulty, options.levelNumber, rng);

  const missingDigits: number[] = [];
  for (let row = 0; row < 9; row += 1) {
    for (let col = 0; col < 9; col += 1) {
      if (puzzleData.puzzle[row][col] === null) {
        missingDigits.push(puzzleData.solution[row][col]);
      }
    }
  }

  // RULES.md - Tile Setup and Tile Pairs:
  // the stack must map exactly to the empty Sudoku cells, and all tokens must be pair-removable.
  // We enforce this by requiring an even count per digit and materializing value pairs.
  const pairedDigits = buildTokenPairs(missingDigits);
  // RULES.md Section 1 + 2: there must be one stack tile per empty Sudoku cell.
  if (template.positions.length < missingDigits.length) {
    throw new Error("Layout does not have enough positions for all missing digits.");
  }

  const shuffledDigits = shuffle(rng, pairedDigits);
  const positions = shufflePositions(rng, template.positions).slice(0, shuffledDigits.length);
  const tiles: TileSpec[] = positions.map((pos, index) => ({
    id: `tile-${index}`,
    x: pos.x,
    y: pos.y,
    z: pos.z,
    value: shuffledDigits[index],
  }));

  return {
    seed: puzzleData.seed,
    difficulty: options.difficulty,
    levelNumber: options.levelNumber,
    layoutId: template.id,
    tiles,
    solution: puzzleData.solution,
    puzzle: puzzleData.puzzle,
    givens: puzzleData.givens,
  };
}

function buildTokenPairs(missingDigits: number[]): number[] {
  // RULES.md Section 2: stack values are generated as strict matching pairs.
  const counts = new Map<number, number>();
  for (const digit of missingDigits) {
    counts.set(digit, (counts.get(digit) ?? 0) + 1);
  }

  const pairedDigits: number[] = [];
  counts.forEach((count, digit) => {
    if (count % 2 !== 0) {
      throw new Error("Invalid parity: missing digit counts must be even.");
    }
    for (let i = 0; i < count / 2; i += 1) {
      pairedDigits.push(digit, digit);
    }
  });

  return pairedDigits;
}
