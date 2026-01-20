import fs from 'fs';
import path from 'path';
import * as ModelManager from '../core/model-manager.js';

// serves any type of file
export async function serveStaticFile(res, filePath) {
    if (!fs.existsSync(filePath)) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Not found' }));
        return;
    }

    try {
        const data = await fs.promises.readFile(filePath);
        const contentType = getContentType(filePath);
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(data);
    } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'internal server error' }));
    }
}

// helper for parsing body in node
export function parseRequestBody(req) {
    return new Promise((resolve, reject) => {
        let body = '';
        req.on('data', (chunk) => (body += chunk.toString()));
        req.on('end', () => {
            try {
                resolve(JSON.parse(body));
            } catch (err) {
                reject(err);
            }
        });
        req.on('error', (err) => reject(err));
    });
}

// get the content type for url path
export function getContentType(filePath) {
    const ext = path.extname(filePath);
    const type = {
        '.html': 'text/html',
        '.css': 'text/css',
        '.js': 'application/javascript',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.ttf': 'font/ttf',
        '.woff': 'font/woff',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml',
    };
    return type[ext] || 'text/html';
}

// remove player and any rooms they created
export async function handlePlayerDisconnect(req, res, io) {
    try {
        const { username } = await parseRequestBody(req);

        if (username) {
            ModelManager.removePlayer(username, io);
            console.log('(B) Succesfully removed any player data');
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: '(B) Player removed successfully' }));
    } catch (err) {
        console.error('Failed to remove player:', err);
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: '(E) Invalid request' }));
    }
}
