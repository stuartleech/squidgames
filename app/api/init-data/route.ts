import { dbOperations } from '@/lib/database';

export async function GET() {
  try {
    console.log('[INIT] Starting initialization...');
    
    // Check existing data
    const existingTeams = await dbOperations.getAllTeams();
    const existingGames = await dbOperations.getAllGames();
    
    console.log('[INIT] Existing teams:', existingTeams.length, 'games:', existingGames.length);
    
    if (existingTeams.length > 0 || existingGames.length > 0) {
      return Response.json({ 
        message: 'Database already has data',
        teams: existingTeams.length,
        games: existingGames.length
      });
    }
    
    // Create teams directly
    console.log('[INIT] Creating teams...');
    await dbOperations.createTeam({ name: 'Margate Krakens', color: 'linear-gradient(45deg, #f9c413 50%, #d80e61 50%)', wins: 0, losses: 0, pointsFor: 0, pointsAgainst: 0 });
    await dbOperations.createTeam({ name: 'Exiles Black', color: '#000000', wins: 0, losses: 0, pointsFor: 0, pointsAgainst: 0 });
    await dbOperations.createTeam({ name: 'Exiles Silver', color: '#c0c0c0', wins: 0, losses: 0, pointsFor: 0, pointsAgainst: 0 });
    await dbOperations.createTeam({ name: 'Solent Red Storm', color: '#dc2626', wins: 0, losses: 0, pointsFor: 0, pointsAgainst: 0 });
    
    console.log('[INIT] Creating games...');
    await dbOperations.createGame({
      homeTeamId: 1, awayTeamId: 2,
      scheduledTime: new Date('2025-10-11T10:00:00+01:00').toISOString(),
      field: '1', status: 'scheduled', homeScore: null, awayScore: null,
      half: 1, timeRemaining: 900, isTimerRunning: false, referee: 'Solent Red Storm'
    });
    
    // Verify
    const verifyTeams = await dbOperations.getAllTeams();
    const verifyGames = await dbOperations.getAllGames();
    console.log('[INIT] Verification - teams:', verifyTeams.length, 'games:', verifyGames.length);
    
    return Response.json({ 
      message: 'Initialized!',
      teams: verifyTeams.length,
      games: verifyGames.length
    });
  } catch (error: any) {
    console.error('[INIT] Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
