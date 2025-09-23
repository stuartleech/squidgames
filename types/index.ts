export interface Team {
  id: number;
  name: string;
  color: string;
  wins: number;
  losses: number;
  pointsFor: number;
  pointsAgainst: number;
}

export interface Game {
  id: number;
  homeTeamId: number;
  awayTeamId: number;
  homeTeam?: Team;
  awayTeam?: Team;
  homeScore: number | null;
  awayScore: number | null;
  scheduledTime: string;
  field: string;
  status: 'scheduled' | 'in-progress' | 'completed';
  quarter: number;
  timeRemaining: string;
}

export interface Tournament {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  teams: Team[];
  games: Game[];
}
