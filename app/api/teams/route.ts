import { NextRequest, NextResponse } from 'next/server';
import { dbOperations } from '@/lib/database';

export async function GET() {
  try {
    const teams = dbOperations.getAllTeams();
    return NextResponse.json(teams);
  } catch (error) {
    console.error('Error fetching teams:', error);
    return NextResponse.json({ error: 'Failed to fetch teams' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const teamData = await request.json();
    const result = dbOperations.createTeam(teamData);
    return NextResponse.json({ id: result.lastInsertRowid, ...teamData });
  } catch (error) {
    console.error('Error creating team:', error);
    return NextResponse.json({ error: 'Failed to create team' }, { status: 500 });
  }
}
