'use client';

import { useState, useEffect } from 'react';
import ScheduleView from '@/components/ScheduleView';
import StandingsView from '@/components/StandingsView';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'schedule' | 'standings'>('schedule');
  const [games, setGames] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setHasError(false);
      
      try {
        const [gamesResponse, teamsResponse] = await Promise.all([
          fetch('/api/games'),
          fetch('/api/teams')
        ]);
        
        if (gamesResponse.ok && teamsResponse.ok) {
          const gamesData = await gamesResponse.json();
          const teamsData = await teamsResponse.json();
          
          setGames(gamesData);
          setTeams(teamsData);
        } else {
          console.error('Failed to fetch data:', gamesResponse.status, teamsResponse.status);
          setHasError(true);
          // Set empty arrays as fallback
          setGames([]);
          setTeams([]);
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
        setHasError(true);
        // Set empty arrays as fallback
        setGames([]);
        setTeams([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
        <main className="min-h-screen bg-gradient-to-br from-krakens-yellow to-krakens-pink">
          <div className="container mx-auto px-4 pt-2 pb-4 sm:pt-4 sm:pb-6">
        {/* Centered Header */}
        <div className="text-center mb-3 sm:mb-4">
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-8">
            <img 
              src="/Krakens-Logo-transparent.png" 
              alt="Margate Krakens Logo" 
              className="h-24 w-auto sm:h-40"
            />
            <div>
              <h1 className="text-3xl sm:text-5xl font-black text-white mb-1 font-orbitron tracking-wider">
                SQUID GAMES
              </h1>
              <p className="text-white/90 text-base sm:text-lg font-medium">
                11th October 2025
              </p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-6">
          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-1">
            <button
              onClick={() => setActiveTab('schedule')}
              className={`px-6 py-2 rounded-md font-medium transition-all ${
                activeTab === 'schedule'
                  ? 'bg-white text-krakens-pink shadow-lg'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              📅 Schedule
            </button>
            <button
              onClick={() => setActiveTab('standings')}
              className={`px-6 py-2 rounded-md font-medium transition-all ${
                activeTab === 'standings'
                  ? 'bg-white text-krakens-pink shadow-lg'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              🏆 Standings
            </button>
          </div>
        </div>
        
        {/* Tab Content */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="text-white/80 text-lg">
              Loading tournament data...
            </div>
          </div>
        ) : hasError ? (
          <div className="text-center py-12">
            <div className="text-white/80 text-lg mb-4">
              Failed to load tournament data. Please refresh the page.
            </div>
            <button
              onClick={() => window.location.reload()}
              className="bg-white/20 text-white px-4 py-2 rounded-md hover:bg-white/30 transition-colors"
            >
              Refresh Page
            </button>
          </div>
        ) : (
          <>
            {activeTab === 'schedule' && <ScheduleView games={games} />}
            {activeTab === 'standings' && <StandingsView teams={teams} />}
          </>
        )}
      </div>
    </main>
  );
}
