'use client';

import { useState, useEffect } from 'react';
import ScheduleView from '@/components/ScheduleView';
import StandingsView from '@/components/StandingsView';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'schedule' | 'standings' | 'rules'>('schedule');
  const [games, setGames] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [rules, setRules] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setHasError(false);
      
      try {
        const [gamesResponse, teamsResponse, rulesResponse] = await Promise.all([
          fetch('/api/games'),
          fetch('/api/teams'),
          fetch('/api/rules')
        ]);
        
        if (gamesResponse.ok && teamsResponse.ok && rulesResponse.ok) {
          const gamesData = await gamesResponse.json();
          const teamsData = await teamsResponse.json();
          const rulesData = await rulesResponse.json();
          
          setGames(gamesData);
          setTeams(teamsData);
          setRules(rulesData);
        } else {
          console.error('Failed to fetch data:', gamesResponse.status, teamsResponse.status, rulesResponse.status);
          setHasError(true);
          // Set empty arrays as fallback
          setGames([]);
          setTeams([]);
          setRules([]);
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
        setHasError(true);
        // Set empty arrays as fallback
        setGames([]);
        setTeams([]);
        setRules([]);
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
          <div className="flex flex-col items-center justify-center space-y-2 sm:space-y-4">
            <img 
              src="/Krakens-Logo-transparent.png" 
              alt="Margate Krakens Logo" 
              className="h-20 w-auto sm:h-40"
            />
            <div>
              <h1 className="text-2xl sm:text-5xl font-black text-white mb-1 font-orbitron tracking-wider">
                SQUID GAMES
              </h1>
              <p className="text-white/90 text-sm sm:text-lg font-medium">
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
            <button
              onClick={() => setActiveTab('rules')}
              className={`px-6 py-2 rounded-md font-medium transition-all ${
                activeTab === 'rules'
                  ? 'bg-white text-krakens-pink shadow-lg'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              📋 Rules
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
            {activeTab === 'rules' && (
              <div className="max-w-6xl mx-auto">
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                  <div className="bg-krakens-pink text-white px-6 py-3">
                    <h2 className="text-xl font-bold text-center">
                      Tournament Rules
                    </h2>
                  </div>
                  
                  <div className="p-6 space-y-6">
                    {rules.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="text-gray-500 text-lg">
                          No rules available. Please contact the administrator.
                        </div>
                      </div>
                    ) : (
                      rules.map((rule) => (
                        <div key={rule.id} className="bg-gray-50 rounded-lg p-4">
                          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                            {rule.section === 'throw-off' && '🏈'}
                            {rule.section === 'special-plays' && '⚡'}
                            {rule.section === 'general-notes' && '📝'}
                            {' '}{rule.title}
                          </h3>
                          <div 
                            className="text-gray-700 prose prose-sm max-w-none"
                            dangerouslySetInnerHTML={{ 
                              __html: rule.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br/>') 
                            }}
                          />
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
