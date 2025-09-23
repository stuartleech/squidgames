'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface Team {
  id: number;
  name: string;
  color: string;
  wins: number;
  losses: number;
  pointsFor: number;
  pointsAgainst: number;
  logo?: string;
}

interface StandingsTeam extends Team {
  points: number;
  gamesPlayed: number;
  pointDifferential: number;
}

interface StandingsViewProps {
  teams: Team[];
}

export default function StandingsView({ teams: initialTeams }: StandingsViewProps) {
  const [teams, setTeams] = useState(initialTeams);

  // Poll for team updates every 5 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const response = await fetch('/api/teams');
        const updatedTeams = await response.json();
        setTeams(updatedTeams);
      } catch (error) {
        console.error('Failed to fetch updated teams:', error);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Calculate standings
  const calculateStandings = (): StandingsTeam[] => {
    return teams.map(team => ({
      ...team,
      points: team.wins * 2 + (team.losses === 0 && team.wins > 0 ? 1 : 0), // 2 points for win, 1 bonus for undefeated
      gamesPlayed: team.wins + team.losses,
      pointDifferential: team.pointsFor - team.pointsAgainst,
    })).sort((a, b) => {
      // Sort by points (descending), then by point differential (descending), then by points for (descending)
      if (b.points !== a.points) return b.points - a.points;
      if (b.pointDifferential !== a.pointDifferential) return b.pointDifferential - a.pointDifferential;
      return b.pointsFor - a.pointsFor;
    });
  };

  const standings = calculateStandings();

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-krakens-pink text-white px-6 py-3">
          <h2 className="text-xl font-bold text-center">
            Tournament Standings
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-2 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rank
                </th>
                <th className="px-2 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Team
                </th>
                <th className="px-1 sm:px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  GP
                </th>
                <th className="px-1 sm:px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  W
                </th>
                <th className="px-1 sm:px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  L
                </th>
                <th className="px-1 sm:px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pts
                </th>
                <th className="px-1 sm:px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  PF
                </th>
                <th className="px-1 sm:px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  PA
                </th>
                <th className="px-1 sm:px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Diff
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {standings.map((team, index) => (
                <tr key={team.id} className="hover:bg-gray-50">
                  <td className="px-2 sm:px-4 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium text-gray-900 text-center">
                    {index === 0 ? '🏆' : index + 1}
                  </td>
                  <td className="px-2 sm:px-4 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium text-gray-900">
                    <div className="flex items-center">
                      <div 
                        className="w-3 h-3 sm:w-4 sm:h-4 rounded-full mr-2 sm:mr-3 flex-shrink-0" 
                        style={{ backgroundColor: team.color }}
                      ></div>
                      <span className="truncate">{team.name}</span>
                    </div>
                  </td>
                  <td className="px-1 sm:px-4 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500 text-center">
                    {team.gamesPlayed}
                  </td>
                  <td className="px-1 sm:px-4 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-green-600 font-medium text-center">
                    {team.wins}
                  </td>
                  <td className="px-1 sm:px-4 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-red-600 font-medium text-center">
                    {team.losses}
                  </td>
                  <td className="px-1 sm:px-4 py-3 sm:py-4 whitespace-nowrap text-sm sm:text-lg font-bold text-krakens-pink text-center">
                    {team.points}
                  </td>
                  <td className="px-1 sm:px-4 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900 text-center">
                    {team.pointsFor}
                  </td>
                  <td className="px-1 sm:px-4 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900 text-center">
                    {team.pointsAgainst}
                  </td>
                  <td className="px-1 sm:px-4 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-center">
                    <span className={`font-medium ${
                      team.pointDifferential > 0 ? 'text-green-600' : 
                      team.pointDifferential < 0 ? 'text-red-600' : 
                      'text-gray-600'
                    }`}>
                      {team.pointDifferential > 0 ? '+' : ''}{team.pointDifferential}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {standings.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg">
              No teams found.
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="mt-4 bg-gray-50 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">Legend:</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-gray-600">
          <div><strong>GP:</strong> Games Played</div>
          <div><strong>W:</strong> Wins</div>
          <div><strong>L:</strong> Losses</div>
          <div><strong>Pts:</strong> Points (2 per win)</div>
          <div><strong>PF:</strong> Points For</div>
          <div><strong>PA:</strong> Points Against</div>
          <div><strong>Diff:</strong> Point Differential</div>
          <div><strong>🏆:</strong> Tournament Leader</div>
        </div>
      </div>
    </div>
  );
}
