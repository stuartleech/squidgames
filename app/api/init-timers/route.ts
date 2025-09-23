import { gameTimer } from '@/lib/timer';

export async function GET() {
  try {
    // Initialize timers for any games that should be running
    gameTimer.initializeTimers();
    return Response.json({ message: 'Timer system initialized' });
  } catch (error) {
    console.error('Error initializing timer system:', error);
    return Response.json({ error: 'Failed to initialize timer system' }, { status: 500 });
  }
}
