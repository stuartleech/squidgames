import { NextRequest, NextResponse } from 'next/server';
import { dbOperations } from '@/lib/database';
import { gameTimer } from '@/lib/timer';

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const gameId = parseInt(params.id);

    if (!gameId) {
      return NextResponse.json({ error: 'Game ID is required' }, { status: 400 });
    }

    // Delete the game
    const result = await dbOperations.deleteGame(gameId);
    
    if (result.changes === 0) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Game deleted successfully' });
  } catch (error) {
    console.error('Error deleting game:', error);
    return NextResponse.json({ error: 'Failed to delete game' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { homeScore, awayScore, status, half, timeRemaining, isTimerRunning, referee } = await request.json();
    const gameId = parseInt(params.id);

    if (!gameId) {
      return NextResponse.json({ error: 'Game ID is required' }, { status: 400 });
    }

    // Get the game BEFORE updating to track previous scores
    const gameBeforeUpdate = await dbOperations.getGameById(gameId);
    if (!gameBeforeUpdate) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }

    // Handle timer management first
    if (isTimerRunning !== undefined) {
      if (isTimerRunning && status === 'in-progress') {
        gameTimer.startTimer(gameId);
      } else {
        gameTimer.stopTimer(gameId);
      }
    }

    // If game is being marked as completed, update team statistics FIRST
    if (status === 'completed' && gameBeforeUpdate.status !== 'completed') {
      // First time completing - use the final scores
      const finalHomeScore = homeScore !== undefined ? homeScore : (gameBeforeUpdate.homeScore || 0);
      const finalAwayScore = awayScore !== undefined ? awayScore : (gameBeforeUpdate.awayScore || 0);
      
      console.log(`[Standings Update] First completion of game ${gameId}: ${finalHomeScore}-${finalAwayScore}`);
      const homeTeam = await dbOperations.getTeamById(gameBeforeUpdate.homeTeamId);
      const awayTeam = await dbOperations.getTeamById(gameBeforeUpdate.awayTeamId);

      if (homeTeam && awayTeam) {
        // Add the scores to team totals (first time completion)
        const newHomePointsFor = homeTeam.pointsFor + finalHomeScore;
        const newHomePointsAgainst = homeTeam.pointsAgainst + finalAwayScore;
        const newAwayPointsFor = awayTeam.pointsFor + finalAwayScore;
        const newAwayPointsAgainst = awayTeam.pointsAgainst + finalHomeScore;

        // Calculate wins/losses (first time completion only)
        let newHomeWins = homeTeam.wins;
        let newHomeLosses = homeTeam.losses;
        let newAwayWins = awayTeam.wins;
        let newAwayLosses = awayTeam.losses;

        if (finalHomeScore > finalAwayScore) {
          newHomeWins += 1;
          newAwayLosses += 1;
        } else if (finalAwayScore > finalHomeScore) {
          newAwayWins += 1;
          newHomeLosses += 1;
        }

        // Update home team
        console.log(`[Standings Update] Updating home team ${gameBeforeUpdate.homeTeamId}:`, {
          wins: newHomeWins,
          losses: newHomeLosses,
          pointsFor: newHomePointsFor,
          pointsAgainst: newHomePointsAgainst,
        });
        await dbOperations.updateTeam(gameBeforeUpdate.homeTeamId, {
          wins: newHomeWins,
          losses: newHomeLosses,
          pointsFor: newHomePointsFor,
          pointsAgainst: newHomePointsAgainst,
        });

        // Update away team
        console.log(`[Standings Update] Updating away team ${gameBeforeUpdate.awayTeamId}:`, {
          wins: newAwayWins,
          losses: newAwayLosses,
          pointsFor: newAwayPointsFor,
          pointsAgainst: newAwayPointsAgainst,
        });
        await dbOperations.updateTeam(gameBeforeUpdate.awayTeamId, {
          wins: newAwayWins,
          losses: newAwayLosses,
          pointsFor: newAwayPointsFor,
          pointsAgainst: newAwayPointsAgainst,
        });
      } else {
        console.log('[Standings Update] ERROR: Could not find one or both teams!');
      }
    }

    // Now update the game itself
    const updateData: any = {};
    if (homeScore !== undefined) updateData.homeScore = homeScore;
    if (awayScore !== undefined) updateData.awayScore = awayScore;
    if (status) updateData.status = status;
    if (half) updateData.half = half;
    if (timeRemaining !== undefined) updateData.timeRemaining = timeRemaining;
    if (isTimerRunning !== undefined) updateData.isTimerRunning = isTimerRunning ? 1 : 0;
    if (referee !== undefined) updateData.referee = referee;

    await dbOperations.updateGame(gameId, updateData);

    const updatedGame = await dbOperations.getGameById(gameId);
    console.log('[Standings Update] Game update complete, returning:', updatedGame);
    return NextResponse.json(updatedGame);
  } catch (error) {
    console.error('Error updating game:', error);
    return NextResponse.json({ error: 'Failed to update game' }, { status: 500 });
  }
}
