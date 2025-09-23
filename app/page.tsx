'use client';

import { useState, useEffect } from 'react';
import ScheduleView from '@/components/ScheduleView';
import StandingsView from '@/components/StandingsView';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'schedule' | 'standings'>('schedule');
  const [games, setGames] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [gamesResponse, teamsResponse] = await Promise.all([
          fetch('/api/games'),
          fetch('/api/teams')
        ]);
        
        const gamesData = await gamesResponse.json();
        const teamsData = await teamsResponse.json();
        
        setGames(gamesData);
        setTeams(teamsData);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-br from-krakens-yellow to-krakens-pink">
      <div className="container mx-auto px-4 py-8">
        {/* Centered Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-8">
            <img 
              src="/Krakens-Logo-transparent.png" 
              alt="Margate Krakens Logo" 
              className="h-40 w-auto"
            />
            <div>
              <h1 className="text-5xl font-black text-white mb-1 font-orbitron tracking-wider">
                SQUID GAMES
              </h1>
              <p className="text-white/90 text-lg font-medium">
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
        {activeTab === 'schedule' && <ScheduleView games={games} />}
        {activeTab === 'standings' && <StandingsView teams={teams} />}
      </div>
    </main>
  );
}
