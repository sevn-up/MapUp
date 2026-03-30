"use client";

import { create } from "zustand";
import { haversineDistance } from "@/domain/distance";
import { calculateScore } from "@/domain/scoring";
import { GAME_MODES, STREET_VIEW_MAX_SCORE } from "@/lib/utils/constants";

export interface StreetViewLocation {
  id: string;
  lat: number;
  lng: number;
  country_code: string;
  difficulty: string;
}

export interface StreetViewRound {
  location: StreetViewLocation;
  guess: { lat: number; lng: number } | null;
  distanceKm: number | null;
  score: number | null;
}

interface StreetViewState {
  difficulty: "easy" | "medium" | "hard";
  totalRounds: number;
  currentRound: number;
  rounds: StreetViewRound[];
  backupLocations: StreetViewLocation[];
  isPlaying: boolean;
  isFinished: boolean;
  isRoundRevealed: boolean;
  totalScore: number;

  startGame: (locations: StreetViewLocation[], totalRounds: number, difficulty: "easy" | "medium" | "hard") => void;
  submitGuessPosition: (lat: number, lng: number) => void;
  submitGuess: () => StreetViewRound | null;
  skipCurrentLocation: () => void;
  nextRound: () => void;
  reset: () => void;
}

export const useStreetViewGame = create<StreetViewState>((set, get) => ({
  difficulty: "medium",
  totalRounds: 5,
  currentRound: 0,
  rounds: [],
  backupLocations: [],
  isPlaying: false,
  isFinished: false,
  isRoundRevealed: false,
  totalScore: 0,

  startGame: (locations, totalRounds, difficulty) => {
    const primary = locations.slice(0, totalRounds);
    const backups = locations.slice(totalRounds);

    const rounds: StreetViewRound[] = primary.map((loc) => ({
      location: loc,
      guess: null,
      distanceKm: null,
      score: null,
    }));

    set({
      difficulty,
      totalRounds,
      currentRound: 0,
      rounds,
      backupLocations: backups,
      isPlaying: true,
      isFinished: false,
      isRoundRevealed: false,
      totalScore: 0,
    });
  },

  // Place/move the guess pin (no scoring yet)
  submitGuessPosition: (lat, lng) => {
    const { currentRound, rounds, isRoundRevealed } = get();
    if (isRoundRevealed) return;
    const round = rounds[currentRound];
    if (!round) return;

    const newRounds = [...rounds];
    newRounds[currentRound] = { ...round, guess: { lat, lng } };
    set({ rounds: newRounds });
  },

  // Replace current location with a backup when no Street View coverage
  skipCurrentLocation: () => {
    const { currentRound, rounds, backupLocations } = get();
    if (backupLocations.length === 0) return; // No backups left

    const [replacement, ...remaining] = backupLocations;
    const newRounds = [...rounds];
    newRounds[currentRound] = {
      location: replacement,
      guess: null,
      distanceKm: null,
      score: null,
    };

    set({ rounds: newRounds, backupLocations: remaining });
  },

  // Score the current guess and reveal the answer
  submitGuess: () => {
    const { currentRound, rounds, totalScore } = get();
    const round = rounds[currentRound];
    if (!round?.guess) return null;

    const distanceKm = haversineDistance(
      round.guess,
      { lat: round.location.lat, lng: round.location.lng }
    );

    const score = calculateScore(GAME_MODES.STREET_VIEW, { distanceKm });

    const updatedRound: StreetViewRound = {
      ...round,
      distanceKm: Math.round(distanceKm),
      score,
    };

    const newRounds = [...rounds];
    newRounds[currentRound] = updatedRound;

    set({
      rounds: newRounds,
      isRoundRevealed: true,
      totalScore: totalScore + score,
    });

    return updatedRound;
  },

  nextRound: () => {
    const { currentRound, totalRounds, rounds } = get();
    if (currentRound + 1 >= totalRounds) {
      set({ isFinished: true, isPlaying: false, isRoundRevealed: false });
    } else {
      // Reset the next round's guess to null and advance
      const newRounds = [...rounds];
      const nextIdx = currentRound + 1;
      newRounds[nextIdx] = { ...newRounds[nextIdx], guess: null, distanceKm: null, score: null };
      set({ currentRound: nextIdx, isRoundRevealed: false, rounds: newRounds });
    }
  },

  reset: () =>
    set({
      difficulty: "medium",
      totalRounds: 5,
      currentRound: 0,
      rounds: [],
      backupLocations: [],
      isPlaying: false,
      isFinished: false,
      isRoundRevealed: false,
      totalScore: 0,
    }),
}));
