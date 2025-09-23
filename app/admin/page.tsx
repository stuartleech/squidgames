'use client';

import { useState, useEffect } from 'react';
import { Game } from '@/types';

export default function AdminPanel() {
  const [games, setGames] = useState<any[]>([]);
  const [selectedGame, setSelectedGame] = useState<any>(null);
  const [homeScore, setHomeScore] = useState('');
  const [awayScore, setAwayScore] = useState('');
  const [status, setStatus] = useState('scheduled');
  const [half, setHalf] = useState(1);
  const [timeRemaining, setTimeRemaining] = useState(900);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    fetchGames();
  }, []);

  // Poll for updates every 500ms when timer is running, otherwise every 2 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchGames();
    }, isTimerRunning ? 500 : 2000);

    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const fetchGames = async () => {
    try {
      const response = await fetch('/api/games');
      const gamesData = await response.json();
      setGames(gamesData);
      
      // Update selected game's timer if it's still selected
      if (selectedGame) {
        const updatedGame = gamesData.find((g: any) => g.id === selectedGame.id);
        if (updatedGame) {
          setTimeRemaining(updatedGame.timeRemaining || 900);
          setIsTimerRunning(updatedGame.isTimerRunning === 1);
        }
      }
    } catch (error) {
      console.error('Failed to fetch games:', error);
    }
  };

  const handleGameSelect = (game: any) => {
    setSelectedGame(game);
    setHomeScore(game.homeScore?.toString() || '');
    setAwayScore(game.awayScore?.toString() || '');
    setStatus(game.status);
    setHalf(game.half || 1);
    setTimeRemaining(game.timeRemaining || 900);
    setIsTimerRunning(game.isTimerRunning === 1);
  };

  const formatCountdownTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleUpdateGame = async () => {
    if (!selectedGame) return;

    setIsUpdating(true);
    try {
      const response = await fetch(`/api/games/${selectedGame.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          homeScore: homeScore ? parseInt(homeScore) : null,
          awayScore: awayScore ? parseInt(awayScore) : null,
          status,
          half,
          timeRemaining,
          isTimerRunning,
        }),
      });

      if (response.ok) {
        await fetchGames();
        alert('Game updated successfully!');
      } else {
        alert('Failed to update game');
      }
    } catch (error) {
      console.error('Error updating game:', error);
      alert('Error updating game');
    } finally {
      setIsUpdating(false);
    }
  };

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
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        {/* Admin Header */}
        <div className="text-center mb-8">
          <div className="flex flex-col items-center space-y-4">
            <img 
              src="/Krakens-Logo-transparent.png" 
              alt="Margate Krakens Logo" 
              className="h-24 w-auto"
            />
            <h1 className="text-4xl font-bold text-krakens-dark">
              Admin Panel
            </h1>
            <p className="text-gray-600 text-lg">
              Squid Games 2025 - Score Management
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">

          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Games List */}
              <div>
                <h2 className="text-lg font-semibold mb-4">Select Game</h2>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {games.map((game) => (
                    <div
                      key={game.id}
                      onClick={() => handleGameSelect(game)}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedGame?.id === game.id
                          ? 'border-krakens-pink bg-krakens-yellow/20'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">
                            {game.homeTeamName} vs {game.awayTeamName}
                          </div>
                          <div className="text-sm text-gray-600">
                            {formatDate(game.scheduledTime)} at {formatTime(game.scheduledTime)}
                          </div>
                          <div className="text-sm text-gray-500">
                            {game.status}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold">
                            {game.homeScore !== null ? game.homeScore : '-'} - {game.awayScore !== null ? game.awayScore : '-'}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Game Update Form */}
              <div>
                {selectedGame ? (
                  <div>
                    <h2 className="text-lg font-semibold mb-4">Update Game</h2>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Game Status
                        </label>
                        <select
                          value={status}
                          onChange={(e) => setStatus(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-krakens-pink"
                        >
                          <option value="scheduled">Scheduled</option>
                          <option value="in-progress">In Progress</option>
                          <option value="completed">Completed</option>
                        </select>
                      </div>

                      {status === 'in-progress' && (
                        <>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Half
                            </label>
                            <select
                              value={half}
                              onChange={(e) => {
                                const newHalf = parseInt(e.target.value);
                                setHalf(newHalf);
                                setTimeRemaining(900); // Reset to 15 minutes for new half
                              }}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-krakens-pink"
                            >
                              <option value={1}>1st Half</option>
                              <option value={2}>2nd Half</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Time Remaining: {formatCountdownTime(timeRemaining)}
                            </label>
                            <div className="flex space-x-2">
                                  <button
                                    type="button"
                                    onClick={() => setIsTimerRunning(!isTimerRunning)}
                                    className={`flex-1 py-2 px-4 rounded-md font-medium ${
                                      isTimerRunning
                                        ? 'bg-green-600 text-white hover:bg-green-700'
                                        : 'bg-red-600 text-white hover:bg-red-700'
                                    }`}
                                  >
                                    {isTimerRunning ? 'Stop Timer' : 'Start Timer'}
                                  </button>
                              <button
                                type="button"
                                onClick={() => setTimeRemaining(900)}
                                className="flex-1 py-2 px-4 rounded-md font-medium bg-gray-600 text-white hover:bg-gray-700"
                              >
                                Reset to 15:00
                              </button>
                            </div>
                          </div>
                        </>
                      )}

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            {selectedGame.homeTeamName} Score
                          </label>
                          <input
                            type="number"
                            value={homeScore}
                            onChange={(e) => setHomeScore(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-krakens-pink"
                            placeholder="0"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            {selectedGame.awayTeamName} Score
                          </label>
                          <input
                            type="number"
                            value={awayScore}
                            onChange={(e) => setAwayScore(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-krakens-pink"
                            placeholder="0"
                          />
                        </div>
                      </div>

                      <button
                        onClick={handleUpdateGame}
                        disabled={isUpdating}
                        className="w-full bg-krakens-pink text-white py-2 px-4 rounded-md hover:bg-krakens-pink/90 focus:outline-none focus:ring-2 focus:ring-krakens-pink disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isUpdating ? 'Updating...' : 'Update Game'}
                      </button>

                      {status === 'scheduled' && (
                        <button
                          onClick={() => {
                            setStatus('in-progress');
                            setTimeRemaining(900);
                            setIsTimerRunning(false);
                          }}
                          className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-600"
                        >
                          Start Match
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    Select a game to update scores and status
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
