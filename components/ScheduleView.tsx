'use client';

import { Game } from '@/types';
import { useState, useEffect } from 'react';

interface ScheduleViewProps {
  games: any[];
}

export default function ScheduleView({ games: initialGames }: ScheduleViewProps) {
  const [games, setGames] = useState(initialGames);

  // Poll for updates every 500ms when there are active timers, otherwise every 5 seconds
  useEffect(() => {
    const hasActiveTimers = games.some(game => game.status === 'in-progress' && game.isTimerRunning === 1);
    const pollInterval = hasActiveTimers ? 500 : 5000;
    
    const interval = setInterval(async () => {
      try {
        const response = await fetch('/api/games');
        const updatedGames = await response.json();
        setGames(updatedGames);
      } catch (error) {
        console.error('Failed to fetch updated games:', error);
      }
    }, pollInterval);

    return () => clearInterval(interval);
  }, [games]);

  const formatTime = (timeString: string) => {
    const date = new Date(timeString);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatDate = (timeString: string) => {
    const date = new Date(timeString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCountdownTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      case 'in-progress':
        return 'bg-green-100 text-green-800 animate-pulse';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Since all games are on the same day, we'll display them in chronological order
  const sortedGames = games.sort((a, b) => 
    new Date(a.scheduledTime).getTime() - new Date(b.scheduledTime).getTime()
  );

  return (
    <div className="max-w-6xl mx-auto">
      {/* Games List */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-krakens-pink text-white px-6 py-3">
          <h2 className="text-xl font-bold text-center">
            Match Schedule
          </h2>
        </div>
        
        <div className="divide-y divide-gray-200">
          {sortedGames.map((game) => (
            <div key={game.id} className="p-3 sm:p-4 hover:bg-gray-50 transition-colors min-h-[80px] sm:min-h-[100px]">
              <div className="flex items-center h-full">
                {/* Status on the left - fixed width */}
                <div className="w-16 sm:w-20 flex justify-center sm:justify-start">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(game.status)}`}>
                    {game.status === 'in-progress' ? 'LIVE' : 
                     game.status === 'completed' ? 'FINAL' : 
                     'SCHEDULED'}
                  </span>
                </div>

                {/* Team names and scores in the center */}
                <div className="flex-1">
                  <div className="grid grid-cols-3 items-center gap-1 sm:gap-2 text-center">
                    {/* Home Team */}
                    <div className="col-span-1 flex items-center justify-end space-x-1 sm:space-x-2">
                      <span className="font-semibold text-sm sm:text-lg whitespace-nowrap">{game.homeTeamName}</span>
                      <div 
                        className="w-3 h-3 sm:w-4 sm:h-4 rounded-full flex-shrink-0"
                        style={{ backgroundColor: game.homeTeamColor }}
                      ></div>
                    </div>
                    
                    {/* Scores together in center */}
                    <div className="col-span-1 flex items-center justify-center space-x-1 sm:space-x-2">
                      <div className="text-xl sm:text-3xl font-bold text-gray-900">
                        {game.homeScore !== null ? game.homeScore : '-'}
                      </div>
                      <span className="text-gray-500 font-medium text-sm sm:text-lg">-</span>
                      <div className="text-xl sm:text-3xl font-bold text-gray-900">
                        {game.awayScore !== null ? game.awayScore : '-'}
                      </div>
                    </div>
                    
                    {/* Away Team */}
                    <div className="col-span-1 flex items-center justify-start space-x-1 sm:space-x-2">
                      <div 
                        className="w-3 h-3 sm:w-4 sm:h-4 rounded-full flex-shrink-0"
                        style={{ backgroundColor: game.awayTeamColor }}
                      ></div>
                      <span className="font-semibold text-sm sm:text-lg whitespace-nowrap">{game.awayTeamName}</span>
                    </div>
                  </div>

                  {/* Time, field, ref info at the bottom */}
                  <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-gray-600 mt-2">
                    <span>🕒 {formatTime(game.scheduledTime)}</span>
                    <span>🏟️ Field {game.field}</span>
                    {game.referee && (
                      <span>👨‍⚖️ Ref: {game.referee}</span>
                    )}
                        {game.status === 'in-progress' && (
                          <>
                            <span>{game.half === 1 ? '1st Half' : '2nd Half'}</span>
                            <span className={`font-medium ${game.isTimerRunning === 1 ? 'text-green-600 animate-pulse' : 'text-red-600'}`}>
                              {formatCountdownTime(game.timeRemaining)}
                            </span>
                          </>
                        )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {sortedGames.length === 0 && (
        <div className="text-center py-12">
          <div className="text-white/60 text-lg">
            No games scheduled.
          </div>
        </div>
      )}
    </div>
  );
}