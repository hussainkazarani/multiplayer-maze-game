import { state } from '../modules/state.js';

const timerHUD = new Image();
const flagHUD = new Image();
timerHUD.src = '/client/public/images/hud-timer.png';
flagHUD.src = '/client/public/images/hud-flag.png';

const imgSize = 32;

export class HUD {
    constructor() {
        this.timerHUD = timerHUD;
        this.flagHUD = flagHUD;
    }

    drawTimerUI(ctx) {
        ctx.font = '24px Outfit';
        ctx.fillStyle = 'white';
        ctx.textAlign = 'start';
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 3;
        const text = state.timerDuration != null ? `Timer: ${state.timerDuration}` : 'Timer: -';

        ctx.drawImage(this.timerHUD, 10, 8, imgSize, imgSize);
        ctx.strokeText(text, 10 + imgSize + 5, 32);
        ctx.fillText(text, 10 + imgSize + 5, 32);
    }

    drawPlayerFlags(ctx, playerFlags) {
        ctx.font = '24px Outfit';
        ctx.fillStyle = 'white';
        ctx.textAlign = 'start';
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 3;
        const text = `Flags: ${playerFlags}`;

        ctx.drawImage(this.flagHUD, 10, 50, imgSize, imgSize);
        ctx.strokeText(text, 10 + imgSize + 5, 72);
        ctx.fillText(text, 10 + imgSize + 5, 72);
    }
}
