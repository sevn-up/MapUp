"use client";

import { create } from "zustand";
import { countries, getCountryByName } from "@/lib/geo/countries";
import type { Country } from "@/types/geo";
import type { Continent } from "@/types/geo";

export type NameAllCategory = "all" | Continent;

export const NAME_ALL_CATEGORIES: { id: NameAllCategory; label: string; count: number }[] = [
  { id: "all", label: "All Countries", count: countries.length },
  { id: "Africa", label: "Africa", count: countries.filter((c) => c.continent === "Africa").length },
  { id: "Asia", label: "Asia", count: countries.filter((c) => c.continent === "Asia").length },
  { id: "Europe", label: "Europe", count: countries.filter((c) => c.continent === "Europe").length },
  { id: "North America", label: "North America", count: countries.filter((c) => c.continent === "North America").length },
  { id: "South America", label: "South America", count: countries.filter((c) => c.continent === "South America").length },
  { id: "Oceania", label: "Oceania", count: countries.filter((c) => c.continent === "Oceania").length },
];

function getPool(category: NameAllCategory): Country[] {
  if (category === "all") return countries;
  return countries.filter((c) => c.continent === category);
}

interface NameAllGameState {
  // Config
  category: NameAllCategory;
  timeLimitSeconds: number;
  pool: Country[];

  // State
  isPlaying: boolean;
  isFinished: boolean;
  namedCodes: Set<string>;
  lastNamed: Country | null;
  wrongGuess: string | null;

  // Actions
  startGame: (timeMinutes: number, category?: NameAllCategory) => void;
  submitGuess: (name: string) => { matched: Country | null; alreadyNamed: boolean };
  endGame: () => void;
  resetGame: () => void;
}

export const useNameAllGame = create<NameAllGameState>((set, get) => ({
  category: "all",
  timeLimitSeconds: 600,
  pool: [],
  isPlaying: false,
  isFinished: false,
  namedCodes: new Set(),
  lastNamed: null,
  wrongGuess: null,

  startGame: (timeMinutes: number, category: NameAllCategory = "all") => {
    const pool = getPool(category);
    set({
      category,
      timeLimitSeconds: timeMinutes * 60,
      pool,
      isPlaying: true,
      isFinished: false,
      namedCodes: new Set(),
      lastNamed: null,
      wrongGuess: null,
    });
  },

  submitGuess: (name: string) => {
    const { pool, namedCodes, isPlaying } = get();
    if (!isPlaying) return { matched: null, alreadyNamed: false };

    const trimmed = name.trim();
    if (!trimmed) return { matched: null, alreadyNamed: false };

    // Check against the pool
    const matched = pool.find((c) => {
      const lower = trimmed.toLowerCase();
      if (c.name.toLowerCase() === lower) return true;
      if (c.officialName?.toLowerCase() === lower) return true;
      if (c.alternateNames.some((alt) => alt.toLowerCase() === lower)) return true;
      return false;
    });

    if (!matched) {
      // Also try global lookup for partial/fuzzy
      const globalMatch = getCountryByName(trimmed);
      if (globalMatch && pool.some((c) => c.code === globalMatch.code)) {
        if (namedCodes.has(globalMatch.code)) {
          set({ wrongGuess: null });
          return { matched: null, alreadyNamed: true };
        }
        const next = new Set(namedCodes);
        next.add(globalMatch.code);
        set({ namedCodes: next, lastNamed: globalMatch, wrongGuess: null });

        // Check if all named
        if (next.size >= pool.length) {
          set({ isPlaying: false, isFinished: true });
        }

        return { matched: globalMatch, alreadyNamed: false };
      }

      set({ wrongGuess: trimmed });
      return { matched: null, alreadyNamed: false };
    }

    if (namedCodes.has(matched.code)) {
      set({ wrongGuess: null });
      return { matched: null, alreadyNamed: true };
    }

    const next = new Set(namedCodes);
    next.add(matched.code);
    set({ namedCodes: next, lastNamed: matched, wrongGuess: null });

    if (next.size >= pool.length) {
      set({ isPlaying: false, isFinished: true });
    }

    return { matched, alreadyNamed: false };
  },

  endGame: () => {
    set({ isPlaying: false, isFinished: true });
  },

  resetGame: () => {
    set({
      isPlaying: false,
      isFinished: false,
      namedCodes: new Set(),
      lastNamed: null,
      wrongGuess: null,
      pool: [],
    });
  },
}));
