"use client";

import { create } from "zustand";
import { countries, getCountryByCode } from "@/domain/countries";
import { getDistanceResult } from "@/domain/distance";
import { getDailyCountryIndex } from "@/domain/daily";
import { shuffleArray } from "@/domain/matching";
import type { Country, DistanceResult } from "@/domain/types";

export interface WorldleGuess {
  country: Country;
  result: DistanceResult;
  isCorrect: boolean;
}

interface WorldleState {
  mode: "daily" | "practice" | null;
  targetCountry: Country | null;
  guesses: WorldleGuess[];
  maxGuesses: number;
  isPlaying: boolean;
  isFinished: boolean;
  isWon: boolean;

  startDaily: () => void;
  startPractice: () => void;
  submitGuess: (countryCode: string) => WorldleGuess | null;
  reset: () => void;
}

// Filter to countries with area > 1000 km² for playability
const playableCountries = countries.filter((c) => c.areaKm2 > 1000);

function getTodaysCountry(): Country {
  const index = getDailyCountryIndex(new Date(), playableCountries.length);
  return playableCountries[index];
}

function getRandomCountry(): Country {
  const shuffled = shuffleArray(playableCountries);
  return shuffled[0];
}

export const useWorldle = create<WorldleState>((set, get) => ({
  mode: null,
  targetCountry: null,
  guesses: [],
  maxGuesses: 6,
  isPlaying: false,
  isFinished: false,
  isWon: false,

  startDaily: () => {
    set({
      mode: "daily",
      targetCountry: getTodaysCountry(),
      guesses: [],
      isPlaying: true,
      isFinished: false,
      isWon: false,
    });
  },

  startPractice: () => {
    set({
      mode: "practice",
      targetCountry: getRandomCountry(),
      guesses: [],
      isPlaying: true,
      isFinished: false,
      isWon: false,
    });
  },

  submitGuess: (countryCode: string) => {
    const { targetCountry, guesses, maxGuesses, isPlaying } = get();
    if (!isPlaying || !targetCountry) return null;

    // Don't allow duplicate guesses
    if (guesses.some((g) => g.country.code === countryCode)) return null;

    const guessedCountry = getCountryByCode(countryCode);
    if (!guessedCountry) return null;

    const isCorrect = countryCode === targetCountry.code;
    const result = getDistanceResult(
      { lat: guessedCountry.lat, lng: guessedCountry.lng },
      { lat: targetCountry.lat, lng: targetCountry.lng }
    );

    const guess: WorldleGuess = { country: guessedCountry, result, isCorrect };
    const newGuesses = [...guesses, guess];
    const isFinished = isCorrect || newGuesses.length >= maxGuesses;

    set({
      guesses: newGuesses,
      isFinished,
      isWon: isCorrect,
      isPlaying: !isFinished,
    });

    return guess;
  },

  reset: () => {
    set({
      mode: null,
      targetCountry: null,
      guesses: [],
      isPlaying: false,
      isFinished: false,
      isWon: false,
    });
  },
}));

/**
 * Generate a shareable emoji string for the daily result.
 */
export function generateShareText(guesses: WorldleGuess[], isWon: boolean): string {
  const dayNum = Math.floor(
    (Date.now() - new Date("2026-01-01").getTime()) / 86400000
  );
  const result = isWon ? `${guesses.length}/6` : "X/6";

  const squares = guesses
    .map((g) => {
      const p = g.result.proximityPercent;
      if (g.isCorrect) return "🟩";
      if (p >= 80) return "🟨";
      if (p >= 50) return "🟧";
      return "🟥";
    })
    .join("");

  return `MapUp Worldle #${dayNum} ${result}\n${squares}`;
}
