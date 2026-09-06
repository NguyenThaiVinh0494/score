export interface Player {
  id: string;
  name: string;
  score: number;
  order: number;
  color?: string;
}

export interface RoundLog {
  id: string;
  roundNumber: number;
  winnerPlayerId: string;
  winnerPlayerName: string;
  timestamp: string;
}

export interface MatchConfig {
  title: string;
  targetScore: number;
  players: string[];
}

export interface MatchRecord {
  id: string;
  title: string;
  targetScore: number;
  status: "in_progress" | "completed" | "cancelled";
  winnerName: string | null;
  totalRounds: number;
  players: {
    name: string;
    score: number;
    order: number;
  }[];
  rounds: {
    roundNumber: number;
    winnerPlayerName: string;
    createdAt: string;
  }[];
  createdAt: string;
  endedAt?: string;
  userId?: string;
}
