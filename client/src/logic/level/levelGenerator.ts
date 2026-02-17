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

  if (missingDigits.some((digit) => missingDigits.filter((d) => d === digit).length % 2 !== 0)) {
    throw new Error("Invalid parity: missing digit counts must be even.");
  }
  if (template.positions.length < missingDigits.length) {
    throw new Error("Layout does not have enough positions for all missing digits.");
  }

  const shuffledDigits = shuffle(rng, missingDigits);
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
