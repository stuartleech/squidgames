import { dbOperations } from '@/lib/database';

// Sample teams data for Squid Games 2025
const sampleTeams = [
  { name: 'Margate Krakens', color: '#d80e61' },
  { name: 'Exiles Black', color: '#000000' },
  { name: 'Exiles Silver', color: '#c0c0c0' },
  { name: 'Solent Red Storm', color: '#dc2626' },
];

// Sample games data for Saturday, October 11th, 2025 - Single Pitch Tournament
const sampleGames = [
  {
    homeTeamId: 1, // Margate Krakens
    awayTeamId: 2, // Exiles Black
    scheduledTime: new Date('2025-10-11T10:00:00+01:00').toISOString(), // UK time with BST offset
    field: '1',
    status: 'scheduled',
    homeScore: null,
    awayScore: null,
    half: 1,
    timeRemaining: 900,
    isTimerRunning: 0,
    referee: 'Solent Red Storm'
  },
  {
    homeTeamId: 4, // Solent Red Storm
    awayTeamId: 3, // Exiles Silver
    scheduledTime: new Date('2025-10-11T10:40:00+01:00').toISOString(), // UK time with BST offset
    field: '1',
    status: 'scheduled',
    homeScore: null,
    awayScore: null,
    half: 1,
    timeRemaining: 900,
    isTimerRunning: 0,
    referee: 'Margate Krakens'
  },
  {
    homeTeamId: 1, // Margate Krakens
    awayTeamId: 3, // Exiles Silver
    scheduledTime: new Date('2025-10-11T11:40:00+01:00').toISOString(), // UK time with BST offset
    field: '1',
    status: 'scheduled',
    homeScore: null,
    awayScore: null,
    half: 1,
    timeRemaining: 900,
    isTimerRunning: 0,
    referee: 'Solent Red Storm'
  },
  {
    homeTeamId: 2, // Exiles Black
    awayTeamId: 4, // Solent Red Storm
    scheduledTime: new Date('2025-10-11T12:20:00+01:00').toISOString(), // UK time with BST offset
    field: '1',
    status: 'scheduled',
    homeScore: null,
    awayScore: null,
    half: 1,
    timeRemaining: 900,
    isTimerRunning: 0,
    referee: 'Margate Krakens'
  },
  {
    homeTeamId: 2, // Exiles Black
    awayTeamId: 3, // Exiles Silver
    scheduledTime: new Date('2025-10-11T13:20:00+01:00').toISOString(), // UK time with BST offset
    field: '1',
    status: 'scheduled',
    homeScore: null,
    awayScore: null,
    half: 1,
    timeRemaining: 900,
    isTimerRunning: 0,
    referee: 'Margate Krakens (neutral)'
  },
  {
    homeTeamId: 1, // Margate Krakens
    awayTeamId: 4, // Solent Red Storm
    scheduledTime: new Date('2025-10-11T14:00:00+01:00').toISOString(), // UK time with BST offset
    field: '1',
    status: 'scheduled',
    homeScore: null,
    awayScore: null,
    half: 1,
    timeRemaining: 900,
    isTimerRunning: 0,
    referee: 'Exiles Black'
  }
];

export function initializeSampleData() {
  try {
    // Always create sample data for now
    console.log('Initializing sample data...');

    // Create sample teams
    console.log('Creating sample teams for Squid Games 2025...');
    sampleTeams.forEach(team => {
      dbOperations.createTeam({
        name: team.name,
        color: team.color,
        wins: 0,
        losses: 0,
        pointsFor: 0,
        pointsAgainst: 0
      });
    });

    // Create sample games
    console.log('Creating sample games for Saturday, October 11th, 2025...');
    sampleGames.forEach((game, index) => {
      try {
        console.log(`Creating game ${index + 1}:`, game);
        const result = dbOperations.createGame(game);
        console.log(`Game ${index + 1} created:`, result);
      } catch (error) {
        console.error(`Error creating game ${index + 1}:`, error);
      }
    });

    // Create tournament
    console.log('Creating Squid Games 2025 tournament...');
    dbOperations.createTournament({
      name: 'Squid Games 2025',
      startDate: '2025-10-11',
      endDate: '2025-10-11'
    });

    console.log('Squid Games 2025 data created successfully!');
  } catch (error) {
    console.error('Error creating sample data:', error);
  }
}
