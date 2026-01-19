//#region
/*
Model: {
  users: ["alice", "bob"],

  rooms: {
    "roomName": {
      players: {
        "alice": { x: 0, y: 0, flagsCollected: 0,color: "#FFO000" },
        "bob":   { x: 1, y: 0, flagsCollected: 0, color: "#0OFF00" }
      },
	  duration: 60,
	  status: "live/idle",
	  allflagPositions: [],
	  currentflagPositions: [],
      maze: [][][][],
	  creator: "Alice"
    }
  }
}
*/
//#endregion

import config from '../../shared/config.js';

// entire data model for server-side
class Model {
    constructor() {
        this.users = [];
        this.rooms = {};
    }

    addUser(name) {
        this.users.push(name);
    }

    addRoom(name, maze, creatorName, allflagPositions) {
        this.rooms[name] = new Room(maze, creatorName, allflagPositions);
    }
}

// room class inside data model
class Room {
    constructor(maze, creatorName, allflagPositions) {
        this.players = {};
        this.duration = config.timer;
        this.status = 'idle';
        this.allflagPositions = allflagPositions;
        this.currentflagPositions = [];
        this.maze = maze;
        this.creator = creatorName;
    }

    addPlayer(name, x, y, color) {
        this.players[name] = new Player(x, y, color);
    }
}

// player class inside data model
class Player {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.flagsCollected = 0;
        this.color = color;
    }

    update(state) {
        this.x = state.x;
        this.y = state.y;
        this.flagsCollected = state.flagsCollected;
        this.color = state.color;
    }
}

export const model = new Model();
