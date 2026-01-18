import http from 'http';
import path from 'path';
import dotenv from 'dotenv';
import { handleHomeEvents } from './sockets/home.js';
import { handleRoomOnLoadEvents } from './sockets/room-load.js';
import { handleRoomOnClickEvents } from './sockets/room-click.js';
import { handleOtherEvents } from './sockets/other.js';
import { handleGameEvents } from './sockets/game.js';
import { Server } from 'socket.io';
import { verifyDbConnection } from './db/database.js';
import { serveStaticFile, handlePlayerDisconnect } from './services/utilities.js';

// handlePlayerDisconnect
dotenv.config({ path: '../.env' });
const PORT = process.env.PORT;
console.log(`Port for Node.js is: ${PORT}`);

const __filename = import.meta.filename;
const __dirname = import.meta.dirname;
const basePath = path.dirname(__dirname);

const server = http.createServer(async (req, res) => {
    // api routes
    if (req.method === 'POST' && req.url.startsWith('/api/remove-player')) {
        return handlePlayerDisconnect(req, res, io);
    }

    // static files
    let filePath = '';
    if (req.url === '/' && req.method === 'GET') {
        filePath = path.join(basePath, 'client', 'src', 'pages', 'home', 'home.html');
    } else {
        filePath = path.join(basePath, req.url);
    }
    await serveStaticFile(res, filePath);
});

const io = new Server(server);
io.on('connection', (socket) => {
    handleHomeEvents(socket);
    handleRoomOnLoadEvents(socket, io);
    handleRoomOnClickEvents(socket, io);
    handleGameEvents(socket, io);
    handleOtherEvents(socket, io);
});

server.listen(PORT, '0.0.0.0', async () => {
    await verifyDbConnection();
});
