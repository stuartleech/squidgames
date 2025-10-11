import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@libsql/client';

const TURSO_URL = 'libsql://squidgames-stuartleech.aws-eu-west-1.turso.io';
const TURSO_AUTH_TOKEN = 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NjAxNzU4NDEsImlkIjoiMzRiOGY3NTItYWE1Zi00NWRlLWIyOGItYTk2NTBlZDBhMDI2IiwicmlkIjoiM2NjNWUzZjktMTJmNS00M2U1LWFlMjEtNDhmYTI0YTRkYWRlIn0.sD7AXWxEpLfqLx4TLs0wiRBUZxl6lggjh5W-iY9JJRdQY7Mra7PpTwUjw4l8IPHt0qQDw0Fy6ciYg4f6t3GvDA';

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();
    
    if (password !== '_Squid-Games-2025!_') {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
    }

    const client = createClient({
      url: TURSO_URL,
      authToken: TURSO_AUTH_TOKEN,
    });

    console.log('[CLEAR] Clearing all data from Turso...');
    
    // Delete all data
    await client.execute('DELETE FROM games');
    await client.execute('DELETE FROM teams');
    await client.execute('DELETE FROM rules');
    
    console.log('[CLEAR] All tables cleared');

    return NextResponse.json({ 
      message: 'Database cleared successfully',
      info: 'Run /api/setup to reinitialize with fresh data'
    });
  } catch (error: any) {
    console.error('[CLEAR] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

