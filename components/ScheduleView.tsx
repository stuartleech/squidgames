'use client';

import React from 'react';
import { Game } from '@/types';
import { useState, useEffect } from 'react';

interface ScheduleViewProps {
  games: any[];
}

export default function ScheduleView({ games: initialGames }: ScheduleViewProps) {
  const [games, setGames] = useState(initialGames);

  // Poll for updates every 2 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const response = await fetch('/api/games');
        const updatedGames = await response.json();
        setGames(updatedGames);
      } catch (error) {
        console.error('Failed to fetch updated games:', error);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, []); // Empty dependency array so interval runs consistently

  const formatTime = (timeString: string) => {
    const date = new Date(timeString);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatTimeRange = (timeString: string) => {
    const startDate = new Date(timeString);
    const endDate = new Date(startDate.getTime() + 32 * 60000); // Add 32 minutes (30 + 2 min half time)
    
    const startTime = startDate.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
    
    const endTime = endDate.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
    
    return `${startTime} - ${endTime}`;
  };

  const formatDate = (timeString: string) => {
    const date = new Date(timeString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      month: 'short',
      day: 'numeric'
    });
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

  // Define breaks after each game (based on index position, not game ID)
  const getBreakAfterGame = (index: number): { duration: number; label: string } | null => {
    switch (index) {
      case 0: return { duration: 8, label: '8 Minute Changeover' }; // After game 1
      case 1: return { duration: 18, label: '18 Minute Break' }; // After game 2
      case 2: return { duration: 8, label: '8 Minute Changeover' }; // After game 3
      case 3: return { duration: 18, label: '18 Minute Break' }; // After game 4
      case 4: return { duration: 8, label: '8 Minute Changeover' }; // After game 5
      default: return null;
    }
  };

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
              {sortedGames.map((game, index) => (
                <React.Fragment key={game.id}>
                <div key={game.id} className="p-3 sm:p-4 hover:bg-gray-50 transition-colors min-h-[80px] sm:min-h-[100px]">
                  {/* Mobile Layout - Stacked */}
                  <div className="sm:hidden">
                    {/* Status at top center */}
                    <div className="flex justify-center mb-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(game.status)}`}>
                        {game.status === 'in-progress' ? 'LIVE' : 
                         game.status === 'completed' ? 'FINAL' : 
                         'SCHEDULED'}
                      </span>
                    </div>

                    {/* Teams and scores stacked */}
                    <div className="text-center">
                      {/* Teams and scores on same line */}
                      <div className="flex items-center justify-between gap-1 mb-2">
                        {/* Home Team */}
                        <div className="flex items-center space-x-1 min-w-0 flex-1 justify-end">
                          <span className="font-semibold text-xs whitespace-nowrap">{game.homeTeamName}</span>
                          <div 
                            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                            style={{ background: game.homeTeamColor }}
                          ></div>
                        </div>
                        
                        {/* Scores */}
                        <div className="flex items-center justify-center space-x-1 flex-shrink-0 mx-2">
                          {game.homeScore !== null && game.awayScore !== null ? (
                            <>
                              <div className="text-lg font-bold text-gray-900">
                                {game.homeScore}
                              </div>
                              <span className="text-gray-500 font-medium text-sm">-</span>
                              <div className="text-lg font-bold text-gray-900">
                                {game.awayScore}
                              </div>
                            </>
                          ) : (
                            <div className="text-sm font-bold text-gray-900">
                              {formatTime(game.scheduledTime)}
                            </div>
                          )}
                        </div>
                        
                        {/* Away Team */}
                        <div className="flex items-center space-x-1 min-w-0 flex-1 justify-start">
                          <div 
                            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                            style={{ background: game.awayTeamColor }}
                          ></div>
                          <span className="font-semibold text-xs whitespace-nowrap">{game.awayTeamName}</span>
                        </div>
                      </div>
                    </div>

                    {/* Time, field, ref info at the bottom */}
                    <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs text-gray-600">
                      <span className="whitespace-nowrap">🕒 {formatTimeRange(game.scheduledTime)}</span>
                      <span className="whitespace-nowrap">⏱️ 2 x 15 min halves</span>
                      <span className="whitespace-nowrap">⏸️ 2 min half time</span>
                      {game.referee && (
                        <span className="whitespace-nowrap">👨‍⚖️ Ref: {game.referee}</span>
                      )}
                    </div>
                  </div>

                  {/* Desktop Layout - Horizontal */}
                  <div className="hidden sm:flex items-center h-full">
                    {/* Status on the left - fixed width */}
                    <div className="w-20 flex justify-start">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(game.status)}`}>
                        {game.status === 'in-progress' ? 'LIVE' : 
                         game.status === 'completed' ? 'FINAL' : 
                         'SCHEDULED'}
                      </span>
                    </div>

                    {/* Team names and scores in the center */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        {/* Home Team Name + Circle */}
                        <div className="flex items-center justify-end space-x-1.5 min-w-0 flex-1">
                          <span className="font-semibold text-lg whitespace-nowrap truncate">{game.homeTeamName}</span>
                          <div 
                            className="w-4 h-4 rounded-full flex-shrink-0"
                            style={{ background: game.homeTeamColor }}
                          ></div>
                        </div>
                        
                        {/* Scores */}
                        <div className="flex items-center justify-center space-x-1 flex-shrink-0">
                          {game.homeScore !== null && game.awayScore !== null ? (
                            <>
                              <div className="text-3xl font-bold text-gray-900">
                                {game.homeScore}
                              </div>
                              <span className="text-gray-500 font-medium text-lg">-</span>
                              <div className="text-3xl font-bold text-gray-900">
                                {game.awayScore}
                              </div>
                            </>
                          ) : (
                            <div className="text-3xl font-bold text-gray-900">
                              {formatTime(game.scheduledTime)}
                            </div>
                          )}
                        </div>
                        
                        {/* Away Team Circle + Name */}
                        <div className="flex items-center justify-start space-x-1.5 min-w-0 flex-1">
                          <div 
                            className="w-4 h-4 rounded-full flex-shrink-0"
                            style={{ background: game.awayTeamColor }}
                          ></div>
                          <span className="font-semibold text-lg whitespace-nowrap truncate">{game.awayTeamName}</span>
                        </div>
                      </div>

                      {/* Time, field, ref info at the bottom */}
                      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-gray-600 mt-2">
                        <span>🕒 {formatTimeRange(game.scheduledTime)}</span>
                        <span>⏱️ 2 x 15 min halves</span>
                        <span>⏸️ 2 min half time</span>
                        {game.referee && (
                          <span>👨‍⚖️ Ref: {game.referee}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Break display after game */}
                {getBreakAfterGame(index) && (
                  <div className="bg-gradient-to-r from-krakens-yellow/20 to-krakens-pink/20 border-y border-gray-200">
                    <div className="p-3 sm:p-4 text-center">
                      <div className="flex items-center justify-center gap-2 text-sm font-medium text-gray-700">
                        <span>⏸️</span>
                        <span>{getBreakAfterGame(index)?.label}</span>
                      </div>
                    </div>
                  </div>
                )}
                </React.Fragment>
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