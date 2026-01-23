import { animate } from '../pages/game/game.js';
import { canvas } from './canvas-setup.js';
import { state } from './state.js';
import { sendPlayerUpdate } from './utilities.js';
import { Maze } from '../classes/Maze.js';
import { FlagManager } from '../classes/Flag.js';
import { Player } from '../classes/Player.js';
import { CollisionManager } from '../classes/CollisionManager.js';
import { CameraManager } from '../classes/CameraManager.js';
import { HUD } from '../classes/HUD.js';
import config from '../../../shared/config.js';

export function setupCanvas(roomData) {
    let username = localStorage.getItem('playerToken');
    state.timerDuration = roomData.timerDuration;

    state.maze = new Maze();
    state.maze.loadData(roomData.maze);

    state.flagManager = new FlagManager();
    state.flagManager.activeFlags = roomData.currentflagPositions;

    state.allPlayers = roomData.players;
    state.player = new Player(roomData.players[username]);

    state.buffer = createBuffer(state.maze.rows * config.cellSize, state.maze.columns * config.cellSize);
    state.bufferCtx = state.buffer.getContext('2d');
    state.maze.drawCells(state.bufferCtx);

    state.collisionManager = new CollisionManager(state.maze, state.flagManager);
    state.camera = new CameraManager(canvas);
    state.hud = new HUD();

    sendPlayerUpdate();
    animate();
}

export function createBuffer(width, height) {
    const buf = document.createElement('canvas');
    buf.width = width;
    buf.height = height;
    return buf;
}
