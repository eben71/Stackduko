export type SudokuGrid = number[][];

export function isCompleteGrid(grid: SudokuGrid): boolean {
  return grid.length === 9 && grid.every((row) => row.length === 9);
}

export function isValidSolution(grid: SudokuGrid): boolean {
  if (!isCompleteGrid(grid)) return false;
  for (let i = 0; i < 9; i += 1) {
    const row = grid[i];
    const col = grid.map((r) => r[i]);
    if (!isValidGroup(row)) return false;
    if (!isValidGroup(col)) return false;
  }
  for (let boxRow = 0; boxRow < 3; boxRow += 1) {
    for (let boxCol = 0; boxCol < 3; boxCol += 1) {
      const group: number[] = [];
      for (let r = 0; r < 3; r += 1) {
        for (let c = 0; c < 3; c += 1) {
          group.push(grid[boxRow * 3 + r][boxCol * 3 + c]);
        }
      }
      if (!isValidGroup(group)) return false;
    }
  }
  return true;
}

export function isPlacementLegal(grid: SudokuGrid, row: number, col: number, value: number): boolean {
  if (value < 1 || value > 9) return false;
  for (let i = 0; i < 9; i += 1) {
    if (grid[row][i] === value) return false;
    if (grid[i][col] === value) return false;
  }
  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;
  for (let r = 0; r < 3; r += 1) {
    for (let c = 0; c < 3; c += 1) {
      if (grid[boxRow + r][boxCol + c] === value) return false;
    }
  }
  return true;
}

export function getConflictCells(grid: SudokuGrid, row: number, col: number, value: number) {
  const conflicts: { row: number; col: number }[] = [];
  for (let i = 0; i < 9; i += 1) {
    if (grid[row][i] === value) conflicts.push({ row, col: i });
    if (grid[i][col] === value) conflicts.push({ row: i, col });
  }
  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;
  for (let r = 0; r < 3; r += 1) {
    for (let c = 0; c < 3; c += 1) {
      if (grid[boxRow + r][boxCol + c] === value) {
        conflicts.push({ row: boxRow + r, col: boxCol + c });
      }
    }
  }
  return conflicts;
}

function isValidGroup(values: number[]): boolean {
  if (values.length !== 9) return false;
  const sorted = [...values].sort((a, b) => a - b);
  return sorted.every((value, index) => value === index + 1);
}
