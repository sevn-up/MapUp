"use client";

import { create } from "zustand";
import { countries } from "@/domain/countries";
import { matchesCapital, shuffleArray } from "@/domain/matching";
import type { Country } from "@/domain/types";
import { type QuizCategory, QUIZ_CATEGORIES, getCategoryCount } from "./useShapeQuiz";

// Re-export for convenience
export { QUIZ_CATEGORIES, getCategoryCount };
export type { QuizCategory };

// Reuse the same pool logic as shape quiz
const WELL_KNOWN_CODES = new Set([
  "US", "CN", "IN", "BR", "RU", "JP", "DE", "GB", "FR", "IT",
  "CA", "AU", "MX", "KR", "ES", "ID", "TR", "SA", "AR", "ZA",
  "EG", "TH", "PL", "NL", "SE", "CH", "NO", "GR", "PT", "IE",
  "NZ", "SG", "IL", "AE", "CO", "CL", "PE", "NG", "KE", "PK",
  "PH", "VN", "MY", "AT", "BE", "DK", "FI", "CZ", "UA", "CU",
]);

function getPool(category: QuizCategory): Country[] {
  switch (category) {
    case "popular":
      return countries.filter((c) => WELL_KNOWN_CODES.has(c.code));
    case "hard":
      return countries.filter((c) => !WELL_KNOWN_CODES.has(c.code));
    case "random":
      return [...countries];
    case "North America":
      return countries.filter(
        (c) => c.continent === "North America" || c.continent === "South America"
      );
    default:
      return countries.filter((c) => c.continent === category);
  }
}

interface CapitalGuess {
  guess: string;
  country: Country;
  isCorrect: boolean;
}

interface CapitalsQuizState {
  totalRounds: number;
  category: QuizCategory;
  isPlaying: boolean;
  isFinished: boolean;
  currentRound: number;
  score: number;
  currentCountry: Country | null;
  guesses: CapitalGuess[];
  revealed: boolean;
  roundPool: Country[];
  startGame: (rounds: number, category?: QuizCategory) => void;
  submitGuess: (guess: string) => boolean;
  revealAnswer: () => void;
  nextRound: () => void;
  resetGame: () => void;
}

export const useCapitalsQuiz = create<CapitalsQuizState>((set, get) => ({
  totalRounds: 10,
  category: "random",
  isPlaying: false,
  isFinished: false,
  currentRound: 0,
  score: 0,
  currentCountry: null,
  guesses: [],
  revealed: false,
  roundPool: [],

  startGame: (rounds = 10, category: QuizCategory = "random") => {
    const pool = getPool(category);
    const capped = Math.min(rounds, pool.length);
    const selected = shuffleArray(pool).slice(0, capped);
    set({
      totalRounds: capped,
      category,
      isPlaying: true,
      isFinished: false,
      currentRound: 1,
      score: 0,
      currentCountry: selected[0],
      guesses: [],
      revealed: false,
      roundPool: selected,
    });
  },

  submitGuess: (guess: string) => {
    const { currentCountry, revealed } = get();
    if (!currentCountry || revealed) return false;

    const isCorrect = matchesCapital(guess, currentCountry);

    set((state) => ({
      guesses: [
        ...state.guesses,
        { guess, country: currentCountry, isCorrect },
      ],
      score: isCorrect ? state.score + 1 : state.score,
      revealed: true,
    }));

    return isCorrect;
  },

  revealAnswer: () => {
    const { revealed, currentCountry } = get();
    if (revealed || !currentCountry) return;

    set((state) => ({
      guesses: [
        ...state.guesses,
        { guess: "(skipped)", country: currentCountry, isCorrect: false },
      ],
      revealed: true,
    }));
  },

  nextRound: () => {
    const { currentRound, totalRounds, roundPool } = get();
    if (currentRound >= totalRounds) {
      set({ isPlaying: false, isFinished: true });
      return;
    }

    set({
      currentRound: currentRound + 1,
      currentCountry: roundPool[currentRound],
      revealed: false,
    });
  },

  resetGame: () => {
    set({
      isPlaying: false,
      isFinished: false,
      currentRound: 0,
      score: 0,
      currentCountry: null,
      guesses: [],
      revealed: false,
      roundPool: [],
      category: "random",
    });
  },
}));
