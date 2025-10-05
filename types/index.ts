export interface Team {
  id: number;
  name: string;
  color: string;
  wins: number;
  losses: number;
  pointsFor: number;
  pointsAgainst: number;
  logo?: string;
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
  half: number;
  timeRemaining: number;
  isTimerRunning: boolean;
  referee?: string;
  // Extended fields for API responses
  homeTeamName?: string;
  homeTeamColor?: string;
  homeTeamLogo?: string;
  awayTeamName?: string;
  awayTeamColor?: string;
  awayTeamLogo?: string;
}

export interface Tournament {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  teams: Team[];
  games: Game[];
}

export interface Rules {
  id: number;
  title: string;
  content: string;
  section: 'throw-off' | 'special-plays' | 'general-notes';
  order: number;
}
