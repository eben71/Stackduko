import { shuffle } from "@/logic/rng";
import { isPlacementLegal, type SudokuGrid } from "@/logic/sudoku/validate";

export function createEmptyGrid(): SudokuGrid {
  return Array.from({ length: 9 }, () => Array(9).fill(0));
}

export function cloneGrid(grid: SudokuGrid): SudokuGrid {
  return grid.map((row) => [...row]);
}

export function generateSolvedGrid(rng: () => number): SudokuGrid {
  const grid = createEmptyGrid();
  fillGrid(grid, rng);
  return grid;
}

function fillGrid(grid: SudokuGrid, rng: () => number): boolean {
  for (let row = 0; row < 9; row += 1) {
    for (let col = 0; col < 9; col += 1) {
      if (grid[row][col] === 0) {
        const numbers = shuffle(rng, [1, 2, 3, 4, 5, 6, 7, 8, 9]);
        for (const value of numbers) {
          if (isPlacementLegal(grid, row, col, value)) {
            grid[row][col] = value;
            if (fillGrid(grid, rng)) return true;
            grid[row][col] = 0;
          }
        }
        return false;
      }
    }
  }
  return true;
}
