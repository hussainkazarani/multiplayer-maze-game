import { socket } from '../../globals/global.js';
import { state } from '../../modules/state.js';
import { ctx, canvas } from '../../modules/canvas-setup.js';
import { onLoad, sendPlayerUpdate } from '../../modules/utilities.js';
import config from '../../../../shared/config.js';

const startBtn = document.getElementById('start-game-timer');
startBtn.addEventListener('click', () => socket.emit('game:verify'));
window.addEventListener('load', () => onLoad(startBtn));

// main animate function
export function animate() {
    clearScene();
    applyCamera();
    drawMaze();
    drawOtherPlayers();
    drawFlags();
    drawLocalPlayer();
    handleLocalPlayerMovement();
    resetCamera();
    drawHUD();
    state.animationID = requestAnimationFrame(animate);
}

// ========== HELPERS ==========
function clearScene() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function applyCamera() {
    state.camera.followPlayer(state.player);
    state.camera.applyTransform(ctx);
}

function drawMaze() {
    ctx.drawImage(state.buffer, 0, 0);
}

function drawOtherPlayers() {
    Object.keys(state.allPlayers).forEach((player) => {
        if (player === localStorage.getItem('playerToken')) return;
        const playerData = state.allPlayers[player];

        ctx.fillStyle = playerData.color;
        ctx.fillRect(playerData.x, playerData.y, config.playerSize, config.playerSize);
        ctx.fillStyle = 'pink';
        ctx.font = '12px Outfit';
        ctx.textAlign = 'center';
        ctx.fillText(player, playerData.x + config.playerSize / 2, playerData.y - 5);
    });
}

function drawFlags() {
    if (state.flagManager.activeFlags) {
        state.flagManager.draw(ctx);
    }
}

function drawLocalPlayer() {
    state.player.draw(ctx);
}

function resetCamera() {
    state.camera.resetTransform(ctx);
}

function drawHUD() {
    state.hud.drawTimerUI(ctx);
    state.hud.drawPlayerFlags(ctx, state.player.flagsCollected);
}

function handleLocalPlayerMovement() {
    const { newX, newY, oldX, oldY, moved } = state.player.getProposedMove();
    if (!moved) return;

    let finalX = newX;
    let finalY = newY;

    // horizontal movement & collision
    if (newX !== oldX) {
        const direction = newX > oldX ? 'right' : 'left';
        if (!state.collisionManager.canMove(newX, oldY, state.player.playerSize)) {
            finalX = state.collisionManager.getCollisionAdjustedPosition(direction, oldX, newX, oldY);
        }
    }

    // vertical movement & collision
    if (newY !== oldY) {
        const direction = newY > oldY ? 'down' : 'up';
        if (!state.collisionManager.canMove(finalX, newY, state.player.playerSize)) {
            finalY = state.collisionManager.getCollisionAdjustedPosition(direction, oldY, newY, finalX);
        }
    }

    // apply movement
    if (finalX !== state.player.x || finalY !== state.player.y) {
        const collectedFlag = state.collisionManager.checkFlagCollision(finalX, finalY, config.playerSize);
        if (collectedFlag) {
            state.player.flagsCollected++;
            socket.emit('game:request-flags', { count: 1, lastCollected: collectedFlag });
        }

        state.player.setPosition(finalX, finalY);
        sendPlayerUpdate();
    }
}
