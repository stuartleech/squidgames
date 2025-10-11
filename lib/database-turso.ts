import { createClient } from '@libsql/client';
import { Team, Game, Tournament, Rules } from '@/types';

const TURSO_URL = 'libsql://squidgames-stuartleech.aws-eu-west-1.turso.io';
const TURSO_AUTH_TOKEN = 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NjAxNzU4NDEsImlkIjoiMzRiOGY3NTItYWE1Zi00NWRlLWIyOGItYTk2NTBlZDBhMDI2IiwicmlkIjoiM2NjNWUzZjktMTJmNS00M2U1LWFlMjEtNDhmYTI0YTRkYWRlIn0.sD7AXWxEpLfqLx4TLs0wiRBUZxl6lggjh5W-iY9JJRdQY7Mra7PpTwUjw4l8IPHt0qQDw0Fy6ciYg4f6t3GvDA';

const client = createClient({
  url: TURSO_URL,
  authToken: TURSO_AUTH_TOKEN,
});

// Initialize tables
async function initializeTables() {
  await client.execute(`
    CREATE TABLE IF NOT EXISTS teams (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      color TEXT NOT NULL,
      wins INTEGER DEFAULT 0,
      losses INTEGER DEFAULT 0,
      pointsFor INTEGER DEFAULT 0,
      pointsAgainst INTEGER DEFAULT 0,
      logo TEXT
    )
  `);

  await client.execute(`
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
    )
  `);

  await client.execute(`
    CREATE TABLE IF NOT EXISTS rules (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      section TEXT NOT NULL,
      order_index INTEGER NOT NULL
    )
  `);
  
  console.log('[TursoDB] Tables initialized');
}

// Initialize tables on load
initializeTables().catch(console.error);

export const dbOperations = {
  // Teams
  createTeam: async (team: Omit<Team, 'id'>) => {
    const result = await client.execute({
      sql: 'INSERT INTO teams (name, color, wins, losses, pointsFor, pointsAgainst, logo) VALUES (?, ?, ?, ?, ?, ?, ?)',
      args: [team.name, team.color, team.wins, team.losses, team.pointsFor, team.pointsAgainst, team.logo || null]
    });
    return { changes: 1, lastInsertRowid: Number(result.lastInsertRowid) };
  },

  getAllTeams: async () => {
    const result = await client.execute('SELECT * FROM teams');
    return result.rows as any[];
  },

  getTeamById: async (id: number) => {
    const result = await client.execute({
      sql: 'SELECT * FROM teams WHERE id = ?',
      args: [id]
    });
    return result.rows[0] as any;
  },

  updateTeam: async (id: number, updates: Partial<Team>) => {
    const fields = Object.keys(updates).filter(key => key !== 'id');
    const values = fields.map(field => (updates as any)[field]);
    const setClause = fields.map(field => `${field} = ?`).join(', ');
    const result = await client.execute({
      sql: `UPDATE teams SET ${setClause} WHERE id = ?`,
      args: [...values, id]
    });
    return { changes: Number(result.rowsAffected) };
  },

  deleteTeam: async (id: number) => {
    const result = await client.execute({
      sql: 'DELETE FROM teams WHERE id = ?',
      args: [id]
    });
    return { changes: Number(result.rowsAffected) };
  },

  // Games
  createGame: async (game: Omit<Game, 'id'>) => {
    const result = await client.execute({
      sql: 'INSERT INTO games (homeTeamId, awayTeamId, homeScore, awayScore, scheduledTime, field, status, half, timeRemaining, isTimerRunning, referee) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      args: [
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
      ]
    });
    return { changes: 1, lastInsertRowid: Number(result.lastInsertRowid) };
  },

  getAllGames: async () => {
    const result = await client.execute(`
      SELECT 
        g.*,
        ht.name as homeTeamName,
        ht.color as homeTeamColor,
        ht.logo as homeTeamLogo,
        at.name as awayTeamName,
        at.color as awayTeamColor,
        at.logo as awayTeamLogo
      FROM games g
      LEFT JOIN teams ht ON g.homeTeamId = ht.id
      LEFT JOIN teams at ON g.awayTeamId = at.id
    `);
    return result.rows as any[];
  },

  getGameById: async (id: number) => {
    const result = await client.execute({
      sql: 'SELECT * FROM games WHERE id = ?',
      args: [id]
    });
    return result.rows[0] as any;
  },

  updateGame: async (id: number, updates: Partial<Game>) => {
    const fields = Object.keys(updates).filter(key => key !== 'id');
    const values = fields.map(field => (updates as any)[field]);
    const setClause = fields.map(field => `${field} = ?`).join(', ');
    const result = await client.execute({
      sql: `UPDATE games SET ${setClause} WHERE id = ?`,
      args: [...values, id]
    });
    return { changes: Number(result.rowsAffected) };
  },

  deleteGame: async (id: number) => {
    const result = await client.execute({
      sql: 'DELETE FROM games WHERE id = ?',
      args: [id]
    });
    return { changes: Number(result.rowsAffected) };
  },

  // Tournaments
  createTournament: async (tournament: Omit<Tournament, 'id'>) => {
    return { changes: 1, lastInsertRowid: 1 };
  },

  getAllTournaments: async () => {
    return [];
  },

  // Rules
  createRule: async (rule: Omit<Rules, 'id'>) => {
    const result = await client.execute({
      sql: 'INSERT INTO rules (title, content, section, order_index) VALUES (?, ?, ?, ?)',
      args: [rule.title, rule.content, rule.section, rule.order]
    });
    return { changes: 1, lastInsertRowid: Number(result.lastInsertRowid) };
  },

  getAllRules: async () => {
    const result = await client.execute('SELECT * FROM rules ORDER BY order_index');
    return result.rows as any[];
  },

  getRuleById: async (id: number) => {
    const result = await client.execute({
      sql: 'SELECT * FROM rules WHERE id = ?',
      args: [id]
    });
    return result.rows[0] as any;
  },

  updateRule: async (id: number, updates: Partial<Rules>) => {
    const fields = Object.keys(updates).filter(key => key !== 'id');
    const values = fields.map(field => (updates as any)[field]);
    const setClause = fields.map(field => `${field} = ?`).join(', ');
    const result = await client.execute({
      sql: `UPDATE rules SET ${setClause} WHERE id = ?`,
      args: [...values, id]
    });
    return { changes: Number(result.rowsAffected) };
  },

  deleteRule: async (id: number) => {
    const result = await client.execute({
      sql: 'DELETE FROM rules WHERE id = ?',
      args: [id]
    });
    return { changes: Number(result.rowsAffected) };
  },
};

