import config from '../../../shared/config.js';

export class CollisionManager {
    constructor(maze, flagManager) {
        this.maze = maze;
        this.flagManager = flagManager;
    }

    // ======== FLAG COLLISION =========
    checkFlagCollision(playerX, playerY, playerSize) {
        // check if any corner of the player is colliding with a flag
        const corners = [
            { x: playerX, y: playerY }, // top-left
            { x: playerX + playerSize - 1, y: playerY }, // top-right
            { x: playerX, y: playerY + playerSize - 1 }, // bottom-left
            { x: playerX + playerSize - 1, y: playerY + playerSize - 1 }, // bottom-right
        ];

        for (const corner of corners) {
            const col = Math.floor(corner.x / config.cellSize);
            const row = Math.floor(corner.y / config.cellSize);

            const flagIndex = this.flagManager.activeFlags.findIndex((flag) => flag.row === row && flag.col === col);

            if (flagIndex !== -1) {
                const collectedFlag = this.flagManager.activeFlags.splice(flagIndex, 1)[0];
                console.log('Flag collected!');
                return collectedFlag;
            }
        }

        return false;
    }

    // ======== MAZE COLLISION =========
    canMove(x, y) {
        return this.isPositionWalkable(x, y);
    }

    isPositionWalkable(x, y) {
        // check all four corners
        const topLeft = this.isPointWalkable(x, y);
        const topRight = this.isPointWalkable(x + config.playerSize - 1, y); // -1 is to not go overbound to next cell
        const bottomLeft = this.isPointWalkable(x, y + config.playerSize - 1);
        const bottomRight = this.isPointWalkable(x + config.playerSize - 1, y + config.playerSize - 1);

        // all corners must be walkable
        return topLeft && topRight && bottomLeft && bottomRight;
    }

    isPointWalkable(pointX, pointY) {
        const col = Math.floor(pointX / config.cellSize);
        const row = Math.floor(pointY / config.cellSize);
        return this.isWalkable(col, row);
    }

    isWalkable(col, row) {
        if (row < 0 || row >= this.maze.rows || col < 0 || col >= this.maze.columns) return false;
        return this.maze.cellsMatrix[row][col].walkable;
    }

    // ======== COLLISION ADJUSTMENTS =========
    getCollisionAdjustedPosition(direction, oldPos, newPos, otherAxis) {
        switch (direction) {
            case 'right':
                return this.adjustRightMovement(oldPos, newPos, otherAxis);
            case 'left':
                return this.adjustLeftMovement(oldPos, newPos, otherAxis);
            case 'down':
                return this.adjustDownMovement(oldPos, newPos, otherAxis);
            case 'up':
                return this.adjustUpMovement(oldPos, newPos, otherAxis, config.playerSize);
            default:
                return newPos;
        }
    }

    adjustRightMovement(oldX, newX, y) {
        // get the column of the right edge from the safe old position
        const oldRightCol = Math.floor((oldX + config.playerSize - 1) / config.cellSize);

        // calculate the maximum x position that keeps player within walkable area
        // this ensures both top-right and bottom-right corners stay in walkable cells
        const maxX = (oldRightCol + 1) * config.cellSize - config.playerSize;

        return maxX;
    }

    adjustLeftMovement(oldX, newX, y) {
        // get the column of the left edge from the safe old position
        const oldLeftCol = Math.floor(oldX / config.cellSize);

        // calculate the minimum x position that keeps player within walkable area
        // this ensures both top-left and bottom-left corners stay in walkable cells
        const minX = oldLeftCol * config.cellSize;

        return minX;
    }

    adjustDownMovement(oldY, newY, x) {
        // get the row of the bottom edge from the safe old position
        const oldBottomRow = Math.floor((oldY + config.playerSize - 1) / config.cellSize);

        // calculate the maximum y position that keeps player within walkable area
        // this ensures both bottom-left and bottom-right corners stay in walkable cells
        const maxY = (oldBottomRow + 1) * config.cellSize - config.playerSize;

        return maxY;
    }

    adjustUpMovement(oldY, newY, x) {
        // get the row of the top edge from the safe old position
        const oldTopRow = Math.floor(oldY / config.cellSize);

        // calculate the minimum y position that keeps player within walkable area
        // this ensures both top-left and top-right corners stay in walkable cells
        const minY = oldTopRow * config.cellSize;

        return minY;
    }
}
