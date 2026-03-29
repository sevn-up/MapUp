import { GAME_MODES } from "@/lib/utils/constants";

export type GameMode = (typeof GAME_MODES)[keyof typeof GAME_MODES];

export interface GameSession {
  id: string;
  userId: string;
  gameMode: GameMode;
  score: number;
  maxScore?: number;
  timeSeconds?: number;
  correctCount: number;
  totalCount: number;
  xpEarned: number;
  metadata: Record<string, unknown>;
  isDaily: boolean;
  createdAt: string;
}

export interface GameState {
  mode: GameMode | null;
  isPlaying: boolean;
  currentRound: number;
  totalRounds: number;
  score: number;
  timeRemaining: number | null;
  guesses: Guess[];
}

export interface Guess {
  value: string;
  isCorrect: boolean;
  timestamp: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  xpReward: number;
}
