import { dbOperations } from './database';

class GameTimer {
  private timers: Map<number, NodeJS.Timeout> = new Map();

  startTimer(gameId: number) {
    // Clear any existing timer for this game
    this.stopTimer(gameId);

    const timer = setInterval(async () => {
      try {
        const game = dbOperations.getGameById(gameId);
        if (!game || game.status !== 'in-progress') {
          this.stopTimer(gameId);
          return;
        }

        const newTimeRemaining = game.timeRemaining - 1;
        
        if (newTimeRemaining <= 0) {
          // Timer finished
          dbOperations.updateGame(gameId, {
            timeRemaining: 0,
            isTimerRunning: 0,
          });
          this.stopTimer(gameId);
        } else {
          // Update timer
          dbOperations.updateGame(gameId, {
            timeRemaining: newTimeRemaining,
            isTimerRunning: 1,
          });
        }
      } catch (error) {
        console.error(`Error updating timer for game ${gameId}:`, error);
        this.stopTimer(gameId);
      }
    }, 1000);

    this.timers.set(gameId, timer);
  }

  stopTimer(gameId: number) {
    const timer = this.timers.get(gameId);
    if (timer) {
      clearInterval(timer);
      this.timers.delete(gameId);
    }
  }

  isRunning(gameId: number): boolean {
    return this.timers.has(gameId);
  }

  // Initialize timers for any games that should be running
  initializeTimers() {
    const games = dbOperations.getAllGames();
    games.forEach((game: any) => {
      if (game.status === 'in-progress' && game.isTimerRunning === 1 && game.timeRemaining > 0) {
        this.startTimer(game.id);
      }
    });
  }
}

export const gameTimer = new GameTimer();
