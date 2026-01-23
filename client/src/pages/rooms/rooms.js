import { socket, validateName } from '../../globals/global.js';
import config from '../../../../shared/config.js';

const createBtn = document.getElementById('create-game');
const inputRoom = document.getElementById('input-create-game');
const activity = document.querySelector('.online-players');
let resetTimeout;
let internalNavigation = false;

// create button click
createBtn.addEventListener('click', () => {
    internalNavigation = true;
    if (verifyPlayer()) {
        if (inputRoom.value.length > 0) {
            if (!validateName(inputRoom.value.trim())) {
                inputRoom.style.border = '2px solid #8f3d3d';
                inputRoom.style.backgroundColor = '#e0b8b8';
                // remove after 3 seconds
                clearTimeout(resetTimeout);
                resetTimeout = setTimeout(() => {
                    inputRoom.style.border = '';
                    inputRoom.style.backgroundColor = '';
                }, 3000);
                return;
            }
            socket.emit('room:check-availability', inputRoom.value);
        }
    }
});

// on load
window.addEventListener('load', () => {
    let localStorageUsername = localStorage.getItem('playerToken');
    if (localStorageUsername == null) {
        redirectToHome();
        return;
    }
    socket.emit('player:set-username', localStorageUsername);
    socket.emit('player:add-to-db');
    socket.emit('room:get-list');
    socket.emit('player:get-online-status');
});

// if room is already taken
socket.on('room:taken', () => {
    console.log(`(F) Received room status (not available)`);
    inputRoom.style.border = '2px solid #8f3d3d';
    inputRoom.style.backgroundColor = '#e0b8b8';
    clearTimeout(resetTimeout);
    resetTimeout = setTimeout(() => {
        inputRoom.style.border = '';
        inputRoom.style.backgroundColor = '';
    }, 4000);
});

// if room is available
socket.on('room:available', () => {
    if (verifyPlayer()) {
        console.log(`(F) Received room status (available)`);
        let localStorageUsername = localStorage.getItem('playerToken');
        socket.emit('room:create', localStorageUsername, inputRoom.value);
        localStorage.setItem('room', inputRoom.value);
        console.log('(F) Going to room: ' + inputRoom.value);
        navigateWithFade('/client/src/pages/game/game.html');
    }
});

// showing all online players
socket.on('player:set-online-status', (players) => {
    console.log(`(F) Successfully received online players`);
    activity.innerHTML = '';
    players.forEach((player) => {
        // wrapper for each player
        const wrapper = document.createElement('div');
        wrapper.className = 'player-item-wrapper';

        // green online dot
        const dot = document.createElement('div');
        dot.className = 'online-dot';

        // player name
        const p = document.createElement('p');
        p.className = 'player-item';
        p.textContent = player;

        wrapper.appendChild(dot);
        wrapper.appendChild(p);

        activity.appendChild(wrapper);
    });
});

// showing all rooms
socket.on('room:set-list', (rooms) => {
    console.log(`(F) Successfully received rooms list`);
    const cardsDiv = document.querySelector('.cards-grid');
    cardsDiv.innerHTML = '';

    Object.keys(rooms).forEach((room) => {
        // create card container
        const card = document.createElement('div');
        card.className = 'cardOfGame';

        // top row: game name + players
        const topRow = document.createElement('div');
        topRow.className = 'card-p1';

        const gameName = document.createElement('p');
        gameName.className = 'game-name';
        gameName.id = 'game-number';
        gameName.textContent = room;

        const playerCount = document.createElement('p');
        playerCount.className = 'game-numbers';
        playerCount.id = 'game-player';
        playerCount.textContent = `${Object.keys(rooms[room].players).length}/${config.maxPlayers}`;

        topRow.appendChild(gameName);
        topRow.appendChild(playerCount);

        // creator
        const creator = document.createElement('p');
        creator.className = 'game-creator';
        creator.id = 'game-creator';
        creator.textContent = `Started By: ${rooms[room].creator}`;

        const joinBtn = document.createElement('button');
        joinBtn.className = 'game-join';
        joinBtn.id = 'game-join-button';
        joinBtn.textContent = 'Join';

        if (rooms[room].status === 'live') {
            joinBtn.style.backgroundColor = '#b8e0b8';
            joinBtn.style.border = '2px solid #3d8f3d';
            joinBtn.style.color = 'black';
            joinBtn.textContent = 'In Progress';
            joinBtn.disabled = true;
            joinBtn.style.cursor = 'not-allowed';
        }

        joinBtn.addEventListener('click', () => {
            internalNavigation = true;
            if (verifyPlayer()) {
                let localStorageUsername = localStorage.getItem('playerToken');
                localStorage.setItem('room', room);
                console.log(`(F) Going to room: ${room}`);
                socket.emit('room:join', localStorageUsername, room);
                navigateWithFade('/client/src/pages/game/game.html');
            }
        });

        // append all to card
        card.appendChild(topRow);
        card.appendChild(creator);
        card.appendChild(joinBtn);

        // append card to grid
        cardsDiv.appendChild(card);
    });
});

// leaderboards button
const leaderboardBtn = document.getElementById('leaderboardBtn');
leaderboardBtn.addEventListener('click', () => {
    internalNavigation = true;
    if (verifyPlayer()) {
        console.log(`(F) Going to leaderboads`);
        navigateWithFade('/client/src/pages/leaderboards/leaderboards.html');
    }
});

// player-stats button
const playerBtn = document.getElementById('playerBtn');
playerBtn.addEventListener('click', () => {
    internalNavigation = true;
    if (verifyPlayer()) {
        console.log(`(F) Going to player statistics`);
        navigateWithFade('/client/src/pages/player-stats/player-stats.html');
    }
});

// ==== RELOAD ====
// Send a signal to the server to remove the player
window.addEventListener('beforeunload', (event) => {
    if (!internalNavigation) {
        console.log('Removed LocalStorage in rooms');
        navigator.sendBeacon('/api/remove-player', JSON.stringify({ username: localStorage.getItem('playerToken') }));
        localStorage.clear();
    }
});

// verify the LocalStorage and server-side value of username
async function verifyPlayer() {
    // no token
    const token = localStorage.getItem('playerToken');
    if (!token) {
        redirectToHome();
        return false;
    }

    // server-side check with callback
    socket.emit('player:verify-backend', token, (backendUsername, exists) => {
        if (!exists) {
            console.log(`Backend username is ${backendUsername} so its ${exists}`);
            navigator.sendBeacon('/api/remove-player', JSON.stringify({ username: backendUsername }));
            redirectToHome();
        }
    });
    return true;
}

// clear data and go to home
function redirectToHome() {
    localStorage.clear();
    navigateWithFade('/client/src/pages/home/home.html');
}
