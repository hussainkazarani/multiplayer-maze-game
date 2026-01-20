import { fetchLeaderboards, fetchPlayerHistory } from '../db/database.js';

export function handleOtherEvents(socket) {
    // leaderboards data
    socket.on('leaderboard:get', async () => {
        console.log(`(B) Sending leaderboards`);
        const leaderboards = await fetchLeaderboards();
        socket.emit('leaderboard:data', leaderboards);
    });

    // player statistics
    socket.on('player-stats:get', async (username) => {
        console.log(`(B) Sending player statistics`);
        const history = await fetchPlayerHistory(username);
        socket.emit('player-stats:data', history);
    });

    // setting the server-side socket name
    socket.on('other:set-backend-username', (username) => {
        console.log(`(B) Setting backend username`);
        socket.data.username = username;
    });

    // verify username in server-side
    socket.on('player:verify-backend', (username, callback) => {
        const exists = socket.data.username === username;
        callback(socket.data.username, exists);
    });
}
