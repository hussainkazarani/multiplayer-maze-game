import config from '../../../shared/config.js';

const flagImage = new Image();
flagImage.src = config.flagURL;

export class FlagManager {
    constructor(frameCount = 5) {
        this.activeFlags = [];
        this.flagImage = flagImage;
        this.frameCount = frameCount;
        this.canvasPadding = 3;
    }

    getCurrentFrame() {
        const frameWidth = this.flagImage.width / this.frameCount;
        const frameIndex = Math.floor(Date.now() / 150) % this.frameCount;
        const sx = frameIndex * frameWidth;
        return { sx, sw: frameWidth };
    }

    draw(ctx) {
        if (!this.flagImage.complete) return;

        const { sx, sw } = this.getCurrentFrame();
        const drawSize = config.cellSize - 2 * this.canvasPadding;

        ctx.imageSmoothingEnabled = false;

        this.activeFlags.forEach((flag) => {
            ctx.drawImage(
                this.flagImage,
                sx,
                0,
                sw,
                this.flagImage.height,
                flag.col * config.cellSize + this.canvasPadding,
                flag.row * config.cellSize + this.canvasPadding,
                drawSize,
                drawSize,
            );
        });
    }
}
