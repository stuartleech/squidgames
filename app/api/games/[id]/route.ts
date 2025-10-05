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
    const result = dbOperations.deleteGame(gameId);
    
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

    // Update the game
    const updateData: any = {};
    if (homeScore !== undefined) updateData.homeScore = homeScore;
    if (awayScore !== undefined) updateData.awayScore = awayScore;
    if (status) updateData.status = status;
    if (half) updateData.half = half;
    if (timeRemaining !== undefined) updateData.timeRemaining = timeRemaining;
    if (isTimerRunning !== undefined) updateData.isTimerRunning = isTimerRunning ? 1 : 0;
    if (referee !== undefined) updateData.referee = referee;

        dbOperations.updateGame(gameId, updateData);

        // Handle timer management
        if (isTimerRunning !== undefined) {
          if (isTimerRunning && status === 'in-progress') {
            gameTimer.startTimer(gameId);
          } else {
            gameTimer.stopTimer(gameId);
          }
        }

        // If scores are provided, update team statistics
    if (homeScore !== undefined && awayScore !== undefined) {
      const game = dbOperations.getGameById(gameId);
      if (game) {
        const homeTeam = dbOperations.getTeamById(game.homeTeamId);
        const awayTeam = dbOperations.getTeamById(game.awayTeamId);

        if (homeTeam && awayTeam) {
          // Update points for/against
          const newHomePointsFor = homeTeam.pointsFor + homeScore;
          const newHomePointsAgainst = homeTeam.pointsAgainst + awayScore;
          const newAwayPointsFor = awayTeam.pointsFor + awayScore;
          const newAwayPointsAgainst = awayTeam.pointsAgainst + homeScore;

          // Determine winner and update wins/losses
          let newHomeWins = homeTeam.wins;
          let newHomeLosses = homeTeam.losses;
          let newAwayWins = awayTeam.wins;
          let newAwayLosses = awayTeam.losses;

          if (homeScore > awayScore) {
            newHomeWins += 1;
            newAwayLosses += 1;
          } else if (awayScore > homeScore) {
            newAwayWins += 1;
            newHomeLosses += 1;
          }

          // Update home team
          dbOperations.updateTeam(game.homeTeamId, {
            wins: newHomeWins,
            losses: newHomeLosses,
            pointsFor: newHomePointsFor,
            pointsAgainst: newHomePointsAgainst,
          });

          // Update away team
          dbOperations.updateTeam(game.awayTeamId, {
            wins: newAwayWins,
            losses: newAwayLosses,
            pointsFor: newAwayPointsFor,
            pointsAgainst: newAwayPointsAgainst,
          });
        }
      }
    }

    const updatedGame = dbOperations.getGameById(gameId);
    return NextResponse.json(updatedGame);
  } catch (error) {
    console.error('Error updating game:', error);
    return NextResponse.json({ error: 'Failed to update game' }, { status: 500 });
  }
}
