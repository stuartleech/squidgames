import { Team, Game, Tournament } from '@/types';

// In-memory database for serverless deployment
class InMemoryDatabase {
  private teams: Team[] = [];
  private games: Game[] = [];
  private tournaments: Tournament[] = [];
  private nextId = 1;

  constructor() {
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Only initialize if empty (to avoid duplicates on multiple calls)
    if (this.teams.length === 0) {
          // Sample teams data for Squid Games 2025
          const sampleTeams = [
            { name: 'Margate Krakens', color: '#d80e61' },
            { name: 'Exiles Black', color: '#000000' },
            { name: 'Exiles Silver', color: '#c0c0c0' },
            { name: 'Solent Red Storm', color: '#dc2626' },
          ];

      // Create sample teams
      sampleTeams.forEach(team => {
        this.createTeam({
          name: team.name,
          color: team.color,
          wins: 0,
          losses: 0,
          pointsFor: 0,
          pointsAgainst: 0
        });
      });

      // Sample games data for Saturday, October 11th, 2025 - Single Pitch Tournament
      const sampleGames: Omit<Game, 'id'>[] = [
        {
          homeTeamId: 1, // Margate Krakens
          awayTeamId: 2, // Exiles Black
          scheduledTime: new Date('2025-10-11T10:00:00+01:00').toISOString(), // UK time with BST offset
          field: '1',
          status: 'scheduled' as const,
          homeScore: null,
          awayScore: null,
          half: 1,
          timeRemaining: 900,
          isTimerRunning: false,
          referee: 'Solent Red Storm'
        },
        {
          homeTeamId: 4, // Solent Red Storm
          awayTeamId: 3, // Exiles Silver
          scheduledTime: new Date('2025-10-11T10:40:00+01:00').toISOString(), // UK time with BST offset
          field: '1',
          status: 'scheduled' as const,
          homeScore: null,
          awayScore: null,
          half: 1,
          timeRemaining: 900,
          isTimerRunning: false,
          referee: 'Margate Krakens'
        },
        {
          homeTeamId: 1, // Margate Krakens
          awayTeamId: 3, // Exiles Silver
          scheduledTime: new Date('2025-10-11T11:40:00+01:00').toISOString(), // UK time with BST offset
          field: '1',
          status: 'scheduled' as const,
          homeScore: null,
          awayScore: null,
          half: 1,
          timeRemaining: 900,
          isTimerRunning: false,
          referee: 'Solent Red Storm'
        },
        {
          homeTeamId: 2, // Exiles Black
          awayTeamId: 4, // Solent Red Storm
          scheduledTime: new Date('2025-10-11T12:20:00+01:00').toISOString(), // UK time with BST offset
          field: '1',
          status: 'scheduled' as const,
          homeScore: null,
          awayScore: null,
          half: 1,
          timeRemaining: 900,
          isTimerRunning: false,
          referee: 'Margate Krakens'
        },
        {
          homeTeamId: 2, // Exiles Black
          awayTeamId: 3, // Exiles Silver
          scheduledTime: new Date('2025-10-11T13:20:00+01:00').toISOString(), // UK time with BST offset
          field: '1',
          status: 'scheduled' as const,
          homeScore: null,
          awayScore: null,
          half: 1,
          timeRemaining: 900,
          isTimerRunning: false,
          referee: 'Margate Krakens (neutral)'
        },
        {
          homeTeamId: 1, // Margate Krakens
          awayTeamId: 4, // Solent Red Storm
          scheduledTime: new Date('2025-10-11T14:00:00+01:00').toISOString(), // UK time with BST offset
          field: '1',
          status: 'scheduled' as const,
          homeScore: null,
          awayScore: null,
          half: 1,
          timeRemaining: 900,
          isTimerRunning: false,
          referee: 'Exiles Black'
        }
      ];

      // Create sample games
      sampleGames.forEach(game => {
        this.createGame(game);
      });

      // Create tournament
      this.createTournament({
        name: 'Squid Games 2025',
        startDate: '2025-10-11',
        endDate: '2025-10-11',
        teams: [],
        games: []
      });
    }
  }

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

  deleteTeam(id: number): { changes: number } {
    const index = this.teams.findIndex(team => team.id === id);
    if (index !== -1) {
      this.teams.splice(index, 1);
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

  deleteGame(id: number): { changes: number } {
    const index = this.games.findIndex(game => game.id === id);
    if (index !== -1) {
      this.games.splice(index, 1);
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
