import { type Grid } from "./placement";

export type ClearResult = {
    clearedCells: { row: number; col: number }[];
    clearedLines: number;
};

export function evaluateAndClearGrid(grid: Grid): ClearResult {
    const toClear = new Set<string>();
    let lines = 0;

    // Check rows
    for (let r = 0; r < 9; r += 1) {
        let rowFull = true;
        for (let c = 0; c < 9; c += 1) {
            if (grid[r][c] === null) {
                rowFull = false;
                break;
            }
        }
        if (rowFull) {
            lines += 1;
            for (let c = 0; c < 9; c += 1) toClear.add(`${r},${c}`);
        }
    }

    // Check cols
    for (let c = 0; c < 9; c += 1) {
        let colFull = true;
        for (let r = 0; r < 9; r += 1) {
            if (grid[r][c] === null) {
                colFull = false;
                break;
            }
        }
        if (colFull) {
            lines += 1;
            for (let r = 0; r < 9; r += 1) toClear.add(`${r},${c}`);
        }
    }

    // Check 3x3 blocks
    for (let br = 0; br < 3; br += 1) {
        for (let bc = 0; bc < 3; bc += 1) {
            let blockFull = true;
            for (let i = 0; i < 3; i += 1) {
                for (let j = 0; j < 3; j += 1) {
                    if (grid[br * 3 + i][bc * 3 + j] === null) {
                        blockFull = false;
                        break;
                    }
                }
                if (!blockFull) break;
            }
            if (blockFull) {
                lines += 1;
                for (let i = 0; i < 3; i += 1) {
                    for (let j = 0; j < 3; j += 1) {
                        toClear.add(`${br * 3 + i},${bc * 3 + j}`);
                    }
                }
            }
        }
    }

    const clearedCells: { row: number; col: number }[] = [];
    toClear.forEach((key) => {
        const [r, c] = key.split(",").map(Number);
        clearedCells.push({ row: r, col: c });
        grid[r][c] = null;
    });

    return { clearedCells, clearedLines: lines };
}
