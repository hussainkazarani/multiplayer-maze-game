import config from '../../../shared/config.js';

export class CameraManager {
    constructor(canvas, zoomLevel = 2) {
        this.zoom = zoomLevel;
        this.canvas = canvas;
    }

    applyTransform(ctx) {
        ctx.save();
        ctx.scale(this.zoom, this.zoom);
        ctx.translate(-this.offsetX, -this.offsetY); // makes the center point be in top left
    }

    resetTransform(ctx) {
        ctx.restore();
    }

    followPlayer(player) {
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;
        const mazeWidth = config.cols * config.cellSize;
        const mazeHeight = config.rows * config.cellSize;

        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        this.offsetX = player.x - centerX / this.zoom;
        this.offsetY = player.y - centerY / this.zoom;
        this.offsetX = Math.max(0, this.offsetX);
        this.offsetY = Math.max(0, this.offsetY);

        this.offsetX = Math.min(this.offsetX, mazeWidth - screenWidth / this.zoom + 1);
        this.offsetY = Math.min(this.offsetY, mazeHeight - screenHeight / this.zoom + 1);
    }
}
