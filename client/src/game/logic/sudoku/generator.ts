import { mulberry32, shuffle } from "@/logic/rng";
import { generateSolvedGrid } from "@/logic/sudoku/generator";

export type Difficulty = "easy" | "medium" | "hard";
export type SudokuGrid = number[][];

export type GeneratedPuzzle = {
  seed: number;
  difficulty: Difficulty;
  solution: SudokuGrid;
  puzzle: Array<Array<number | null>>;
  givens: Array<Array<boolean>>;
  givenCountsByDigit: Record<number, number>;
};

// RULES.md Section 1: difficulty controls prefilled Sudoku density.
const TARGET_GIVENS: Record<Difficulty, number> = {
  easy: 63,
  medium: 55,
  hard: 47,
};

export function generatePrefilledSudoku(seed: number, difficulty: Difficulty): GeneratedPuzzle {
  let localSeed = seed;
  for (let attempt = 0; attempt < 300; attempt += 1) {
    const rng = mulberry32(localSeed);
    const solution = generateSolvedGrid(rng);
    const givenCounts = buildOddGivenCounts(TARGET_GIVENS[difficulty], rng);
    const puzzle = buildPuzzleFromCounts(solution, givenCounts, rng);
    if (hasUniqueSolution(puzzle)) {
      return {
        seed: localSeed,
        difficulty,
        solution,
        puzzle,
        givens: puzzle.map((row) => row.map((v) => v !== null)),
        givenCountsByDigit: countDigitsInPuzzle(puzzle),
      };
    }
    localSeed += 1;
  }
  throw new Error("Failed to generate unique pair-and-place Sudoku.");
}

function buildOddGivenCounts(target: number, rng: () => number): Record<number, number> {
  // We keep odd given counts per digit so missing counts are even, enabling strict tile pairing later.
  const counts: Record<number, number> = Object.fromEntries(
    Array.from({ length: 9 }, (_, i) => [i + 1, 1]),
  ) as Record<number, number>;

  let remaining = target - 9;
  while (remaining > 0) {
    const digit = Math.floor(rng() * 9) + 1;
    if (counts[digit] <= 7) {
      counts[digit] += 2;
      remaining -= 2;
    }
  }
  return counts;
}

function buildPuzzleFromCounts(
  solution: SudokuGrid,
  countsByDigit: Record<number, number>,
  rng: () => number,
): Array<Array<number | null>> {
  const puzzle: Array<Array<number | null>> = Array.from({ length: 9 }, () => Array(9).fill(null));
  const positionsByDigit = new Map<number, Array<{ row: number; col: number }>>();

  for (let row = 0; row < 9; row += 1) {
    for (let col = 0; col < 9; col += 1) {
      const digit = solution[row][col];
      const list = positionsByDigit.get(digit) ?? [];
      list.push({ row, col });
      positionsByDigit.set(digit, list);
    }
  }

  for (let digit = 1; digit <= 9; digit += 1) {
    const positions = shuffle(rng, positionsByDigit.get(digit) ?? []);
    const take = countsByDigit[digit];
    for (let i = 0; i < take; i += 1) {
      const pos = positions[i];
      puzzle[pos.row][pos.col] = digit;
    }
  }

  return puzzle;
}

export function hasUniqueSolution(puzzle: Array<Array<number | null>>): boolean {
  const board = puzzle.map((row) => row.map((v) => v ?? 0));
  return countSolutions(board, 2) === 1;
}

function countSolutions(board: SudokuGrid, limit: number): number {
  const next = findEmpty(board);
  if (!next) return 1;
  const [row, col] = next;
  let count = 0;
  for (let value = 1; value <= 9; value += 1) {
    if (!isLegal(board, row, col, value)) continue;
    board[row][col] = value;
    count += countSolutions(board, limit - count);
    board[row][col] = 0;
    if (count >= limit) return count;
  }
  return count;
}

function findEmpty(board: SudokuGrid): [number, number] | null {
  for (let row = 0; row < 9; row += 1) {
    for (let col = 0; col < 9; col += 1) {
      if (board[row][col] === 0) return [row, col];
    }
  }
  return null;
}

function isLegal(board: SudokuGrid, row: number, col: number, value: number): boolean {
  for (let i = 0; i < 9; i += 1) {
    if (board[row][i] === value || board[i][col] === value) return false;
  }
  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;
  for (let r = boxRow; r < boxRow + 3; r += 1) {
    for (let c = boxCol; c < boxCol + 3; c += 1) {
      if (board[r][c] === value) return false;
    }
  }
  return true;
}

export function countDigitsInPuzzle(puzzle: Array<Array<number | null>>): Record<number, number> {
  const counts: Record<number, number> = Object.fromEntries(
    Array.from({ length: 9 }, (_, i) => [i + 1, 0]),
  ) as Record<number, number>;
  for (let row = 0; row < 9; row += 1) {
    for (let col = 0; col < 9; col += 1) {
      const value = puzzle[row][col];
      if (value) counts[value] += 1;
    }
  }
  return counts;
}
