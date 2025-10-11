import { NextResponse } from 'next/server';
import { dbOperations } from '@/lib/database';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  console.log('[SETUP] ========== SETUP ENDPOINT CALLED ==========');
  
  try {
    // Create teams
    console.log('[SETUP] Step 1: Creating teams...');
    const t1 = await dbOperations.createTeam({ name: 'Margate Krakens', color: 'linear-gradient(45deg, #f9c413 50%, #d80e61 50%)', wins: 0, losses: 0, pointsFor: 0, pointsAgainst: 0 });
    console.log('[SETUP] Team 1 created:', t1);
    
    const t2 = await dbOperations.createTeam({ name: 'Exiles Black', color: '#000000', wins: 0, losses: 0, pointsFor: 0, pointsAgainst: 0 });
    console.log('[SETUP] Team 2 created:', t2);
    
    const t3 = await dbOperations.createTeam({ name: 'Exiles Silver', color: '#c0c0c0', wins: 0, losses: 0, pointsFor: 0, pointsAgainst: 0 });
    console.log('[SETUP] Team 3 created:', t3);
    
    const t4 = await dbOperations.createTeam({ name: 'Solent Red Storm', color: '#dc2626', wins: 0, losses: 0, pointsFor: 0, pointsAgainst: 0 });
    console.log('[SETUP] Team 4 created:', t4);
    
    // Verify teams and get their IDs
    const teams = await dbOperations.getAllTeams();
    console.log('[SETUP] Teams in DB:', teams.length, 'IDs:', teams.map((t: any) => t.id));
    
    // Find team IDs by name
    const krakens = teams.find((t: any) => t.name === 'Margate Krakens');
    const exilesBlack = teams.find((t: any) => t.name === 'Exiles Black');
    const exilesSilver = teams.find((t: any) => t.name === 'Exiles Silver');
    const solent = teams.find((t: any) => t.name === 'Solent Red Storm');
    
    if (!krakens || !exilesBlack || !exilesSilver || !solent) {
      throw new Error('Missing teams! Found: ' + teams.map((t: any) => t.name).join(', '));
    }
    
    // Create games
    console.log('[SETUP] Step 2: Creating games...');
    
    const g1 = await dbOperations.createGame({
      homeTeamId: krakens.id, awayTeamId: exilesBlack.id,
      scheduledTime: new Date('2025-10-11T10:00:00+01:00').toISOString(),
      field: '1', status: 'scheduled', homeScore: null, awayScore: null,
      half: 1, timeRemaining: 900, isTimerRunning: false, referee: 'Kent Exiles'
    });
    console.log('[SETUP] Game 1 created:', g1);
    
    const g2 = await dbOperations.createGame({
      homeTeamId: solent.id, awayTeamId: exilesSilver.id,
      scheduledTime: new Date('2025-10-11T10:40:00+01:00').toISOString(),
      field: '1', status: 'scheduled', homeScore: null, awayScore: null,
      half: 1, timeRemaining: 900, isTimerRunning: false, referee: 'Margate Krakens'
    });
    console.log('[SETUP] Game 2 created:', g2);
    
    const g3 = await dbOperations.createGame({
      homeTeamId: krakens.id, awayTeamId: exilesSilver.id,
      scheduledTime: new Date('2025-10-11T11:30:00+01:00').toISOString(),
      field: '1', status: 'scheduled', homeScore: null, awayScore: null,
      half: 1, timeRemaining: 900, isTimerRunning: false, referee: 'Solent Red Storm'
    });
    console.log('[SETUP] Game 3 created:', g3);
    
    const g4 = await dbOperations.createGame({
      homeTeamId: exilesBlack.id, awayTeamId: solent.id,
      scheduledTime: new Date('2025-10-11T12:10:00+01:00').toISOString(),
      field: '1', status: 'scheduled', homeScore: null, awayScore: null,
      half: 1, timeRemaining: 900, isTimerRunning: false, referee: 'Margate Krakens'
    });
    console.log('[SETUP] Game 4 created:', g4);
    
    const g5 = await dbOperations.createGame({
      homeTeamId: exilesBlack.id, awayTeamId: exilesSilver.id,
      scheduledTime: new Date('2025-10-11T13:00:00+01:00').toISOString(),
      field: '1', status: 'scheduled', homeScore: null, awayScore: null,
      half: 1, timeRemaining: 900, isTimerRunning: false, referee: 'Solent Red Storm'
    });
    console.log('[SETUP] Game 5 created:', g5);
    
    const g6 = await dbOperations.createGame({
      homeTeamId: krakens.id, awayTeamId: solent.id,
      scheduledTime: new Date('2025-10-11T13:40:00+01:00').toISOString(),
      field: '1', status: 'scheduled', homeScore: null, awayScore: null,
      half: 1, timeRemaining: 900, isTimerRunning: false, referee: 'Kent Exiles'
    });
    console.log('[SETUP] Game 6 created:', g6);
    
    // Create default rules
    console.log('[SETUP] Step 3: Creating rules...');
    await dbOperations.createRule({
      title: 'Throw Off Rules',
      content: `At the start of each half, the team who starts with the ball has the opportunity to return a **3-on-1 throw off situation** which involves one returner in the Endzone of his own half and three members of the defending team who must line up as follows;

**Thrower:** Lines up at Halfway and cannot move until the returner catches the ball, he can then proceed to join his other team mates in trying to tackle the returner.

**Two members of the defending team:** Must line up on their own goal line but as soon as the ball is thrown they can chase down the returner.

**Important:** The ball must go further than 10 yards on the throw off and if the ball goes out of bounds without touching the returning player, the returning team will start their drive 1 yard from the halfway line.

Wherever the runner finishes the play (tackled / out of bounds) is where the offence starts their drive on the ensuing play. Any of the standard flag football penalties apply during this play.`,
      section: 'throw-off',
      order: 1,
    });
    
    await dbOperations.createRule({
      title: 'Special Plays',
      content: `**QB RUN:** Any team can run their QB directly from snap **ONCE per half** and this will be noted on the Scoresheet by the Refereeing Team.

**BULLET BLITZ:** Any team can blitz from anywhere **ONCE per half** and this will be noted on the Scoresheet by the Refereeing Team.`,
      section: 'special-plays',
      order: 2,
    });
    
    await dbOperations.createRule({
      title: 'General Notes',
      content: `• All standard flag football rules apply
• Referees will track special plays (QB RUN and BULLET BLITZ) on the scoresheet
• Teams are limited to one QB RUN and one BULLET BLITZ per half
• Penalties during throw off situations follow standard flag football penalty rules`,
      section: 'general-notes',
      order: 3,
    });
    
    // Final verification
    const finalGames = await dbOperations.getAllGames();
    const finalTeams = await dbOperations.getAllTeams();
    const finalRules = await dbOperations.getAllRules();
    
    console.log('[SETUP] ========== SETUP COMPLETE ==========');
    console.log('[SETUP] Final count - Teams:', finalTeams.length, 'Games:', finalGames.length, 'Rules:', finalRules.length);
    
    return NextResponse.json({ 
      success: true,
      teams: finalTeams.length,
      games: finalGames.length,
      rules: finalRules.length,
      message: 'Database initialized successfully!'
    });
  } catch (error: any) {
    console.error('[SETUP] ERROR:', error);
    return NextResponse.json({ 
      success: false,
      error: error.message,
      stack: error.stack 
    }, { status: 500 });
  }
}

