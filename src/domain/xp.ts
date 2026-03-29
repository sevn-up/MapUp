import { XP_PER_LEVEL_BASE, XP_LEVEL_EXPONENT } from "@/lib/utils/constants";

export function xpForLevel(level: number): number {
  return Math.round(XP_PER_LEVEL_BASE * Math.pow(level, XP_LEVEL_EXPONENT));
}

export function totalXpForLevel(level: number): number {
  let total = 0;
  for (let i = 1; i <= level; i++) {
    total += xpForLevel(i);
  }
  return total;
}

export function getLevelFromXp(totalXp: number): {
  level: number;
  currentLevelXp: number;
  nextLevelXp: number;
  progress: number;
} {
  let level = 1;
  let accumulated = 0;

  while (true) {
    const needed = xpForLevel(level);
    if (accumulated + needed > totalXp) {
      const currentLevelXp = totalXp - accumulated;
      return {
        level,
        currentLevelXp,
        nextLevelXp: needed,
        progress: currentLevelXp / needed,
      };
    }
    accumulated += needed;
    level++;
  }
}

export function calculateGameXp(score: number, streakDays: number): number {
  const baseXp = Math.round(score * 0.1);
  const streakMultiplier = 1 + Math.min(streakDays, 30) * 0.05;
  return Math.round(baseXp * streakMultiplier);
}
