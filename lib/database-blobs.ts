import { getStore } from '@netlify/blobs';
import { Team, Game, Tournament, Rules } from '@/types';

// Netlify Blobs-based persistent database
class BlobsDatabase {
  private store: any;

  constructor() {
    // Initialize store - Netlify automatically provides credentials in serverless functions
    try {
      this.store = getStore('squidgames-db');
      console.log('[BlobsDB] Store initialized successfully');
    } catch (error) {
      console.error('[BlobsDB] Failed to initialize store:', error);
      this.store = null;
    }
  }

  private async getData<T>(key: string, defaultValue: T): Promise<T> {
    try {
      if (!this.store) return defaultValue;
      const data = await this.store.get(key, { type: 'json' });
      return data || defaultValue;
    } catch (error) {
      console.error(`Error reading ${key}:`, error);
      return defaultValue;
    }
  }

  private async setData(key: string, value: any): Promise<void> {
    try {
      if (!this.store) return;
      await this.store.setJSON(key, value);
    } catch (error) {
      console.error(`Error writing ${key}:`, error);
    }
  }

  // Teams
  async createTeam(team: Omit<Team, 'id'>): Promise<{ changes: number; lastInsertRowid: number }> {
    const teams = await this.getData<Team[]>('teams', []);
    const newId = teams.length > 0 ? Math.max(...teams.map(t => t.id)) + 1 : 1;
    const newTeam = { ...team, id: newId };
    teams.push(newTeam);
    await this.setData('teams', teams);
    return { changes: 1, lastInsertRowid: newId };
  }

  async getAllTeams(): Promise<Team[]> {
    return await this.getData<Team[]>('teams', []);
  }

  async getTeamById(id: number): Promise<Team | undefined> {
    const teams = await this.getAllTeams();
    return teams.find(t => t.id === id);
  }

  async updateTeam(id: number, updates: Partial<Team>): Promise<{ changes: number }> {
    const teams = await this.getAllTeams();
    const index = teams.findIndex(t => t.id === id);
    if (index !== -1) {
      teams[index] = { ...teams[index], ...updates };
      await this.setData('teams', teams);
      return { changes: 1 };
    }
    return { changes: 0 };
  }

  async deleteTeam(id: number): Promise<{ changes: number }> {
    const teams = await this.getAllTeams();
    const filteredTeams = teams.filter(t => t.id !== id);
    if (filteredTeams.length < teams.length) {
      await this.setData('teams', filteredTeams);
      // Also delete games involving this team
      const games = await this.getAllGames();
      const filteredGames = games.filter(g => g.homeTeamId !== id && g.awayTeamId !== id);
      await this.setData('games', filteredGames);
      return { changes: 1 };
    }
    return { changes: 0 };
  }

  // Games
  async createGame(game: Omit<Game, 'id'>): Promise<{ changes: number; lastInsertRowid: number }> {
    const games = await this.getData<Game[]>('games', []);
    const newId = games.length > 0 ? Math.max(...games.map(g => g.id)) + 1 : 1;
    const newGame = { ...game, id: newId };
    games.push(newGame);
    await this.setData('games', games);
    return { changes: 1, lastInsertRowid: newId };
  }

  async getAllGames(): Promise<any[]> {
    const games = await this.getData<Game[]>('games', []);
    const teams = await this.getAllTeams();
    
    return games.map(game => {
      const homeTeam = teams.find(t => t.id === game.homeTeamId);
      const awayTeam = teams.find(t => t.id === game.awayTeamId);
      return {
        ...game,
        homeTeamName: homeTeam?.name,
        homeTeamColor: homeTeam?.color,
        homeTeamLogo: homeTeam?.logo,
        awayTeamName: awayTeam?.name,
        awayTeamColor: awayTeam?.color,
        awayTeamLogo: awayTeam?.logo,
      };
    });
  }

  async getGameById(id: number): Promise<Game | undefined> {
    const games = await this.getData<Game[]>('games', []);
    return games.find(g => g.id === id);
  }

  async updateGame(id: number, updates: Partial<Game>): Promise<{ changes: number }> {
    const games = await this.getData<Game[]>('games', []);
    const index = games.findIndex(g => g.id === id);
    if (index !== -1) {
      games[index] = { ...games[index], ...updates };
      await this.setData('games', games);
      return { changes: 1 };
    }
    return { changes: 0 };
  }

  async deleteGame(id: number): Promise<{ changes: number }> {
    const games = await this.getData<Game[]>('games', []);
    const filteredGames = games.filter(g => g.id !== id);
    if (filteredGames.length < games.length) {
      await this.setData('games', filteredGames);
      return { changes: 1 };
    }
    return { changes: 0 };
  }

  // Tournaments
  async createTournament(tournament: Omit<Tournament, 'id'>): Promise<{ changes: number; lastInsertRowid: number }> {
    const tournaments = await this.getData<Tournament[]>('tournaments', []);
    const newId = tournaments.length > 0 ? Math.max(...tournaments.map(t => t.id)) + 1 : 1;
    const newTournament = { ...tournament, id: newId };
    tournaments.push(newTournament);
    await this.setData('tournaments', tournaments);
    return { changes: 1, lastInsertRowid: newId };
  }

  async getAllTournaments(): Promise<Tournament[]> {
    return await this.getData<Tournament[]>('tournaments', []);
  }

  // Rules
  async createRule(rule: Omit<Rules, 'id'>): Promise<{ changes: number; lastInsertRowid: number }> {
    const rules = await this.getData<Rules[]>('rules', []);
    const newId = rules.length > 0 ? Math.max(...rules.map(r => r.id)) + 1 : 1;
    const newRule = { ...rule, id: newId };
    rules.push(newRule);
    await this.setData('rules', rules);
    return { changes: 1, lastInsertRowid: newId };
  }

  async getAllRules(): Promise<Rules[]> {
    return await this.getData<Rules[]>('rules', []);
  }

  async getRuleById(id: number): Promise<Rules | undefined> {
    const rules = await this.getAllRules();
    return rules.find(r => r.id === id);
  }

  async updateRule(id: number, updates: Partial<Rules>): Promise<{ changes: number }> {
    const rules = await this.getAllRules();
    const index = rules.findIndex(r => r.id === id);
    if (index !== -1) {
      rules[index] = { ...rules[index], ...updates };
      await this.setData('rules', rules);
      return { changes: 1 };
    }
    return { changes: 0 };
  }

  async deleteRule(id: number): Promise<{ changes: number }> {
    const rules = await this.getAllRules();
    const filteredRules = rules.filter(r => r.id !== id);
    if (filteredRules.length < rules.length) {
      await this.setData('rules', filteredRules);
      return { changes: 1 };
    }
    return { changes: 0 };
  }
}

// Create singleton instance
const blobsDb = new BlobsDatabase();

// Export operations object matching the interface
export const dbOperations = {
  createTeam: (team: Omit<Team, 'id'>) => blobsDb.createTeam(team),
  getAllTeams: () => blobsDb.getAllTeams(),
  getTeamById: (id: number) => blobsDb.getTeamById(id),
  updateTeam: (id: number, updates: Partial<Team>) => blobsDb.updateTeam(id, updates),
  deleteTeam: (id: number) => blobsDb.deleteTeam(id),
  
  createGame: (game: Omit<Game, 'id'>) => blobsDb.createGame(game),
  getAllGames: () => blobsDb.getAllGames(),
  getGameById: (id: number) => blobsDb.getGameById(id),
  updateGame: (id: number, updates: Partial<Game>) => blobsDb.updateGame(id, updates),
  deleteGame: (id: number) => blobsDb.deleteGame(id),
  
  createTournament: (tournament: Omit<Tournament, 'id'>) => blobsDb.createTournament(tournament),
  getAllTournaments: () => blobsDb.getAllTournaments(),
  
  createRule: (rule: Omit<Rules, 'id'>) => blobsDb.createRule(rule),
  getAllRules: () => blobsDb.getAllRules(),
  getRuleById: (id: number) => blobsDb.getRuleById(id),
  updateRule: (id: number, updates: Partial<Rules>) => blobsDb.updateRule(id, updates),
  deleteRule: (id: number) => blobsDb.deleteRule(id),
};

