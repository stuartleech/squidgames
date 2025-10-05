import { NextRequest, NextResponse } from 'next/server';
import { dbOperations } from '@/lib/database';

export async function GET() {
  try {
    // Check if rules already exist
    const existingRules = dbOperations.getAllRules();
    if (existingRules.length > 0) {
      return NextResponse.json({ message: 'Rules already initialized' });
    }

    // Create default rules
    const defaultRules = [
      {
        title: 'Throw Off Rules',
        content: `At the start of each half, the team who starts with the ball has the opportunity to return a **3-on-1 throw off situation** which involves:

- One returner in the endzone of their own half
- Three members of the defending team who must line up as follows:

**Thrower:** Lines up at halfway and cannot move until the returner catches the ball. He can then proceed to join his teammates in trying to tackle the returner.

**Two Defenders:** Must line up on their own goal line but as soon as the ball is thrown they can chase down the returner.

**Important:** The ball must go further than 10 yards on the throw off. If the ball goes out of bounds without touching the returning player, the returning team will start their drive 1 yard from the halfway line.

Wherever the runner finishes the play (tackled/out of bounds) is where the offense starts their drive on the ensuing play. Any of the standard flag football penalties apply during this play.`,
        section: 'throw-off',
        order: 1
      },
      {
        title: 'Special Plays',
        content: `**QB RUN:** Any team can run their QB directly from snap **ONCE per half**. This will be noted on the scoresheet by the refereeing team.

**BULLET BLITZ:** Any team can blitz from anywhere **ONCE per half**. This will be noted on the scoresheet by the refereeing team.`,
        section: 'special-plays',
        order: 2
      },
      {
        title: 'General Notes',
        content: `• All standard flag football rules apply
• Referees will track special plays (QB RUN and BULLET BLITZ) on the scoresheet
• Teams are limited to one QB RUN and one BULLET BLITZ per half
• Penalties during throw off situations follow standard flag football penalty rules`,
        section: 'general-notes',
        order: 3
      }
    ];

    // Create each rule
    for (const rule of defaultRules) {
      dbOperations.createRule(rule);
    }

    return NextResponse.json({ message: 'Default rules initialized successfully' });
  } catch (error) {
    console.error('Error initializing rules:', error);
    return NextResponse.json({ error: 'Failed to initialize rules' }, { status: 500 });
  }
}
