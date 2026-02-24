import { describe, it, expect } from "vitest";
import { evaluateAndClearGrid } from "../../../client/src/game/mechanics/gridClear";
import type { Grid } from "../../../client/src/game/mechanics/placement";

const createEmptyGrid = (): Grid => Array.from({ length: 9 }, () => Array(9).fill(null));

describe("gridClear mechanics", () => {
    it("should not clear an empty grid", () => {
        const grid = createEmptyGrid();
        const result = evaluateAndClearGrid(grid);
        expect(result.clearedLines).toBe(0);
        expect(result.clearedCells.length).toBe(0);
    });

    it("should clear a full row", () => {
        const grid = createEmptyGrid();
        for (let c = 0; c < 9; c += 1) {
            grid[1][c] = c + 1;
        }

        const result = evaluateAndClearGrid(grid);
        expect(result.clearedLines).toBe(1);
        expect(result.clearedCells.length).toBe(9);
        for (let c = 0; c < 9; c += 1) {
            expect(grid[1][c]).toBeNull();
        }
    });

    it("should clear a full column", () => {
        const grid = createEmptyGrid();
        for (let r = 0; r < 9; r += 1) {
            grid[r][2] = r + 1;
        }

        const result = evaluateAndClearGrid(grid);
        expect(result.clearedLines).toBe(1);
        expect(result.clearedCells.length).toBe(9);
        for (let r = 0; r < 9; r += 1) {
            expect(grid[r][2]).toBeNull();
        }
    });

    it("should clear a full 3x3 block", () => {
        const grid = createEmptyGrid();
        let val = 1;
        for (let r = 3; r < 6; r += 1) {
            for (let c = 6; c < 9; c += 1) {
                grid[r][c] = val;
                val += 1;
            }
        }

        const result = evaluateAndClearGrid(grid);
        expect(result.clearedLines).toBe(1);
        expect(result.clearedCells.length).toBe(9);
        expect(grid[3][6]).toBeNull();
        expect(grid[5][8]).toBeNull();
    });
});
