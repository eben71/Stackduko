// Simple Sudoku Generator and Solver
// Using backtracking algorithm

export const BLANK = 0;

export function isValid(board: number[][], row: number, col: number, num: number): boolean {
  // Check row
  for (let x = 0; x < 9; x++) {
    if (board[row][x] === num) return false;
  }

  // Check col
  for (let x = 0; x < 9; x++) {
    if (board[x][col] === num) return false;
  }

  // Check 3x3 box
  const startRow = row - (row % 3);
  const startCol = col - (col % 3);
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (board[i + startRow][j + startCol] === num) return false;
    }
  }

  return true;
}

export function solveSudoku(board: number[][]): boolean {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (board[row][col] === BLANK) {
        for (let num = 1; num <= 9; num++) {
          if (isValid(board, row, col, num)) {
            board[row][col] = num;
            if (solveSudoku(board)) return true;
            board[row][col] = BLANK;
          }
        }
        return false;
      }
    }
  }
  return true;
}

export function generateSudoku(difficulty: "easy" | "medium" | "hard" = "medium"): number[][] {
  void difficulty;
  // 1. Start with empty board
  const board = Array(9)
    .fill(null)
    .map(() => Array(9).fill(BLANK));

  // 2. Fill diagonal boxes (independent, valid) to ensure randomness
  for (let i = 0; i < 9; i = i + 3) {
    fillBox(board, i, i);
  }

  // 3. Solve the rest to get a complete valid board
  solveSudoku(board);

  return board;
}

function fillBox(board: number[][], row: number, col: number) {
  let num: number;
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      do {
        num = Math.floor(Math.random() * 9) + 1;
      } while (!isSafeInBox(board, row, col, num));
      board[row + i][col + j] = num;
    }
  }
}

function isSafeInBox(board: number[][], rowStart: number, colStart: number, num: number): boolean {
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (board[rowStart + i][colStart + j] === num) return false;
    }
  }
  return true;
}
