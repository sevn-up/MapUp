/**
 * Check which achievements a user has earned based on their stats.
 * Pure function — no React, no database.
 */

interface UserStats {
  totalGamesPlayed: number;
  currentStreak: number;
  longestStreak: number;
  level: number;
  friendCount: number;
  dailyGamesCompleted: number;
  // Per-mode stats
  shapeQuiz: { bestScore: number; maxPossible: number; uniqueCorrect: number };
  nameAll: { bestCount: number; bestTimeSeconds: number };
  worldle: { bestGuessCount: number; dailyStreak: number };
  streetView: { bestDistanceKm: number; perfectRounds: boolean; continentsCovered: number };
}

interface AchievementDef {
  id: string;
  requirement: Record<string, unknown>;
}

export function checkAchievement(achievement: AchievementDef, stats: UserStats): boolean {
  const req = achievement.requirement;
  const type = req.type as string;

  switch (type) {
    case "games_played":
      return stats.totalGamesPlayed >= (req.value as number);

    case "streak":
      return stats.longestStreak >= (req.value as number);

    case "level":
      return stats.level >= (req.value as number);

    case "friends":
      return stats.friendCount >= (req.value as number);

    case "daily_completed":
      return stats.dailyGamesCompleted >= (req.value as number);

    case "perfect_score":
      if (req.mode === "country_shape") {
        return stats.shapeQuiz.bestScore >= stats.shapeQuiz.maxPossible && stats.shapeQuiz.maxPossible > 0;
      }
      if (req.mode === "street_view") return stats.streetView.perfectRounds;
      return false;

    case "unique_correct":
      if (req.mode === "country_shape") {
        return stats.shapeQuiz.uniqueCorrect >= (req.value as number);
      }
      return false;

    case "score_threshold":
      if (req.mode === "name_all") {
        return stats.nameAll.bestCount >= (req.value as number);
      }
      return false;

    case "speed_threshold":
      if (req.mode === "name_all") {
        return (
          stats.nameAll.bestCount >= (req.countries as number) &&
          stats.nameAll.bestTimeSeconds <= (req.seconds as number)
        );
      }
      return false;

    case "guess_count":
      if (req.mode === "worldle") {
        return stats.worldle.bestGuessCount <= (req.value as number) && stats.worldle.bestGuessCount > 0;
      }
      return false;

    case "daily_streak":
      if (req.mode === "worldle") {
        return stats.worldle.dailyStreak >= (req.value as number);
      }
      return false;

    case "distance_threshold":
      if (req.mode === "street_view") {
        return stats.streetView.bestDistanceKm <= (req.km as number) && stats.streetView.bestDistanceKm > 0;
      }
      return false;

    case "all_continents":
      return stats.streetView.continentsCovered >= 6;

    default:
      return false;
  }
}
