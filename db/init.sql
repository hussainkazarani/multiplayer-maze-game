-- create players table
CREATE TABLE players (
    username VARCHAR(20) PRIMARY KEY,
    total_flags INTEGER DEFAULT 0,
    games_played INTEGER DEFAULT 0,
    rooms_played TEXT[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- create matches table
CREATE TABLE matches (
    id SERIAL PRIMARY KEY,
    username VARCHAR(20) NOT NULL,
    room_name VARCHAR(20) NOT NULL,
    flags INTEGER NOT NULL DEFAULT 0,
    game_time VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (username) REFERENCES players(username)
);
