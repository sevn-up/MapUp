"use client";

import { create } from "zustand";
import { countries } from "@/lib/geo/countries";
import type { Country } from "@/types/geo";

interface ShapeGuess {
  guess: string;
  answer: Country;
  isCorrect: boolean;
}

interface CountryShapeGameState {
  // Game config
  totalRounds: number;
  // Game state
  isPlaying: boolean;
  isFinished: boolean;
  currentRound: number;
  score: number;
  currentCountry: Country | null;
  guesses: ShapeGuess[];
  revealed: boolean;
  roundPool: Country[];
  // Actions
  startGame: (rounds?: number) => void;
  submitGuess: (guess: string) => boolean;
  revealAnswer: () => void;
  nextRound: () => void;
  resetGame: () => void;
}

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function matchesCountry(guess: string, country: Country): boolean {
  const g = guess.toLowerCase().trim();
  if (country.name.toLowerCase() === g) return true;
  if (country.officialName?.toLowerCase() === g) return true;
  if (country.alternateNames.some((alt) => alt.toLowerCase() === g))
    return true;

  // Fuzzy: check if close enough (simple Levenshtein for short names)
  const target = country.name.toLowerCase();
  if (target.length <= 4) return g === target;
  // Allow 1-2 char difference for longer names
  if (levenshtein(g, target) <= Math.min(2, Math.floor(target.length / 4)))
    return true;

  return false;
}

function levenshtein(a: string, b: string): number {
  const matrix: number[][] = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b[i - 1] === a[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

// Filter out very tiny countries that don't render well as shapes
const playableCountries = countries.filter((c) => c.areaKm2 > 1000);

export const useCountryShapeGame = create<CountryShapeGameState>((set, get) => ({
  totalRounds: 10,
  isPlaying: false,
  isFinished: false,
  currentRound: 0,
  score: 0,
  currentCountry: null,
  guesses: [],
  revealed: false,
  roundPool: [],

  startGame: (rounds = 10) => {
    const pool = shuffleArray(playableCountries).slice(0, rounds);
    set({
      totalRounds: rounds,
      isPlaying: true,
      isFinished: false,
      currentRound: 1,
      score: 0,
      currentCountry: pool[0],
      guesses: [],
      revealed: false,
      roundPool: pool,
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

    const nextIndex = currentRound; // 0-indexed pool, currentRound is 1-based
    set({
      currentRound: currentRound + 1,
      currentCountry: roundPool[nextIndex],
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
    });
  },
}));
