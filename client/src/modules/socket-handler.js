import { socket } from '../globals/global.js';
import { state } from './state.js';
import { onCreatorStatus, redirectToHomeWithLocalStorage, showLeaveScreen, spawnFlags } from './utilities.js';
import config from '../../../shared/config.js';

export function setupSocketHandlers(startBtn) {
    socket.on('game:creator-status', (roomData, isCreator) => onCreatorStatus(roomData, isCreator, startBtn));

    socket.on('player:set-update', ({ username, playerState }) => (state.allPlayers[username] = playerState));

    socket.on('game:update-flags', ({ activeFlags }) => (state.flagManager.activeFlags = activeFlags));

    socket.on('game:start', ({ duration }) => {
        startBtn.classList.remove('show');
        state.timerDuration = duration;
        spawnFlags(config.spawnFlags);
    });

    socket.on('game:timer', (duration) => (state.timerDuration = duration));

    socket.on('game:end', (results) => {
        console.log('🔚 Game ended, final player states:');
        console.log('🏆 Sorted results:', JSON.stringify(results, null, 2));

        localStorage.removeItem('room');
        showLeaveScreen(results);

        // tell server to delete the game room
        socket.emit('game:delete', results);
    });

    socket.on('game:early-deletion', () => redirectToHomeWithLocalStorage());

    socket.on('game:room-not-found', () => redirectToHomeWithLocalStorage());
}
