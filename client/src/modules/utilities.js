import { socket } from '../globals/global.js';
import { setupCanvas } from './game-setup.js';
import { state } from './state.js';
import { setupSocketHandlers } from './socket-handler.js';

// on load
export function onLoad(startBtn) {
    let username = localStorage.getItem('playerToken');
    let room = localStorage.getItem('room');

    //join room with socket and check creator status
    socket.emit('game:join', username, room);
    console.log(`(F) ${username} has joined room: ${room}`);
    setupSocketHandlers(startBtn);
}

// after getting the creator variable
export function onCreatorStatus(currentRoomData, isCreator, startBtn) {
    console.log(`(F) Received isCreator Status: ${isCreator}`);
    if (isCreator) startBtn.classList.add('show');
    console.log(`(F) Received room data`);
    setupCanvas(currentRoomData);
}

// get new flags to spawn
export function spawnFlags(count, lastCollected = null) {
    socket.emit('game:request-flags', { count, lastCollected });
}

// showing the end game screen
export function showLeaveScreen(results) {
    let playerScores = '';
    let heading = '<h2 class="popupheading">🏆 LEADERBOARDS</h2>';
    let button = '<button id="button1" class="popup-btn">Leave</button>';
    results.forEach((player, index) => {
        const isCurrentUser = player.username === localStorage.getItem('playerToken');
        const style = isCurrentUser ? 'style="color: green; font-weight: bold;"' : '';

        playerScores += ` <p class="popup-item" ${style}>${index + 1}. ${player.username} - ${player.flags} flags </p>`;
    });

    let template = heading + playerScores + button;

    document.querySelector('.popup-menu').innerHTML = template;
    document.getElementById('popup').classList.remove('hidden');
    cancelAnimationFrame(state.animationID);

    document.getElementById('button1').addEventListener('click', () => {
        navigateWithFade('/client/src/pages/rooms/rooms.html');
    });
}

// remove room data and go to home
export function redirectToHomeWithLocalStorage() {
    localStorage.removeItem('room');
    navigateWithFade('/client/src/pages/rooms/rooms.html');
}

// send player co-ordinates
export function sendPlayerUpdate() {
    const playerState = state.player.getState();
    socket.emit('player:get-update', playerState);
}
