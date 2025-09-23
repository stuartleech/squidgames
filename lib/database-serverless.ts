import { Team, Game, Tournament } from '@/types';

// In-memory database for serverless deployment
class InMemoryDatabase {
  private teams: Team[] = [];
  private games: Game[] = [];
  private tournaments: Tournament[] = [];
  private nextId = 1;

  // Teams
  createTeam(team: Omit<Team, 'id'>): { changes: number; lastInsertRowid: number } {
    const newTeam = { ...team, id: this.nextId++ };
    this.teams.push(newTeam);
    return { changes: 1, lastInsertRowid: newTeam.id };
  }

  getAllTeams(): Team[] {
    return this.teams;
  }

  getTeamById(id: number): Team | undefined {
    return this.teams.find(team => team.id === id);
  }

  updateTeam(id: number, updates: Partial<Team>): { changes: number } {
    const index = this.teams.findIndex(team => team.id === id);
    if (index !== -1) {
      this.teams[index] = { ...this.teams[index], ...updates };
      return { changes: 1 };
    }
    return { changes: 0 };
  }

  // Games
  createGame(game: Omit<Game, 'id'>): { changes: number; lastInsertRowid: number } {
    const newGame = { ...game, id: this.nextId++ };
    this.games.push(newGame);
    return { changes: 1, lastInsertRowid: newGame.id };
  }

  getAllGames(): Game[] {
    return this.games.map(game => {
      const homeTeam = this.teams.find(t => t.id === game.homeTeamId);
      const awayTeam = this.teams.find(t => t.id === game.awayTeamId);
      return {
        ...game,
        homeTeamName: homeTeam?.name || 'Unknown',
        homeTeamColor: homeTeam?.color || '#000000',
        homeTeamLogo: homeTeam?.logo || '',
        awayTeamName: awayTeam?.name || 'Unknown',
        awayTeamColor: awayTeam?.color || '#000000',
        awayTeamLogo: awayTeam?.logo || '',
      };
    });
  }

  getGameById(id: number): Game | undefined {
    return this.games.find(game => game.id === id);
  }

  updateGame(id: number, updates: Partial<Game>): { changes: number } {
    const index = this.games.findIndex(game => game.id === id);
    if (index !== -1) {
      this.games[index] = { ...this.games[index], ...updates };
      return { changes: 1 };
    }
    return { changes: 0 };
  }

  // Tournaments
  createTournament(tournament: Omit<Tournament, 'id'>): { changes: number; lastInsertRowid: number } {
    const newTournament = { ...tournament, id: this.nextId++ };
    this.tournaments.push(newTournament);
    return { changes: 1, lastInsertRowid: newTournament.id };
  }

  getAllTournaments(): Tournament[] {
    return this.tournaments;
  }

  getTournamentById(id: number): Tournament | undefined {
    return this.tournaments.find(tournament => tournament.id === id);
  }

  updateTournament(id: number, updates: Partial<Tournament>): { changes: number } {
    const index = this.tournaments.findIndex(tournament => tournament.id === id);
    if (index !== -1) {
      this.tournaments[index] = { ...this.tournaments[index], ...updates };
      return { changes: 1 };
    }
    return { changes: 0 };
  }
}

// Use in-memory database for serverless deployment
const db = new InMemoryDatabase();

export const dbOperations = {
  // Teams
  createTeam: (team: Omit<Team, 'id'>) => db.createTeam(team),
  getAllTeams: () => db.getAllTeams(),
  getTeamById: (id: number) => db.getTeamById(id),
  updateTeam: (id: number, updates: Partial<Team>) => db.updateTeam(id, updates),

  // Games
  createGame: (game: Omit<Game, 'id'>) => db.createGame(game),
  getAllGames: () => db.getAllGames(),
  getGameById: (id: number) => db.getGameById(id),
  updateGame: (id: number, updates: Partial<Game>) => db.updateGame(id, updates),

  // Tournaments
  createTournament: (tournament: Omit<Tournament, 'id'>) => db.createTournament(tournament),
  getAllTournaments: () => db.getAllTournaments(),
  getTournamentById: (id: number) => db.getTournamentById(id),
  updateTournament: (id: number, updates: Partial<Tournament>) => db.updateTournament(id, updates),
};
