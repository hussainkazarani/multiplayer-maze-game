const socket = io();

const p1Elements = document.getElementsByClassName('p1');
const p2Elements = document.getElementsByClassName('p2');

const p1 = p1Elements.length > 0 ? p1Elements[0] : null;
const p2 = p2Elements.length > 0 ? p2Elements[0] : null;
let internalNavigation = false;

// onload
window.addEventListener('load', () => {
    const username = localStorage.getItem('playerToken');
    if (username == null) {
        redirectToHome();
        return;
    }
    if (!p1 && !p2) return;
    socket.emit('other:set-backend-username', username);
    socket.emit('player-stats:get', username);
});

// getting the data
socket.on('player-stats:data', (data) => {
    console.log(`(F) Received player statistics`);
    // PROFILE STATS
    if (p1) {
        p1.innerHTML = ''; // clear previous content
        if (!data || !data.player) {
            p1.innerHTML = `<p class="test-1">No profile data</p>`;
        } else {
            const player = data.player;

            p1.innerHTML = `
                <div class="player-profile-p1">
                    <img src="/client/public/icons/item-1.svg" />
                    <p><span class="label">Username:</span> <span class="value">${player.username}</span></p>
                </div>
                <div class="player-profile-p2">
                    <img src="/client/public/icons/item-2.svg" />
                    <p><span class="label">Total Flags:</span> <span class="value">${player.total_flags}</span></p>
                </div>
                <div class="player-profile-p3">
                    <img src="/client/public/icons/item-3.svg" />
                    <p><span class="label">Games Played:</span> <span class="value">${player.games_played}</span></p>
                </div>
                <div class="player-profile-p4">
                    <img src="/client/public/icons/item-4.svg" />
                    <p><span class="label">Account Created:</span> <span class="value">${new Date(
                        player.created_at,
                    ).toLocaleString()}</span></p>
                </div>
            `;
        }
    }

    // GAME HISTORY
    if (p2) {
        p2.innerHTML = ''; // clear previous games
        if (!data || !data.game || data.game.length === 0) {
            const noGames = document.createElement('p');
            noGames.classList.add('test-1');
            noGames.textContent = 'No games played';
            p2.appendChild(noGames);
        } else {
            data.game.forEach((game) => {
                const container = document.createElement('div');
                container.classList.add('container');

                container.innerHTML = `
                    <p><span class="value2 name1">${game.room}</span></p>
                    <p><span class="label2">Flags Collected:</span> <span class="value2">${game.flags}</span></p>
                    <p><span class="label2">Played:</span> <span class="value2">${new Date(
                        game.created,
                    ).toLocaleString()}</span></p>
                `;

                p2.appendChild(container);
            });
        }
    }
});

// clicking on the back button
document.querySelector('.backbtn').addEventListener('click', () => {
    internalNavigation = true;
    if (verifyPlayer()) navigateWithFade('/client/src/pages/rooms/rooms.html');
});

// send a signal to the server to remove the player
window.addEventListener('beforeunload', (event) => {
    if (!internalNavigation) {
        console.log('Removed LocalStorage in player statistics');
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

    // backend check with callback
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
    window.location.replace('/client/src/pages/home/home.html');
}
