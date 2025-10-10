import { Team, Game, Tournament, Rules } from '@/types';

// Check if we're in a serverless environment (Netlify or Vercel)
const isNetlify = !!process.env.NETLIFY;
const isVercel = !!process.env.VERCEL;
const isLocal = !isNetlify && !isVercel;

let dbOperations: any;

if (isNetlify) {
  // Use Netlify Blobs for persistent storage on Netlify
  const { dbOperations: blobsOps } = require('./database-blobs');
  dbOperations = blobsOps;
} else if (isVercel) {
  // Use in-memory database for Vercel (or configure Vercel Postgres)
  const { dbOperations: serverlessOps } = require('./database-serverless');
  dbOperations = serverlessOps;
} else {
  // Use SQLite for local development
  try {
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
      
      CREATE TABLE IF NOT EXISTS rules (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        section TEXT NOT NULL,
        order_index INTEGER NOT NULL
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
      deleteTeam: (id: number) => {
        const stmt = db.prepare('DELETE FROM teams WHERE id = ?');
        return stmt.run(id);
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
        deleteGame: (id: number) => {
          const stmt = db.prepare('DELETE FROM games WHERE id = ?');
          return stmt.run(id);
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

      // Rules
      createRule: (rule: Omit<Rules, 'id'>) => {
        const stmt = db.prepare(`
          INSERT INTO rules (title, content, section, order_index)
          VALUES (?, ?, ?, ?)
        `);
        return stmt.run(rule.title, rule.content, rule.section, rule.order);
      },

      getAllRules: () => {
        const stmt = db.prepare('SELECT * FROM rules ORDER BY order_index');
        return stmt.all();
      },

      getRuleById: (id: number) => {
        const stmt = db.prepare('SELECT * FROM rules WHERE id = ?');
        return stmt.get(id);
      },

      updateRule: (id: number, updates: Partial<Rules>) => {
        const fields = Object.keys(updates).filter(key => key !== 'id');
        const values = fields.map(field => (updates as any)[field]);
        const setClause = fields.map(field => `${field} = ?`).join(', ');
        const stmt = db.prepare(`UPDATE rules SET ${setClause} WHERE id = ?`);
        return stmt.run(...values, id);
      },

      deleteRule: (id: number) => {
        const stmt = db.prepare('DELETE FROM rules WHERE id = ?');
        return stmt.run(id);
      },
    };
  } catch (error) {
    console.error('Failed to initialize SQLite database, falling back to in-memory:', error);
    // Fallback to in-memory database
    const { dbOperations: serverlessOps } = require('./database-serverless');
    dbOperations = serverlessOps;
  }
}

export { dbOperations };