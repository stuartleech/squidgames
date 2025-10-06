import { Team, Game, Tournament, Rules } from '@/types';

// In-memory database for serverless deployment
class InMemoryDatabase {
  private teams: Team[] = [];
  private games: Game[] = [];
  private tournaments: Tournament[] = [];
  private rules: Rules[] = [];
  private nextId = 1;

  constructor() {
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Only initialize if empty (to avoid duplicates on multiple calls)
    if (this.teams.length === 0) {
          // Sample teams data for Squid Games 2025
    const sampleTeams = [
      { name: 'Margate Krakens', color: 'linear-gradient(45deg, #f9c413 50%, #d80e61 50%)' },
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

      // Default rules data
      const defaultRules: Omit<Rules, 'id'>[] = [
        {
          title: 'Throw Off Rules',
          content: `At the start of each half, the team who starts with the ball has the opportunity to return a **3-on-1 throw off situation** which involves one returner in the Endzone of his own half and three members of the defending team who must line up as follows;
          
**Thrower:** Lines up at Halfway and cannot move until the returner catches the ball, he can then proceed to join his other team mates in trying to tackle the returner.

**Two members of the defending team:** Must line up on their own goal line but as soon as the ball is thrown they can chase down the returner.

**Important:** The ball must go further than 10 yards on the throw off and if the ball goes out of bounds without touching the returning player, the returning team will start their drive 1 yard from the halfway line.

Wherever the runner finishes the play (tackled / out of bounds) is where the offence starts their drive on the ensuing play. Any of the standard flag football penalties apply during this play.`,
          section: 'throw-off',
          order: 1,
        },
        {
          title: 'Special Plays',
          content: `**QB RUN:** Any team can run their QB directly from snap **ONCE per half** and this will be noted on the Scoresheet by the Refereeing Team.

**BULLET BLITZ:** Any team can blitz from anywhere **ONCE per half** and this will be noted on the Scoresheet by the Refereeing Team.`,
          section: 'special-plays',
          order: 2,
        },
        {
          title: 'General Notes',
          content: `• All standard flag football rules apply
• Referees will track special plays (QB RUN and BULLET BLITZ) on the scoresheet
• Teams are limited to one QB RUN and one BULLET BLITZ per half
• Penalties during throw off situations follow standard flag football penalty rules`,
          section: 'general-notes',
          order: 3,
        },
      ];

      // Create default rules
      defaultRules.forEach(rule => {
        this.createRule(rule);
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

  // Rules
  createRule(rule: Omit<Rules, 'id'>): { changes: number; lastInsertRowid: number } {
    const newRule = { ...rule, id: this.nextId++ };
    this.rules.push(newRule);
    return { changes: 1, lastInsertRowid: newRule.id };
  }

  getAllRules(): Rules[] {
    return [...this.rules].sort((a, b) => a.order - b.order);
  }

  getRuleById(id: number): Rules | undefined {
    return this.rules.find(rule => rule.id === id);
  }

  updateRule(id: number, updates: Partial<Rules>): { changes: number } {
    const index = this.rules.findIndex(rule => rule.id === id);
    if (index !== -1) {
      this.rules[index] = { ...this.rules[index], ...updates };
      return { changes: 1 };
    }
    return { changes: 0 };
  }

  deleteRule(id: number): { changes: number } {
    const index = this.rules.findIndex(rule => rule.id === id);
    if (index !== -1) {
      this.rules.splice(index, 1);
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

  // Rules
  createRule: (rule: Omit<Rules, 'id'>) => db.createRule(rule),
  getAllRules: () => db.getAllRules(),
  getRuleById: (id: number) => db.getRuleById(id),
  updateRule: (id: number, updates: Partial<Rules>) => db.updateRule(id, updates),
  deleteRule: (id: number) => db.deleteRule(id),
};
