import { NextResponse } from 'next/server';
import { dbOperations } from '@/lib/database';

export async function GET() {
  try {
    const games = dbOperations.getAllGames();
    return NextResponse.json(games);
  } catch (error) {
    console.error('Error fetching games:', error);
    return NextResponse.json({ error: 'Failed to fetch games' }, { status: 500 });
  }
}
