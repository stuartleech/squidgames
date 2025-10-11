import { NextResponse } from 'next/server';
import { dbOperations } from '@/lib/database';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    console.log('[RECALC] Starting standings recalculation...');
    
    // Get all teams and completed games
    const teams = await dbOperations.getAllTeams();
    const allGames = await dbOperations.getAllGames();
    const completedGames = allGames.filter((g: any) => g.status === 'completed');
    
    console.log('[RECALC] Found', teams.length, 'teams and', completedGames.length, 'completed games');
    
    // Reset all team stats to 0
    const teamStats: any = {};
    for (const team of teams) {
      teamStats[team.id] = {
        wins: 0,
        losses: 0,
        pointsFor: 0,
        pointsAgainst: 0
      };
    }
    
    // Recalculate from all completed games
    for (const game of completedGames) {
      const homeScore = game.homeScore || 0;
      const awayScore = game.awayScore || 0;
      
      // Update points for/against
      teamStats[game.homeTeamId].pointsFor += homeScore;
      teamStats[game.homeTeamId].pointsAgainst += awayScore;
      teamStats[game.awayTeamId].pointsFor += awayScore;
      teamStats[game.awayTeamId].pointsAgainst += homeScore;
      
      // Update wins/losses
      if (homeScore > awayScore) {
        teamStats[game.homeTeamId].wins += 1;
        teamStats[game.awayTeamId].losses += 1;
      } else if (awayScore > homeScore) {
        teamStats[game.awayTeamId].wins += 1;
        teamStats[game.homeTeamId].losses += 1;
      }
    }
    
    // Update all teams in database
    for (const team of teams) {
      const stats = teamStats[team.id];
      console.log(`[RECALC] Updating ${team.name}:`, stats);
      await dbOperations.updateTeam(team.id, stats);
    }
    
    console.log('[RECALC] Recalculation complete!');
    
    return NextResponse.json({
      success: true,
      message: 'Standings recalculated successfully',
      teamsUpdated: teams.length,
      gamesProcessed: completedGames.length
    });
  } catch (error: any) {
    console.error('[RECALC] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

