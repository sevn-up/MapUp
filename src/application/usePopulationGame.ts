"use client";

import { create } from "zustand";
import { countries } from "@/domain/countries";
import { shuffleArray } from "@/domain/matching";
import type { Country } from "@/domain/types";

interface PopulationGameState {
  mode: "streak" | "rounds";
  totalRounds: number;
  currentRound: number;
  streak: number;
  score: number;
  isPlaying: boolean;
  isFinished: boolean;
  revealed: boolean;
  countryA: Country | null;
  countryB: Country | null;
  lastAnswerCorrect: boolean | null;
  usedCodes: Set<string>;

  startGame: (mode: "streak" | "rounds", rounds?: number) => void;
  submitGuess: (answer: "higher" | "lower") => boolean;
  nextPair: () => void;
  resetGame: () => void;
}

function pickRandom(exclude: Set<string>): Country | null {
  const available = countries.filter((c) => !exclude.has(c.code));
  if (available.length === 0) return null;
  const shuffled = shuffleArray(available);
  return shuffled[0];
}

export const usePopulationGame = create<PopulationGameState>((set, get) => ({
  mode: "streak",
  totalRounds: 10,
  currentRound: 0,
  streak: 0,
  score: 0,
  isPlaying: false,
  isFinished: false,
  revealed: false,
  countryA: null,
  countryB: null,
  lastAnswerCorrect: null,
  usedCodes: new Set<string>(),

  startGame: (mode, rounds = 10) => {
    const usedCodes = new Set<string>();

    const a = pickRandom(usedCodes)!;
    usedCodes.add(a.code);

    const b = pickRandom(usedCodes)!;
    usedCodes.add(b.code);

    set({
      mode,
      totalRounds: mode === "rounds" ? rounds : 0,
      currentRound: 1,
      streak: 0,
      score: 0,
      isPlaying: true,
      isFinished: false,
      revealed: false,
      countryA: a,
      countryB: b,
      lastAnswerCorrect: null,
      usedCodes,
    });
  },

  submitGuess: (answer) => {
    const { countryA, countryB, revealed, mode } = get();
    if (!countryA || !countryB || revealed) return false;

    const bHigher = countryB.population > countryA.population;
    const isCorrect =
      answer === "higher" ? bHigher : !bHigher;

    const updates: Partial<PopulationGameState> = {
      revealed: true,
      lastAnswerCorrect: isCorrect,
    };

    if (isCorrect) {
      updates.score = get().score + 1;
      updates.streak = get().streak + 1;
    } else {
      updates.streak = 0;
      if (mode === "streak") {
        updates.isPlaying = false;
        updates.isFinished = true;
      }
    }

    set(updates);
    return isCorrect;
  },

  nextPair: () => {
    const { countryB, currentRound, totalRounds, mode, usedCodes } = get();
    if (!countryB) return;

    if (mode === "rounds" && currentRound >= totalRounds) {
      set({ isPlaying: false, isFinished: true });
      return;
    }

    const newUsed = new Set(usedCodes);
    const newB = pickRandom(newUsed);

    if (!newB) {
      // Ran out of countries
      set({ isPlaying: false, isFinished: true });
      return;
    }

    newUsed.add(newB.code);

    set({
      countryA: countryB,
      countryB: newB,
      revealed: false,
      lastAnswerCorrect: null,
      currentRound: currentRound + 1,
      usedCodes: newUsed,
    });
  },

  resetGame: () => {
    set({
      mode: "streak",
      totalRounds: 10,
      currentRound: 0,
      streak: 0,
      score: 0,
      isPlaying: false,
      isFinished: false,
      revealed: false,
      countryA: null,
      countryB: null,
      lastAnswerCorrect: null,
      usedCodes: new Set<string>(),
    });
  },
}));
