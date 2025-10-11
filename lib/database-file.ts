import { Team, Game, Tournament, Rules } from '@/types';
import fs from 'fs';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'data', 'tournament-data.json');

interface TournamentData {
  teams: Team[];
  games: Game[];
  rules: Rules[];
}

// File-based database using JSON file
class FileDatabase {
  private getData(): TournamentData {
    try {
      const data = fs.readFileSync(DATA_FILE, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      console.error('[FileDB] Error reading data:', error);
      return { teams: [], games: [], rules: [] };
    }
  }

  private setData(data: TournamentData): void {
    try {
      fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
      console.log('[FileDB] Data saved successfully');
    } catch (error) {
      console.error('[FileDB] Error writing data:', error);
    }
  }

  // Teams
  async createTeam(team: Omit<Team, 'id'>): Promise<{ changes: number; lastInsertRowid: number }> {
    const data = this.getData();
    const newId = data.teams.length > 0 ? Math.max(...data.teams.map(t => t.id)) + 1 : 1;
    const newTeam = { ...team, id: newId };
    data.teams.push(newTeam);
    this.setData(data);
    return { changes: 1, lastInsertRowid: newId };
  }

  async getAllTeams(): Promise<Team[]> {
    return this.getData().teams;
  }

  async getTeamById(id: number): Promise<Team | undefined> {
    const data = this.getData();
    return data.teams.find(t => t.id === id);
  }

  async updateTeam(id: number, updates: Partial<Team>): Promise<{ changes: number }> {
    const data = this.getData();
    const index = data.teams.findIndex(t => t.id === id);
    if (index !== -1) {
      data.teams[index] = { ...data.teams[index], ...updates };
      this.setData(data);
      return { changes: 1 };
    }
    return { changes: 0 };
  }

  async deleteTeam(id: number): Promise<{ changes: number }> {
    const data = this.getData();
    const filteredTeams = data.teams.filter(t => t.id !== id);
    if (filteredTeams.length < data.teams.length) {
      data.teams = filteredTeams;
      data.games = data.games.filter(g => g.homeTeamId !== id && g.awayTeamId !== id);
      this.setData(data);
      return { changes: 1 };
    }
    return { changes: 0 };
  }

  // Games
  async createGame(game: Omit<Game, 'id'>): Promise<{ changes: number; lastInsertRowid: number }> {
    const data = this.getData();
    const newId = data.games.length > 0 ? Math.max(...data.games.map(g => g.id)) + 1 : 1;
    const newGame = { ...game, id: newId };
    data.games.push(newGame);
    this.setData(data);
    return { changes: 1, lastInsertRowid: newId };
  }

  async getAllGames(): Promise<any[]> {
    const data = this.getData();
    return data.games.map(game => {
      const homeTeam = data.teams.find(t => t.id === game.homeTeamId);
      const awayTeam = data.teams.find(t => t.id === game.awayTeamId);
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
    const data = this.getData();
    return data.games.find(g => g.id === id);
  }

  async updateGame(id: number, updates: Partial<Game>): Promise<{ changes: number }> {
    const data = this.getData();
    const index = data.games.findIndex(g => g.id === id);
    if (index !== -1) {
      data.games[index] = { ...data.games[index], ...updates };
      this.setData(data);
      return { changes: 1 };
    }
    return { changes: 0 };
  }

  async deleteGame(id: number): Promise<{ changes: number }> {
    const data = this.getData();
    const filteredGames = data.games.filter(g => g.id !== id);
    if (filteredGames.length < data.games.length) {
      data.games = filteredGames;
      this.setData(data);
      return { changes: 1 };
    }
    return { changes: 0 };
  }

  // Tournaments
  async createTournament(tournament: Omit<Tournament, 'id'>): Promise<{ changes: number; lastInsertRowid: number }> {
    return { changes: 1, lastInsertRowid: 1 };
  }

  async getAllTournaments(): Promise<Tournament[]> {
    return [];
  }

  // Rules
  async createRule(rule: Omit<Rules, 'id'>): Promise<{ changes: number; lastInsertRowid: number }> {
    const data = this.getData();
    const newId = data.rules.length > 0 ? Math.max(...data.rules.map(r => r.id)) + 1 : 1;
    const newRule = { ...rule, id: newId };
    data.rules.push(newRule);
    this.setData(data);
    return { changes: 1, lastInsertRowid: newId };
  }

  async getAllRules(): Promise<Rules[]> {
    return this.getData().rules;
  }

  async getRuleById(id: number): Promise<Rules | undefined> {
    const data = this.getData();
    return data.rules.find(r => r.id === id);
  }

  async updateRule(id: number, updates: Partial<Rules>): Promise<{ changes: number }> {
    const data = this.getData();
    const index = data.rules.findIndex(r => r.id === id);
    if (index !== -1) {
      data.rules[index] = { ...data.rules[index], ...updates };
      this.setData(data);
      return { changes: 1 };
    }
    return { changes: 0 };
  }

  async deleteRule(id: number): Promise<{ changes: number }> {
    const data = this.getData();
    const filteredRules = data.rules.filter(r => r.id !== id);
    if (filteredRules.length < data.rules.length) {
      data.rules = filteredRules;
      this.setData(data);
      return { changes: 1 };
    }
    return { changes: 0 };
  }
}

const fileDb = new FileDatabase();

export const dbOperations = {
  createTeam: (team: Omit<Team, 'id'>) => fileDb.createTeam(team),
  getAllTeams: () => fileDb.getAllTeams(),
  getTeamById: (id: number) => fileDb.getTeamById(id),
  updateTeam: (id: number, updates: Partial<Team>) => fileDb.updateTeam(id, updates),
  deleteTeam: (id: number) => fileDb.deleteTeam(id),
  
  createGame: (game: Omit<Game, 'id'>) => fileDb.createGame(game),
  getAllGames: () => fileDb.getAllGames(),
  getGameById: (id: number) => fileDb.getGameById(id),
  updateGame: (id: number, updates: Partial<Game>) => fileDb.updateGame(id, updates),
  deleteGame: (id: number) => fileDb.deleteGame(id),
  
  createTournament: (tournament: Omit<Tournament, 'id'>) => fileDb.createTournament(tournament),
  getAllTournaments: () => fileDb.getAllTournaments(),
  
  createRule: (rule: Omit<Rules, 'id'>) => fileDb.createRule(rule),
  getAllRules: () => fileDb.getAllRules(),
  getRuleById: (id: number) => fileDb.getRuleById(id),
  updateRule: (id: number, updates: Partial<Rules>) => fileDb.updateRule(id, updates),
  deleteRule: (id: number) => fileDb.deleteRule(id),
};

