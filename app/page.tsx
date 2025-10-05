'use client';

import { useState, useEffect } from 'react';
import ScheduleView from '@/components/ScheduleView';
import StandingsView from '@/components/StandingsView';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'schedule' | 'standings' | 'rules'>('schedule');
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
                    {/* Throw Off Rules */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                        🏈 Throw Off Rules
                      </h3>
                      <div className="space-y-3 text-gray-700">
                        <p>
                          At the start of each half, the team who starts with the ball has the opportunity to return a <strong>3-on-1 throw off situation</strong> which involves:
                        </p>
                        <ul className="list-disc list-inside space-y-2 ml-4">
                          <li>One returner in the endzone of their own half</li>
                          <li>Three members of the defending team who must line up as follows:</li>
                        </ul>
                        <div className="ml-6 space-y-2">
                          <p><strong>Thrower:</strong> Lines up at halfway and cannot move until the returner catches the ball. He can then proceed to join his teammates in trying to tackle the returner.</p>
                          <p><strong>Two Defenders:</strong> Must line up on their own goal line but as soon as the ball is thrown they can chase down the returner.</p>
                        </div>
                        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 mt-3">
                          <p><strong>Important:</strong> The ball must go further than 10 yards on the throw off. If the ball goes out of bounds without touching the returning player, the returning team will start their drive 1 yard from the halfway line.</p>
                        </div>
                        <p>Wherever the runner finishes the play (tackled/out of bounds) is where the offense starts their drive on the ensuing play. Any of the standard flag football penalties apply during this play.</p>
                      </div>
                    </div>

                    {/* Special Plays */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                        ⚡ Special Plays
                      </h3>
                      <div className="space-y-4 text-gray-700">
                        <div className="flex items-start space-x-3">
                          <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-medium flex-shrink-0">
                            QB RUN
                          </div>
                          <p>Any team can run their QB directly from snap <strong>ONCE per half</strong>. This will be noted on the scoresheet by the refereeing team.</p>
                        </div>
                        <div className="flex items-start space-x-3">
                          <div className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm font-medium flex-shrink-0">
                            BULLET BLITZ
                          </div>
                          <p>Any team can blitz from anywhere <strong>ONCE per half</strong>. This will be noted on the scoresheet by the refereeing team.</p>
                        </div>
                      </div>
                    </div>

                    {/* General Notes */}
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                        📝 General Notes
                      </h3>
                      <div className="text-gray-700 space-y-2">
                        <p>• All standard flag football rules apply</p>
                        <p>• Referees will track special plays (QB RUN and BULLET BLITZ) on the scoresheet</p>
                        <p>• Teams are limited to one QB RUN and one BULLET BLITZ per half</p>
                        <p>• Penalties during throw off situations follow standard flag football penalty rules</p>
                      </div>
                    </div>
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
