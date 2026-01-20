// generating a random maze
export class MazeGenerator {
    constructor(maze) {
        this.maze = maze;
    }

    generateRandomMaze() {
        const rows = this.maze.rows;
        const columns = this.maze.columns;

        // step 1: randomly fill maze
        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < columns; x++) {
                this.maze.cellsMatrix[y][x].walkable = Math.random() < 0.7;
            }
        }

        // step 2: flood-fill to identify connected walkable regions
        const visited = Array.from({ length: rows }, () => Array(columns).fill(false));

        const floodFill = (x, y) => {
            if (x < 0 || x >= columns || y < 0 || y >= rows || !this.maze.cellsMatrix[y][x].walkable || visited[y][x]) {
                return;
            }
            visited[y][x] = true;
            floodFill(x + 1, y);
            floodFill(x - 1, y);
            floodFill(x, y + 1);
            floodFill(x, y - 1);
        };

        // Start flood-fill from the first walkable cell
        outer: for (let y = 0; y < rows; y++) {
            for (let x = 0; x < columns; x++) {
                if (this.maze.cellsMatrix[y][x].walkable) {
                    floodFill(x, y);
                    break outer;
                }
            }
        }

        // step 3: remove isolated walkable cells
        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < columns; x++) {
                if (this.maze.cellsMatrix[y][x].walkable && !visited[y][x]) {
                    this.maze.cellsMatrix[y][x].walkable = false;
                }
            }
        }
    }
}
