import pkg from 'pg';
import config from '../../shared/config.js';
import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

const { Pool } = pkg;

// host: 'localhost', 'custom-postgres', 'host.docker.internal'
export const pool = new Pool({
    user: process.env.POSTGRES_USER,
    host: process.env.POSTGRES_HOST,
    database: process.env.POSTGRES_DB,
    password: process.env.POSTGRES_PASSWORD,
    port: Number(process.env.POSTGRES_PORT),
});

// helper for automatic client release
async function withClient(fn) {
    const client = await pool.connect();
    try {
        return await fn(client);
    } catch (error) {
        console.error('❌ Connection error:', error);
    } finally {
        client.release();
    }
}

// test database connection
export const verifyDbConnection = async () => {
    try {
        const client = await pool.connect();
        console.log('✅ Connected to PostgreSQL!');
        client.release();
    } catch (error) {
        console.error('❌ Connection error:', error);
    }
};

// ========== ROOM ==========
// add a player if he does not exist
export const insertPlayerIfNotExists = async (username) => {
    if (!username) {
        console.warn('Tried to insert player with null/empty username.');
        return;
    }
    const result = await pool.query(`INSERT INTO players (username) VALUES ($1) ON CONFLICT (username) DO NOTHING`, [
        username,
    ]);
    console.log(result.rowCount > 0 ? '(B) Player added to DB' : '(B) Player already exists in DB');
};

// ========== GAME ==========
// record completed room for each player (in their own client)
export const saveCompletedRoomResults = async (player, room, timer) =>
    withClient(async (client) => {
        await client.query(
            `INSERT INTO matches (username, room_name, flags, game_time)
         VALUES ($1, $2, $3, $4)`,
            [player.username, room, player.flags, config.timer],
        );

        await client.query(
            `UPDATE players
         SET total_flags = total_flags + $1,
             games_played = games_played + 1,
             rooms_played = array_append(rooms_played, $2)
         WHERE username = $3`,
            [player.flags, room, player.username],
        );
    });

// ========== OTHERS ==========
// get player info and match history
export const fetchPlayerHistory = async (username) =>
    withClient(async (client) => {
        const playerRes = await client.query(
            `SELECT username, total_flags, games_played, rooms_played, created_at
       FROM players WHERE username=$1`,
            [username],
        );

        const gamesRes = await client.query(
            `SELECT room_name, flags, game_time, created_at
       FROM matches WHERE username=$1 ORDER BY created_at DESC`,
            [username],
        );

        return {
            player: playerRes.rows[0],
            game: gamesRes.rows.map((g) => ({
                room: g.room_name,
                flags: g.flags,
                timer: g.game_time,
                created: g.created_at,
            })),
        };
    });

// get leaderboard ordered by total flags
export const fetchLeaderboards = async () => {
    const result = await pool.query(`SELECT * FROM players ORDER BY total_flags DESC`);
    return result.rows;
};
