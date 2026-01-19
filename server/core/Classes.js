import config from '../../shared/config.js';

// cell class for server-side
export class Cell {
    constructor(x, y) {
        this.x = x; //column
        this.y = y; //row
        this.size = config.cellSize;

        this.walkable = false;
        this.visited = false;
        this.color = '#FFFCF2';
    }
}

// maze class for server-side
export class Maze {
    constructor(columns, rows) {
        this.columns = columns;
        this.rows = rows;
        this.cellsMatrix = [];
    }

    initializeCells() {
        this.cellsMatrix = [];
        //cellsMatrix[y][x] = cellsMatrix[i][j]
        for (let row = 0; row < this.rows; row++) {
            this.cellsMatrix[row] = [];
            for (let col = 0; col < this.columns; col++) {
                this.cellsMatrix[row][col] = new Cell(col, row); //Cell(x,y)
            }
        }
    }
}

// flag class for server-side
export class Flag {
    constructor() {
        this.amount = config.flagAmount;
        this.url = config.flagURL;
    }

    generateRandomPosition(availableCells) {
        let positions = [];
        const pool = [...availableCells]; // copy so we can modify safely

        for (let i = 0; i < this.amount && pool.length > 0; i++) {
            const index = Math.floor(Math.random() * pool.length);
            const cell = pool.splice(index, 1)[0]; // remove so it’s not reused
            positions.push(cell);
        }
        return positions;
    }
}
