'use client';

import { useState, useEffect } from 'react';
import { Game } from '@/types';

export default function AdminPanel() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Cookie management functions
  const setCookie = (name: string, value: string, days: number) => {
    const expires = new Date();
    expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
  };

  const getCookie = (name: string): string | null => {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  };

  const deleteCookie = (name: string) => {
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
  };

  // Check for existing login cookie on component mount
  useEffect(() => {
    const savedAuth = getCookie('admin_authenticated');
    if (savedAuth === 'true') {
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);
  const [games, setGames] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [selectedGame, setSelectedGame] = useState<any>(null);
  const [homeScore, setHomeScore] = useState('');
  const [awayScore, setAwayScore] = useState('');
  const [status, setStatus] = useState('scheduled');
  const [half, setHalf] = useState(1);
  const [timeRemaining, setTimeRemaining] = useState(900);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [referee, setReferee] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showTeamManagement, setShowTeamManagement] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<any>(null);
  const [teamName, setTeamName] = useState('');
  const [teamColor, setTeamColor] = useState('#000000');
  const [teamLogo, setTeamLogo] = useState('');
  const [isDeletingGame, setIsDeletingGame] = useState(false);
  const [rules, setRules] = useState<any[]>([]);
  const [showRulesManagement, setShowRulesManagement] = useState(false);
  const [selectedRule, setSelectedRule] = useState<any>(null);
  const [ruleTitle, setRuleTitle] = useState('');
  const [ruleContent, setRuleContent] = useState('');
  const [ruleSection, setRuleSection] = useState('throw-off');
  const [ruleOrder, setRuleOrder] = useState(1);

  useEffect(() => {
    if (isAuthenticated) {
      fetchGames();
      fetchTeams();
      fetchRules();
    }
  }, [isAuthenticated]);

  // Poll for updates every 500ms when timer is running, otherwise every 2 seconds
  useEffect(() => {
    if (!isAuthenticated) return;
    
    const interval = setInterval(() => {
      fetchGames();
    }, isTimerRunning ? 500 : 2000);

    return () => clearInterval(interval);
  }, [isTimerRunning, isAuthenticated]);

  const handleLogin = () => {
    if (password === '_Squid-Games-2025!_') {
      setIsAuthenticated(true);
      setPasswordError('');
      // Set cookie to remember login for 7 days
      setCookie('admin_authenticated', 'true', 7);
    } else {
      setPasswordError('Incorrect password');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setPassword('');
    setSelectedGame(null);
    setShowCreateForm(false);
    // Clear the authentication cookie
    deleteCookie('admin_authenticated');
  };

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

  const fetchTeams = async () => {
    try {
      const response = await fetch('/api/teams');
      const teamsData = await response.json();
      setTeams(teamsData);
    } catch (error) {
      console.error('Failed to fetch teams:', error);
    }
  };

  const fetchRules = async () => {
    try {
      const response = await fetch('/api/rules');
      const rulesData = await response.json();
      setRules(rulesData);
    } catch (error) {
      console.error('Failed to fetch rules:', error);
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
    setReferee(game.referee || '');
    setShowCreateForm(false);
  };

  const handleCreateGame = async () => {
    if (!selectedGame) return;

    setIsCreating(true);
    try {
      const response = await fetch('/api/games', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          homeTeamId: selectedGame.homeTeamId,
          awayTeamId: selectedGame.awayTeamId,
          scheduledTime: selectedGame.scheduledTime,
          field: selectedGame.field || '1',
          status: 'scheduled',
          referee: selectedGame.referee || '',
        }),
      });

      if (response.ok) {
        await fetchGames();
        alert('Game created successfully!');
        setShowCreateForm(false);
        setSelectedGame(null);
      } else {
        alert('Failed to create game');
      }
    } catch (error) {
      console.error('Error creating game:', error);
      alert('Error creating game');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteGame = async () => {
    if (!selectedGame || !selectedGame.id) return;

    if (!confirm(`Are you sure you want to delete the game between ${selectedGame.homeTeamName} and ${selectedGame.awayTeamName}?`)) {
      return;
    }

    setIsDeletingGame(true);
    try {
      const response = await fetch(`/api/games/${selectedGame.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchGames();
        alert('Game deleted successfully!');
        setSelectedGame(null);
        setShowCreateForm(false);
      } else {
        alert('Failed to delete game');
      }
    } catch (error) {
      console.error('Error deleting game:', error);
      alert('Error deleting game');
    } finally {
      setIsDeletingGame(false);
    }
  };

  const handleCreateTeam = async () => {
    if (!teamName.trim()) {
      alert('Team name is required');
      return;
    }

    try {
      const response = await fetch('/api/teams', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: teamName,
          color: teamColor,
          logo: teamLogo,
          wins: 0,
          losses: 0,
          pointsFor: 0,
          pointsAgainst: 0,
        }),
      });

      if (response.ok) {
        await fetchTeams();
        alert('Team created successfully!');
        setTeamName('');
        setTeamColor('#000000');
        setTeamLogo('');
      } else {
        alert('Failed to create team');
      }
    } catch (error) {
      console.error('Error creating team:', error);
      alert('Error creating team');
    }
  };

  const handleDeleteTeam = async (teamId: number) => {
    const team = teams.find(t => t.id === teamId);
    if (!team) return;

    if (!confirm(`Are you sure you want to delete ${team.name}? This will also delete all games involving this team.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/teams/${teamId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchTeams();
        await fetchGames(); // Refresh games in case any were deleted
        alert('Team deleted successfully!');
      } else {
        alert('Failed to delete team');
      }
    } catch (error) {
      console.error('Error deleting team:', error);
      alert('Error deleting team');
    }
  };

  // Rules Management Functions
  const handleRuleSelect = (rule: any) => {
    setSelectedRule(rule);
    setRuleTitle(rule.title);
    setRuleContent(rule.content);
    setRuleSection(rule.section);
    setRuleOrder(rule.order);
    setShowCreateForm(false);
    setShowTeamManagement(false);
  };

  const handleCreateRule = async () => {
    if (!ruleTitle.trim() || !ruleContent.trim()) {
      alert('Rule title and content are required');
      return;
    }

    try {
      const response = await fetch('/api/rules', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: ruleTitle,
          content: ruleContent,
          section: ruleSection,
          order: ruleOrder,
        }),
      });

      if (response.ok) {
        await fetchRules();
        alert('Rule created successfully!');
        setRuleTitle('');
        setRuleContent('');
        setRuleSection('throw-off');
        setRuleOrder(1);
        setSelectedRule(null);
      } else {
        alert('Failed to create rule');
      }
    } catch (error) {
      console.error('Error creating rule:', error);
      alert('Error creating rule');
    }
  };

  const handleUpdateRule = async () => {
    if (!selectedRule) return;

    try {
      const response = await fetch(`/api/rules/${selectedRule.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: ruleTitle,
          content: ruleContent,
          section: ruleSection,
          order: ruleOrder,
        }),
      });

      if (response.ok) {
        await fetchRules();
        alert('Rule updated successfully!');
        setSelectedRule(null);
      } else {
        alert('Failed to update rule');
      }
    } catch (error) {
      console.error('Error updating rule:', error);
      alert('Error updating rule');
    }
  };

  const handleDeleteRule = async (ruleId: number) => {
    const rule = rules.find(r => r.id === ruleId);
    if (!rule) return;

    if (!confirm(`Are you sure you want to delete "${rule.title}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/rules/${ruleId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchRules();
        alert('Rule deleted successfully!');
        if (selectedRule && selectedRule.id === ruleId) {
          setSelectedRule(null);
        }
      } else {
        alert('Failed to delete rule');
      }
    } catch (error) {
      console.error('Error deleting rule:', error);
      alert('Error deleting rule');
    }
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
          referee,
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

  // Show loading state while checking cookie
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 py-8">
        <div className="container mx-auto px-4">
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
          <div className="max-w-md mx-auto">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-krakens-pink mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Login form
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-100 py-8">
        <div className="container mx-auto px-4">
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

          <div className="max-w-md mx-auto">
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-center mb-6">Login Required</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-krakens-pink"
                    placeholder="Enter admin password"
                  />
                  {passwordError && (
                    <p className="text-red-600 text-sm mt-1">{passwordError}</p>
                  )}
                </div>
                <button
                  onClick={handleLogin}
                  className="w-full bg-krakens-pink text-white py-2 px-4 rounded-md hover:bg-krakens-pink/90 focus:outline-none focus:ring-2 focus:ring-krakens-pink"
                >
                  Login
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
            <button
              onClick={handleLogout}
              className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-600"
            >
              Logout
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">

          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Games List */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold">Select Game</h2>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setShowTeamManagement(!showTeamManagement)}
                      className="bg-blue-600 text-white px-3 py-1 rounded-md text-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    >
                      {showTeamManagement ? 'Hide Teams' : 'Manage Teams'}
                    </button>
                    <button
                      onClick={() => setShowRulesManagement(!showRulesManagement)}
                      className="bg-purple-600 text-white px-3 py-1 rounded-md text-sm hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-600"
                    >
                      {showRulesManagement ? 'Hide Rules' : 'Manage Rules'}
                    </button>
                    <button
                      onClick={() => {
                        setShowCreateForm(true);
                        setSelectedGame({
                          homeTeamId: 1,
                          awayTeamId: 2,
                          scheduledTime: new Date().toISOString(),
                          field: '1',
                          referee: ''
                        });
                      }}
                      className="bg-green-600 text-white px-3 py-1 rounded-md text-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-600"
                    >
                      + New Game
                    </button>
                  </div>
                </div>
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

                {/* Team Management Section */}
                {showTeamManagement && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-4">Team Management</h3>
                    
                    {/* Create New Team */}
                    <div className="bg-gray-50 p-4 rounded-lg mb-4">
                      <h4 className="font-medium mb-3">Add New Team</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <input
                          type="text"
                          placeholder="Team Name"
                          value={teamName}
                          onChange={(e) => setTeamName(e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-krakens-pink"
                        />
                        <input
                          type="color"
                          value={teamColor}
                          onChange={(e) => setTeamColor(e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-krakens-pink"
                        />
                        <input
                          type="url"
                          placeholder="Logo URL"
                          value={teamLogo}
                          onChange={(e) => setTeamLogo(e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-krakens-pink"
                        />
                      </div>
                      <button
                        onClick={handleCreateTeam}
                        className="mt-3 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-600"
                      >
                        Add Team
                      </button>
                    </div>

                    {/* Teams List */}
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {teams.map((team) => (
                        <div key={team.id} className="flex items-center justify-between p-3 bg-white border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div 
                              className="w-4 h-4 rounded-full" 
                              style={{ backgroundColor: team.color }}
                            ></div>
                            <span className="font-medium">{team.name}</span>
                            <span className="text-sm text-gray-500">
                              ({team.wins}W - {team.losses}L)
                            </span>
                          </div>
                          <button
                            onClick={() => handleDeleteTeam(team.id)}
                            className="text-red-600 hover:text-red-800 px-2 py-1 rounded text-sm"
                          >
                            Delete
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Rules Management Section */}
                {showRulesManagement && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-4">Rules Management</h3>
                    
                    {/* Create New Rule */}
                    <div className="bg-gray-50 p-4 rounded-lg mb-4">
                      <h4 className="font-medium mb-3">Add New Rule</h4>
                      <div className="space-y-3">
                        <input
                          type="text"
                          placeholder="Rule Title"
                          value={ruleTitle}
                          onChange={(e) => setRuleTitle(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-krakens-pink"
                        />
                        <textarea
                          placeholder="Rule Content (supports markdown)"
                          value={ruleContent}
                          onChange={(e) => setRuleContent(e.target.value)}
                          rows={4}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-krakens-pink"
                        />
                        <div className="grid grid-cols-2 gap-3">
                          <select
                            value={ruleSection}
                            onChange={(e) => setRuleSection(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-krakens-pink"
                          >
                            <option value="throw-off">Throw Off Rules</option>
                            <option value="special-plays">Special Plays</option>
                            <option value="general-notes">General Notes</option>
                          </select>
                          <input
                            type="number"
                            placeholder="Order"
                            value={ruleOrder}
                            onChange={(e) => setRuleOrder(parseInt(e.target.value) || 1)}
                            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-krakens-pink"
                          />
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={handleCreateRule}
                            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-600"
                          >
                            Create Rule
                          </button>
                          {selectedRule && (
                            <button
                              onClick={handleUpdateRule}
                              className="bg-krakens-pink text-white px-4 py-2 rounded-md hover:bg-krakens-pink/90 focus:outline-none focus:ring-2 focus:ring-krakens-pink"
                            >
                              Update Rule
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Existing Rules */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium mb-3">Existing Rules</h4>
                      <div className="space-y-2">
                        {rules.map((rule) => (
                          <div key={rule.id} className="flex items-center justify-between p-3 bg-white rounded border">
                            <div className="flex-1">
                              <div className="font-medium">{rule.title}</div>
                              <div className="text-sm text-gray-600 capitalize">{rule.section.replace('-', ' ')}</div>
                            </div>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleRuleSelect(rule)}
                                className="text-blue-600 hover:text-blue-800 px-2 py-1 rounded text-sm"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteRule(rule.id)}
                                className="text-red-600 hover:text-red-800 px-2 py-1 rounded text-sm"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        ))}
                        {rules.length === 0 && (
                          <div className="text-center py-4 text-gray-500">
                            No rules found. Click "Create Rule" to add your first rule.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Game Update/Create Form */}
              <div>
                {showCreateForm ? (
                  <div>
                    <h2 className="text-lg font-semibold mb-4">Create New Game</h2>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Home Team
                        </label>
                        <select
                          value={selectedGame?.homeTeamId || ''}
                          onChange={(e) => setSelectedGame({...selectedGame, homeTeamId: parseInt(e.target.value)})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-krakens-pink"
                        >
                          {teams.map(team => (
                            <option key={team.id} value={team.id}>{team.name}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Away Team
                        </label>
                        <select
                          value={selectedGame?.awayTeamId || ''}
                          onChange={(e) => setSelectedGame({...selectedGame, awayTeamId: parseInt(e.target.value)})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-krakens-pink"
                        >
                          {teams.map(team => (
                            <option key={team.id} value={team.id}>{team.name}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Scheduled Time
                        </label>
                        <input
                          type="datetime-local"
                          value={selectedGame?.scheduledTime ? new Date(selectedGame.scheduledTime).toISOString().slice(0, 16) : ''}
                          onChange={(e) => setSelectedGame({...selectedGame, scheduledTime: new Date(e.target.value).toISOString()})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-krakens-pink"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Field
                        </label>
                        <input
                          type="text"
                          value={selectedGame?.field || '1'}
                          onChange={(e) => setSelectedGame({...selectedGame, field: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-krakens-pink"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Referee
                        </label>
                        <input
                          type="text"
                          value={selectedGame?.referee || ''}
                          onChange={(e) => setSelectedGame({...selectedGame, referee: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-krakens-pink"
                        />
                      </div>

                      <div className="flex space-x-2">
                        <button
                          onClick={handleCreateGame}
                          disabled={isCreating}
                          className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isCreating ? 'Creating...' : 'Create Game'}
                        </button>
                        <button
                          onClick={() => {
                            setShowCreateForm(false);
                            setSelectedGame(null);
                          }}
                          className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-600"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                ) : selectedGame ? (
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

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Referee
                        </label>
                        <input
                          type="text"
                          value={referee}
                          onChange={(e) => setReferee(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-krakens-pink"
                          placeholder="Enter referee name"
                        />
                      </div>

                      <div className="flex space-x-2">
                        <button
                          onClick={handleUpdateGame}
                          disabled={isUpdating}
                          className="flex-1 bg-krakens-pink text-white py-2 px-4 rounded-md hover:bg-krakens-pink/90 focus:outline-none focus:ring-2 focus:ring-krakens-pink disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isUpdating ? 'Updating...' : 'Update Game'}
                        </button>
                        <button
                          onClick={handleDeleteGame}
                          disabled={isDeletingGame}
                          className="bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isDeletingGame ? 'Deleting...' : 'Delete'}
                        </button>
                      </div>

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
