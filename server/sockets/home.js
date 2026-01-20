import * as ModelManager from '../core/model-manager.js';

export function handleHomeEvents(socket) {
    // check username for online players (Model.users)
    socket.on('player:check-username', (username) => {
        const available = ModelManager.isUsernameAvailable(username);
        console.log(`(B) Player name availability: ${available}`);
        socket.emit(available ? 'player:username-available' : 'player:username-taken');
    });
}
