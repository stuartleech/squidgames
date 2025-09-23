import Database from 'better-sqlite3';
import { Team, Game, Tournament } from '@/types';

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
    pointsAgainst INTEGER DEFAULT 0
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

// Database operations
export const dbOperations = {
  // Teams
  getAllTeams: () => {
    const stmt = db.prepare('SELECT * FROM teams ORDER BY name');
    return stmt.all() as Team[];
  },

  getTeamById: (id: number) => {
    const stmt = db.prepare('SELECT * FROM teams WHERE id = ?');
    return stmt.get(id) as Team;
  },

  createTeam: (team: Omit<Team, 'id'>) => {
    const stmt = db.prepare(`
      INSERT INTO teams (name, color, wins, losses, pointsFor, pointsAgainst)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    return stmt.run(team.name, team.color, team.wins, team.losses, team.pointsFor, team.pointsAgainst);
  },

  updateTeam: (id: number, team: Partial<Team>) => {
    const fields = Object.keys(team).filter(key => key !== 'id');
    const values = fields.map(field => team[field as keyof Team]);
    const setClause = fields.map(field => `${field} = ?`).join(', ');
    
    const stmt = db.prepare(`UPDATE teams SET ${setClause} WHERE id = ?`);
    return stmt.run(...values, id);
  },

  // Games
  getAllGames: () => {
    const stmt = db.prepare(`
      SELECT g.*, 
             ht.name as homeTeamName, ht.color as homeTeamColor,
             at.name as awayTeamName, at.color as awayTeamColor
      FROM games g
      LEFT JOIN teams ht ON g.homeTeamId = ht.id
      LEFT JOIN teams at ON g.awayTeamId = at.id
      ORDER BY g.scheduledTime
    `);
    return stmt.all() as any[];
  },

  getGameById: (id: number) => {
    const stmt = db.prepare(`
      SELECT g.*, 
             ht.name as homeTeamName, ht.color as homeTeamColor,
             at.name as awayTeamName, at.color as awayTeamColor
      FROM games g
      LEFT JOIN teams ht ON g.homeTeamId = ht.id
      LEFT JOIN teams at ON g.awayTeamId = at.id
      WHERE g.id = ?
    `);
    return stmt.get(id) as any;
  },

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
      (game as any).isTimerRunning ? 1 : 0,
      (game as any).referee || null
    );
  },

  updateGame: (id: number, game: Partial<Game>) => {
    const fields = Object.keys(game).filter(key => key !== 'id');
    const values = fields.map(field => game[field as keyof Game]);
    const setClause = fields.map(field => `${field} = ?`).join(', ');
    
    const stmt = db.prepare(`UPDATE games SET ${setClause} WHERE id = ?`);
    return stmt.run(...values, id);
  },

  updateGameScore: (id: number, homeScore: number, awayScore: number) => {
    const stmt = db.prepare(`
      UPDATE games 
      SET homeScore = ?, awayScore = ?, status = 'completed'
      WHERE id = ?
    `);
    return stmt.run(homeScore, awayScore, id);
  },

  // Tournaments
  getAllTournaments: () => {
    const stmt = db.prepare('SELECT * FROM tournaments ORDER BY startDate');
    return stmt.all() as Tournament[];
  },

  createTournament: (tournament: Omit<Tournament, 'id'>) => {
    const stmt = db.prepare(`
      INSERT INTO tournaments (name, startDate, endDate)
      VALUES (?, ?, ?)
    `);
    return stmt.run(tournament.name, tournament.startDate, tournament.endDate);
  }
};

export default db;
