"use client";

import { create } from "zustand";
import { countries } from "@/domain/countries";
import { matchesCountry, shuffleArray } from "@/domain/matching";
import type { Country } from "@/domain/types";
import type { Continent } from "@/domain/types";

export type QuizCategory =
  | "random"
  | "popular"
  | "hard"
  | Continent;

export const QUIZ_CATEGORIES: { id: QuizCategory; label: string; description: string }[] = [
  { id: "random", label: "All Countries", description: "Every playable country" },
  { id: "popular", label: "Well-Known", description: "Most recognizable countries" },
  { id: "hard", label: "Hard Mode", description: "Smaller, trickier countries" },
  { id: "Africa", label: "Africa", description: "African countries" },
  { id: "Asia", label: "Asia", description: "Asian countries" },
  { id: "Europe", label: "Europe", description: "European countries" },
  { id: "North America", label: "Americas", description: "North & South America" },
  { id: "Oceania", label: "Oceania", description: "Pacific island nations" },
];

/** Get the number of playable countries for a category. */
export function getCategoryCount(category: QuizCategory): number {
  return getPool(category).length;
}

// Top 50 most well-known countries by a mix of population, tourism, and cultural familiarity
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
      // Combine North + South America
      return countries.filter(
        (c) => c.continent === "North America" || c.continent === "South America"
      );
    default:
      // Continent filter
      return countries.filter((c) => c.continent === category);
  }
}

interface ShapeGuess {
  guess: string;
  answer: Country;
  isCorrect: boolean;
}

interface CountryShapeGameState {
  totalRounds: number;
  category: QuizCategory;
  isPlaying: boolean;
  isFinished: boolean;
  currentRound: number;
  score: number;
  currentCountry: Country | null;
  guesses: ShapeGuess[];
  revealed: boolean;
  roundPool: Country[];
  startGame: (rounds: number, category?: QuizCategory) => void;
  submitGuess: (guess: string) => boolean;
  revealAnswer: () => void;
  nextRound: () => void;
  resetGame: () => void;
}

export const useCountryShapeGame = create<CountryShapeGameState>((set, get) => ({
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

    const isCorrect = matchesCountry(guess, currentCountry);

    set((state) => ({
      guesses: [
        ...state.guesses,
        { guess, answer: currentCountry, isCorrect },
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
        { guess: "(skipped)", answer: currentCountry, isCorrect: false },
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
