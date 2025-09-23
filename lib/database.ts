import { Team, Game, Tournament } from '@/types';

// Check if we're in a serverless environment
const isServerless = process.env.VERCEL || process.env.NETLIFY || process.env.NODE_ENV === 'production';

let dbOperations: any;

if (isServerless) {
  // Use in-memory database for serverless deployment
  const { dbOperations: serverlessOps } = require('./database-serverless');
  dbOperations = serverlessOps;
} else {
  // Use SQLite for local development
  const Database = require('better-sqlite3');
  const db = new Database('tournament.db');

  // Create tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS teams (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      color TEXT NOT NULL,
      wins INTEGER DEFAULT 0,
      losses INTEGER DEFAULT 0,
      pointsFor INTEGER DEFAULT 0,
      pointsAgainst INTEGER DEFAULT 0,
      logo TEXT
    );
    
    CREATE TABLE IF NOT EXISTS games (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      homeTeamId INTEGER NOT NULL,
      awayTeamId INTEGER NOT NULL,
      homeScore INTEGER,
      awayScore INTEGER,
      scheduledTime TEXT NOT NULL,
      field TEXT NOT NULL,
      status TEXT DEFAULT 'scheduled',
      half INTEGER DEFAULT 1,
      timeRemaining INTEGER DEFAULT 900,
      isTimerRunning BOOLEAN DEFAULT FALSE,
      referee TEXT,
      FOREIGN KEY (homeTeamId) REFERENCES teams (id),
      FOREIGN KEY (awayTeamId) REFERENCES teams (id)
    );
    
    CREATE TABLE IF NOT EXISTS tournaments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      startDate TEXT NOT NULL,
      endDate TEXT NOT NULL
    );
  `);

  dbOperations = {
    // Teams
    createTeam: (team: Omit<Team, 'id'>) => {
      const stmt = db.prepare(`
        INSERT INTO teams (name, color, wins, losses, pointsFor, pointsAgainst, logo)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      return stmt.run(
        team.name,
        team.color,
        team.wins,
        team.losses,
        team.pointsFor,
        team.pointsAgainst,
        team.logo || null
      );
    },

    getAllTeams: () => {
      const stmt = db.prepare('SELECT * FROM teams');
      return stmt.all();
    },

    getTeamById: (id: number) => {
      const stmt = db.prepare('SELECT * FROM teams WHERE id = ?');
      return stmt.get(id);
    },

    updateTeam: (id: number, updates: Partial<Team>) => {
      const fields = Object.keys(updates).filter(key => key !== 'id');
      const values = fields.map(field => (updates as any)[field]);
      const setClause = fields.map(field => `${field} = ?`).join(', ');
      const stmt = db.prepare(`UPDATE teams SET ${setClause} WHERE id = ?`);
      return stmt.run(...values, id);
    },

    // Games
    createGame: (game: Omit<Game, 'id'>) => {
      const stmt = db.prepare(`
        INSERT INTO games (homeTeamId, awayTeamId, homeScore, awayScore, scheduledTime, field, status, half, timeRemaining, isTimerRunning, referee)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      return stmt.run(
        game.homeTeamId,
        game.awayTeamId,
        game.homeScore,
        game.awayScore,
        game.scheduledTime,
        game.field,
        game.status,
        (game as any).half || 1,
        (game as any).timeRemaining || 900,
        (game as any).isTimerRunning ? 1 : 0, // Convert boolean to 0 or 1
        (game as any).referee || null
      );
    },

    getAllGames: () => {
      const stmt = db.prepare(`
        SELECT g.*, 
               ht.name as homeTeamName, ht.color as homeTeamColor, ht.logo as homeTeamLogo,
               at.name as awayTeamName, at.color as awayTeamColor, at.logo as awayTeamLogo
        FROM games g
        JOIN teams ht ON g.homeTeamId = ht.id
        JOIN teams at ON g.awayTeamId = at.id
        ORDER BY g.scheduledTime
      `);
      return stmt.all();
    },

    getGameById: (id: number) => {
      const stmt = db.prepare(`
        SELECT g.*, 
               ht.name as homeTeamName, ht.color as homeTeamColor, ht.logo as homeTeamLogo,
               at.name as awayTeamName, at.color as awayTeamColor, at.logo as awayTeamLogo
        FROM games g
        JOIN teams ht ON g.homeTeamId = ht.id
        JOIN teams at ON g.awayTeamId = at.id
        WHERE g.id = ?
      `);
      return stmt.get(id);
    },

    updateGame: (id: number, game: Partial<Game>) => {
      const fields = Object.keys(game).filter(key => key !== 'id');
      const values = fields.map(field => {
        if (field === 'isTimerRunning') {
          return (game as any)[field] ? 1 : 0; // Convert boolean to 0 or 1
        }
        return (game as any)[field];
      });
      const setClause = fields.map(field => `${field} = ?`).join(', ');
      const stmt = db.prepare(`UPDATE games SET ${setClause} WHERE id = ?`);
      return stmt.run(...values, id);
    },

    // Tournaments
    createTournament: (tournament: Omit<Tournament, 'id'>) => {
      const stmt = db.prepare(`
        INSERT INTO tournaments (name, startDate, endDate)
        VALUES (?, ?, ?)
      `);
      return stmt.run(tournament.name, tournament.startDate, tournament.endDate);
    },

    getAllTournaments: () => {
      const stmt = db.prepare('SELECT * FROM tournaments');
      return stmt.all();
    },

    getTournamentById: (id: number) => {
      const stmt = db.prepare('SELECT * FROM tournaments WHERE id = ?');
      return stmt.get(id);
    },

    updateTournament: (id: number, updates: Partial<Tournament>) => {
      const fields = Object.keys(updates).filter(key => key !== 'id');
      const values = fields.map(field => (updates as any)[field]);
      const setClause = fields.map(field => `${field} = ?`).join(', ');
      const stmt = db.prepare(`UPDATE tournaments SET ${setClause} WHERE id = ?`);
      return stmt.run(...values, id);
    },
  };
}

export { dbOperations };