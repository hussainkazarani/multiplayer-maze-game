import { saveCompletedRoomResults } from '../db/database.js';
import * as ModelManager from '../core/model-manager.js';
import config from '../../shared/config.js';

export function handleGameEvents(socket, io) {
    // on navigating, setup to join the game
    socket.on('game:join', (username, roomName) => {
        console.log(`(B) Setting up backend variables and sending rooms, creator`);

        if (!ModelManager.model.rooms[roomName]) {
            console.log(`(B) Room ${roomName} does not exist. Redirecting ${username} to rooms.`);

            // Tell frontend to clear localStorage.room and go back to rooms page
            socket.emit('game:room-not-found');
            return; // stop further execution
        }

        socket.data.username = username;
        socket.data.room = roomName;
        socket.data.disconnectStatus = 0;
        console.log(`username is ${username} and room is ${roomName}`);
        // Add username to online users if not already present
        if (!ModelManager.model.users.includes(username)) {
            ModelManager.model.users.push(username);
            console.log(`${username} added to online users`);
            io.emit('player:set-online-status', ModelManager.model.users);
        }

        socket.join(roomName);

        const isCreator = ModelManager.isRoomCreator(socket.data.username, socket.data.room);

        if (ModelManager.model.rooms[roomName].status == 'live') {
            socket.emit('game:creator-status', ModelManager.model.rooms[socket.data.room], false);
            return;
        }
        socket.emit('game:creator-status', ModelManager.model.rooms[socket.data.room], isCreator);
    });

    // setting positions of players
    socket.on('player:get-update', (state) => {
        ModelManager.model.rooms[socket.data.room].players[socket.data.username].update(state);
        // send to everyone
        io.to(socket.data.room).emit('player:set-update', {
            username: socket.data.username,
            playerState: ModelManager.model.rooms[socket.data.room].players[socket.data.username],
        });
    });

    // request a new flag and remove old
    socket.on('game:request-flags', ({ count, lastCollected }) => {
        const roomName = socket.data.room;
        const room = ModelManager.model.rooms[roomName];

        // 1. Remove collected flag if provided
        if (lastCollected) ModelManager.removeActiveFlag(roomName, lastCollected.row, lastCollected.col);

        // 2. Spawn new flags (up to count, from pool)
        ModelManager.addActiveFlag(count, roomName);

        // 3. Broadcast the full state
        io.to(roomName).emit('game:update-flags', {
            activeFlags: room.currentflagPositions,
        });
    });

    // verify creator on starting game and timer
    socket.on('game:verify', () => {
        const username = socket.data.username;
        const room = socket.data.room;

        const creatorCheck = ModelManager.isRoomCreator(username, room);
        if (creatorCheck) {
            const roomObj = ModelManager.model.rooms[room];

            // start game and send initial duration
            io.to(room).emit('game:start', { duration: roomObj.duration });
            roomObj.status = 'live';
            io.emit('room:set-list', ModelManager.model.rooms); // update for pple in rooms
            const timerInterval = setInterval(() => {
                roomObj.duration--;
                // console.log(roomObj.duration);
                if (roomObj.duration > 0) {
                    io.to(room).emit('game:timer', roomObj.duration);
                } else {
                    clearInterval(timerInterval);

                    // convert into list of { username, flags } objects
                    let results = Object.keys(roomObj.players).map((player) => ({
                        username: player,
                        flags: roomObj.players[player].flagsCollected,
                    }));
                    // sort descending by flags
                    results.sort((a, b) => b.flags - a.flags);

                    io.to(room).emit('game:end', results); // notify game over
                }
            }, 1000);
        }
    });

    // delete game on server-side model
    socket.on('game:delete', async (results) => {
        const username = socket.data.username;
        const room = socket.data.room;
        const playerResult = results.find((result) => result.username === username);

        console.log(`(B) 🗑️ Deleted game removed user: ${username} in room: ${room}`);
        await saveCompletedRoomResults(playerResult, room, config.duration);
        ModelManager.removeGame(room);
        io.emit('room:set-list', ModelManager.model.rooms);
        socket.leave(room); // keeps connection alive unlike socket.disconnect()
        socket.data.room = null;
    });

    // disconnect logic
    // if its the games page, and its the creator, and the game isn't live, kick everyone
    socket.on('disconnect', () => {
        const { username, room } = socket.data;

        if (socket.data.disconnectStatus == 0 && room && username) {
            const roomData = ModelManager.model.rooms[room];

            // check if the user is inside any room
            if (roomData && roomData.players[username]) {
                // Remove user from online list
                ModelManager.model.users = ModelManager.model.users.filter((u) => u !== username);
                io.emit('player:set-online-status', ModelManager.model.users);

                // if creator disconnected and game hasn't started
                const isCreator = roomData.creator === username;
                const notLive = roomData.status !== 'live';

                if (isCreator && notLive) {
                    console.log(`(B) Creator disconnected before game started, deleting room: ${room}`);

                    // notify all players in the room to go back to rooms page
                    io.to(room).emit('game:early-deletion');

                    // delete the room
                    delete ModelManager.model.rooms[room];
                    io.emit('room:set-list', ModelManager.model.rooms);
                }
            }
        }
    });
}
