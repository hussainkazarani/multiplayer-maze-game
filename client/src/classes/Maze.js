import config from '../../../shared/config.js';
import { Cell } from './Cell.js';

export class Maze {
    constructor() {
        this.columns = config.cols;
        this.rows = config.rows;
        this.cellsMatrix = [];
    }

    loadData(mazeData) {
        this.cellsMatrix = [];
        for (let row = 0; row < this.rows; row++) {
            this.cellsMatrix[row] = [];
            for (let col = 0; col < this.columns; col++) {
                const cellData = mazeData[row][col];
                const cell = new Cell(cellData.x, cellData.y, `[${row},${col}]`);
                // mark as walkable if the backend considers it part of the maze path
                cell.walkable = cellData.walkable ?? false;
                this.cellsMatrix[row][col] = cell;
            }
        }
    }

    drawCells(ctx) {
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.columns; col++) {
                this.cellsMatrix[row][col].draw(ctx);
            }
        }
    }
}
