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

    // Update the game
    const updateData: any = {};
    if (homeScore !== undefined) updateData.homeScore = homeScore;
    if (awayScore !== undefined) updateData.awayScore = awayScore;
    if (status) updateData.status = status;
    if (half) updateData.half = half;
    if (timeRemaining !== undefined) updateData.timeRemaining = timeRemaining;
    if (isTimerRunning !== undefined) updateData.isTimerRunning = isTimerRunning ? 1 : 0;
    if (referee !== undefined) updateData.referee = referee;

    await dbOperations.updateGame(gameId, updateData);

    // Handle timer management
    if (isTimerRunning !== undefined) {
      if (isTimerRunning && status === 'in-progress') {
        gameTimer.startTimer(gameId);
      } else {
        gameTimer.stopTimer(gameId);
      }
    }

    // If scores are provided and game is completed, update team statistics
    if (homeScore !== undefined && awayScore !== undefined && status === 'completed') {
      const homeTeam = await dbOperations.getTeamById(gameBeforeUpdate.homeTeamId);
      const awayTeam = await dbOperations.getTeamById(gameBeforeUpdate.awayTeamId);

      if (homeTeam && awayTeam) {
        // Get previous scores (or 0 if null)
        const prevHomeScore = gameBeforeUpdate.homeScore || 0;
        const prevAwayScore = gameBeforeUpdate.awayScore || 0;
        
        // Calculate the difference in scores
        const homeScoreDiff = homeScore - prevHomeScore;
        const awayScoreDiff = awayScore - prevAwayScore;

        // Check if this was previously completed (to avoid double-counting wins/losses)
        const wasPreviouslyCompleted = gameBeforeUpdate.status === 'completed';

        // Update points for/against with the difference
        const newHomePointsFor = homeTeam.pointsFor + homeScoreDiff;
        const newHomePointsAgainst = homeTeam.pointsAgainst + awayScoreDiff;
        const newAwayPointsFor = awayTeam.pointsFor + awayScoreDiff;
        const newAwayPointsAgainst = awayTeam.pointsAgainst + homeScoreDiff;

        // Calculate wins/losses
        let newHomeWins = homeTeam.wins;
        let newHomeLosses = homeTeam.losses;
        let newAwayWins = awayTeam.wins;
        let newAwayLosses = awayTeam.losses;

        if (!wasPreviouslyCompleted) {
          // Only update wins/losses if game wasn't previously completed
          if (homeScore > awayScore) {
            newHomeWins += 1;
            newAwayLosses += 1;
          } else if (awayScore > homeScore) {
            newAwayWins += 1;
            newHomeLosses += 1;
          }
        } else {
          // Game was already completed, check if winner changed
          const prevHomeWon = prevHomeScore > prevAwayScore;
          const prevAwayWon = prevAwayScore > prevHomeScore;
          const newHomeWon = homeScore > awayScore;
          const newAwayWon = awayScore > homeScore;

          // Reverse previous result
          if (prevHomeWon && !newHomeWon) {
            newHomeWins -= 1;
            newAwayLosses -= 1;
          } else if (prevAwayWon && !newAwayWon) {
            newAwayWins -= 1;
            newHomeLosses -= 1;
          }

          // Apply new result
          if (newHomeWon) {
            newHomeWins += 1;
            newAwayLosses += 1;
          } else if (newAwayWon) {
            newAwayWins += 1;
            newHomeLosses += 1;
          }
        }

        // Update home team
        await dbOperations.updateTeam(gameBeforeUpdate.homeTeamId, {
          wins: newHomeWins,
          losses: newHomeLosses,
          pointsFor: newHomePointsFor,
          pointsAgainst: newHomePointsAgainst,
        });

        // Update away team
        await dbOperations.updateTeam(gameBeforeUpdate.awayTeamId, {
          wins: newAwayWins,
          losses: newAwayLosses,
          pointsFor: newAwayPointsFor,
          pointsAgainst: newAwayPointsAgainst,
        });
      }
    }

    const updatedGame = await dbOperations.getGameById(gameId);
    return NextResponse.json(updatedGame);
  } catch (error) {
    console.error('Error updating game:', error);
    return NextResponse.json({ error: 'Failed to update game' }, { status: 500 });
  }
}
