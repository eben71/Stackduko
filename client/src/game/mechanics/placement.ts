export type Grid = Array<Array<number | null>>;

export function canPlaceValue(grid: Grid, row: number, col: number, value: number): boolean {
  // RULES.md Section 5: tokens can only be placed in empty cells.
  if (grid[row][col] !== null) return false;
  for (let i = 0; i < 9; i += 1) {
    // RULES.md Section 5: enforce row and column constraints.
    if (grid[row][i] === value || grid[i][col] === value) return false;
  }
  const br = Math.floor(row / 3) * 3;
  const bc = Math.floor(col / 3) * 3;
  for (let r = br; r < br + 3; r += 1) {
    for (let c = bc; c < bc + 3; c += 1) {
      // RULES.md Section 5: enforce 3x3 box constraint.
      if (grid[r][c] === value) return false;
    }
  }
  return true;
}

export function legalCellsForValue(grid: Grid, value: number) {
  const cells: Array<{ row: number; col: number }> = [];
  for (let row = 0; row < 9; row += 1) {
    for (let col = 0; col < 9; col += 1) {
      if (canPlaceValue(grid, row, col, value)) cells.push({ row, col });
    }
  }
  return cells;
}
