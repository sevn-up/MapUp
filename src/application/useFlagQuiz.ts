"use client";

import { create } from "zustand";
import { countries } from "@/domain/countries";
import { matchesCountry, shuffleArray } from "@/domain/matching";
import type { Country } from "@/domain/types";
import type { QuizCategory } from "./useShapeQuiz";
import { getCategoryCount } from "./useShapeQuiz";

export { QUIZ_CATEGORIES, getCategoryCount } from "./useShapeQuiz";
export type { QuizCategory } from "./useShapeQuiz";

export type FlagInputMode = "choice" | "type";

interface FlagGuess {
  guess: string;
  country: Country;
  isCorrect: boolean;
}

// ── Helpers ──────────────────────────────────────────────────────────

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

/**
 * Pick 3 wrong choices, preferring countries from the same continent
 * for added difficulty.
 */
function pickWrongChoices(correct: Country, pool: Country[]): Country[] {
  const sameContinent = pool.filter(
    (c) => c.code !== correct.code && c.continent === correct.continent
  );
  const otherContinent = pool.filter(
    (c) => c.code !== correct.code && c.continent !== correct.continent
  );

  const shuffledSame = shuffleArray(sameContinent);
  const shuffledOther = shuffleArray(otherContinent);

  const wrong: Country[] = [];

  // Fill from same continent first
  for (const c of shuffledSame) {
    if (wrong.length >= 3) break;
    wrong.push(c);
  }

  // Fall back to other continents if needed
  for (const c of shuffledOther) {
    if (wrong.length >= 3) break;
    wrong.push(c);
  }

  return wrong;
}

/**
 * Build shuffled choices (correct + 3 wrong) for a given round.
 */
function getChoicesForRound(correct: Country, pool: Country[]): Country[] {
  const wrong = pickWrongChoices(correct, pool);
  return shuffleArray([correct, ...wrong]);
}

// ── Store ────────────────────────────────────────────────────────────

interface FlagQuizState {
  totalRounds: number;
  category: QuizCategory;
  inputMode: FlagInputMode;
  isPlaying: boolean;
  isFinished: boolean;
  currentRound: number;
  score: number;
  currentCountry: Country | null;
  choices: Country[];
  guesses: FlagGuess[];
  revealed: boolean;
  roundPool: Country[];
  fullPool: Country[];
  startGame: (rounds: number, category?: QuizCategory, inputMode?: FlagInputMode) => void;
  submitGuess: (guess: string) => boolean;
  revealAnswer: () => void;
  nextRound: () => void;
  resetGame: () => void;
}

export const useFlagQuiz = create<FlagQuizState>((set, get) => ({
  totalRounds: 10,
  category: "random",
  inputMode: "choice",
  isPlaying: false,
  isFinished: false,
  currentRound: 0,
  score: 0,
  currentCountry: null,
  choices: [],
  guesses: [],
  revealed: false,
  roundPool: [],
  fullPool: [],

  startGame: (
    rounds = 10,
    category: QuizCategory = "random",
    inputMode: FlagInputMode = "choice"
  ) => {
    const pool = getPool(category);
    const capped = Math.min(rounds, pool.length);
    const selected = shuffleArray(pool).slice(0, capped);
    const firstCountry = selected[0];

    set({
      totalRounds: capped,
      category,
      inputMode,
      isPlaying: true,
      isFinished: false,
      currentRound: 1,
      score: 0,
      currentCountry: firstCountry,
      choices: inputMode === "choice" ? getChoicesForRound(firstCountry, pool) : [],
      guesses: [],
      revealed: false,
      roundPool: selected,
      fullPool: pool,
    });
  },

  submitGuess: (guess: string) => {
    const { currentCountry, revealed, inputMode } = get();
    if (!currentCountry || revealed) return false;

    let isCorrect: boolean;

    if (inputMode === "type") {
      isCorrect = matchesCountry(guess, currentCountry);
    } else {
      // Choice mode — compare country code directly
      isCorrect = guess === currentCountry.code;
    }

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
    const { currentRound, totalRounds, roundPool, fullPool, inputMode } = get();
    if (currentRound >= totalRounds) {
      set({ isPlaying: false, isFinished: true });
      return;
    }

    const nextCountry = roundPool[currentRound];

    set({
      currentRound: currentRound + 1,
      currentCountry: nextCountry,
      choices: inputMode === "choice" ? getChoicesForRound(nextCountry, fullPool) : [],
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
      choices: [],
      guesses: [],
      revealed: false,
      roundPool: [],
      fullPool: [],
      category: "random",
      inputMode: "choice",
    });
  },
}));
