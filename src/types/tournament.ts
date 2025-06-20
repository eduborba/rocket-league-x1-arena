
export interface Participant {
  id: string;
  name: string;
  nickname: string;
}

export interface Team {
  id: string;
  name: string;
  player1Id: string;
  player2Id: string;
}

export interface Match {
  id: string;
  round: number;
  player1Id?: string;
  player2Id?: string;
  team1Id?: string;
  team2Id?: string;
  score1?: number;
  score2?: number;
  completed: boolean;
}

export interface TournamentConfig {
  rounds: number;
  participants: Participant[];
  teams: Team[];
  matches: Match[];
  created: boolean;
  mode: 'individual' | 'doubles';
  doublesMode: 'random' | 'predefined';
  matchFormat: 'round-trip' | 'single';
}

export interface PlayerStats {
  id: string;
  points: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  matchesPlayed: number;
}

export interface TeamStats {
  id: string;
  points: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  matchesPlayed: number;
}
