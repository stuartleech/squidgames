import { NextRequest, NextResponse } from 'next/server';
import { dbOperations } from '@/lib/database';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const teamData = await request.json();
    const teamId = parseInt(params.id);

    if (!teamId) {
      return NextResponse.json({ error: 'Team ID is required' }, { status: 400 });
    }

    const result = dbOperations.updateTeam(teamId, teamData);
    
    if (result.changes === 0) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }

    const updatedTeam = dbOperations.getTeamById(teamId);
    return NextResponse.json(updatedTeam);
  } catch (error) {
    console.error('Error updating team:', error);
    return NextResponse.json({ error: 'Failed to update team' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const teamId = parseInt(params.id);

    if (!teamId) {
      return NextResponse.json({ error: 'Team ID is required' }, { status: 400 });
    }

    const result = dbOperations.deleteTeam(teamId);
    
    if (result.changes === 0) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Team deleted successfully' });
  } catch (error) {
    console.error('Error deleting team:', error);
    return NextResponse.json({ error: 'Failed to delete team' }, { status: 500 });
  }
}
