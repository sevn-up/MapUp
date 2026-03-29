import { GAME_MODES, STREET_VIEW_MAX_SCORE } from "@/lib/utils/constants";
import type { GameMode } from "@/domain/types";

export function calculateScore(
  mode: GameMode,
  params: {
    correct?: number;
    total?: number;
    distanceKm?: number;
    guessCount?: number;
    timeSeconds?: number;
  }
): number {
  switch (mode) {
    case GAME_MODES.COUNTRY_SHAPE: {
      const { correct = 0, total = 1 } = params;
      return Math.round((correct / total) * 1000);
    }
    case GAME_MODES.NAME_ALL: {
      const { correct = 0, timeSeconds = 0 } = params;
      const base = correct * 10;
      const speedBonus = timeSeconds > 0 ? Math.max(0, 300 - timeSeconds) : 0;
      return base + speedBonus;
    }
    case GAME_MODES.WORLDLE: {
      const { guessCount = 6 } = params;
      return Math.max(0, 1000 - (guessCount - 1) * 150);
    }
    case GAME_MODES.STREET_VIEW: {
      const { distanceKm = 0 } = params;
      return Math.max(0, Math.round(STREET_VIEW_MAX_SCORE * Math.exp(-distanceKm / 2000)));
    }
    default:
      return 0;
  }
}
