import config from '../../../shared/config.js';

const tileCell = new Image();
const wallCell = new Image();
tileCell.src = '/client/public/images/tile.png';
wallCell.src = '/client/public/images/wall.png';

export class Cell {
    constructor(x, y, number = null) {
        this.x = x; //column
        this.y = y; //row
        this.size = config.cellSize;

        this.walkable = false; // default to non-walkable
        this.color = '#000000'; // default color
        this.number = number;
    }

    draw(ctx) {
        if (!tileCell.complete || !wallCell.complete) return;
        let srcX = 0;
        let srcY = 0;
        let tileSize = 80;
        const xPos = this.x * this.size;
        const yPos = this.y * this.size;
        let image = this.walkable ? tileCell : wallCell;
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(image, srcX, srcY, tileSize, tileSize, xPos, yPos, this.size, this.size);
    }
}

// old fillRect()
//  this.color = this.walkable ? 'white' : 'pink';
//     ctx.fillStyle = this.color;
//     ctx.fillRect(this.x, this.y, this.size, this.size);
