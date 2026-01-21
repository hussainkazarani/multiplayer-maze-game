import { keys } from '../modules/keybindings.js';
import config from '../../../shared/config.js';

export class Player {
    constructor(currentPlayer) {
        this.x = currentPlayer.x;
        this.y = currentPlayer.y;
        this.flagsCollected = currentPlayer.flagsCollected;
        this.color = currentPlayer.color;
        this.speed = config.playerSpeed;
        this.playerSize = config.playerSize;
        this.collectedFlags = []; // only for sending to backend
    }

    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.playerSize, this.playerSize);
        ctx.fillStyle = 'white';
        ctx.font = '12px Outfit';
        ctx.textAlign = 'center';
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 3;
        const text = localStorage.getItem('playerToken');

        ctx.strokeText(text, this.x + this.playerSize / 2, this.y - 5);
        ctx.fillText(text, this.x + this.playerSize / 2, this.y - 5);
    }

    getState() {
        return { x: this.x, y: this.y, flagsCollected: this.flagsCollected, color: this.color };
    }

    // instead of moving directly, just propose a move
    getProposedMove() {
        let dx = 0;
        let dy = 0;

        // store current position as old position before calculating new one
        this.oldX = this.x;
        this.oldY = this.y;

        // calculate proposed movement based on key inputs
        if (keys.up) dy -= this.speed;
        if (keys.down) dy += this.speed;
        if (keys.left) dx -= this.speed;
        if (keys.right) dx += this.speed;

        const moved = dx !== 0 || dy !== 0;

        return {
            newX: this.x + dx,
            newY: this.y + dy,
            oldX: this.oldX,
            oldY: this.oldY,
            moved: moved,
        };
    }

    addCollectedFlag(flag) {
        this.collectedFlags.push(flag);
    }

    getLastCollectedFlag() {
        return this.collectedFlags.length > 0 ? this.collectedFlags[this.collectedFlags.length - 1] : null;
    }

    // only set position if allowed
    setPosition(x, y) {
        this.x = x;
        this.y = y;
    }
}
