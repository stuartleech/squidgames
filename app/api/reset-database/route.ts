import { NextRequest, NextResponse } from 'next/server';
import { dbOperations } from '@/lib/database';
import { initializeSampleData } from '@/lib/sampleData';

// DANGER: This completely wipes and resets the database!
// Protected by password to prevent accidental resets

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();
    
    // Require password to prevent accidental resets
    if (password !== '_Squid-Games-2025!_') {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
    }

    console.log('🚨 DATABASE RESET REQUESTED - Clearing all data...');

    // Get all existing data to clear
    const teams = await dbOperations.getAllTeams();
    const games = await dbOperations.getAllGames();

    // Delete all games
    for (const game of games) {
      await dbOperations.deleteGame(game.id);
    }

    // Delete all teams
    for (const team of teams) {
      await dbOperations.deleteTeam(team.id);
    }

    console.log('✅ All data cleared. Reinitializing with sample data...');

    // Now initialize fresh data
    const result = await initializeSampleData();

    return NextResponse.json({ 
      message: 'Database has been completely reset and reinitialized',
      warning: 'All previous scores and data have been lost',
      result
    });
  } catch (error) {
    console.error('Error resetting database:', error);
    return NextResponse.json({ error: 'Failed to reset database' }, { status: 500 });
  }
}

