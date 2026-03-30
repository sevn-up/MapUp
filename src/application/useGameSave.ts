"use client";

import { useCallback, useState, useRef } from "react";
import { useAuth } from "@/presentation/providers/AuthProvider";
import { useSupabase } from "@/presentation/providers/SupabaseProvider";
import { calculateGameXp, getLevelFromXp } from "@/domain/xp";
import { useToast } from "@/application/useToast";
import type { GameMode } from "@/domain/types";

interface SaveGameParams {
  gameMode: GameMode;
  score: number;
  maxScore?: number;
  correctCount: number;
  totalCount: number;
  timeSeconds?: number;
  metadata?: Record<string, unknown>;
  isDaily?: boolean;
}

interface SaveResult {
  success: boolean;
  xpEarned: number;
  newLevel?: number;
  streakDays: number;
  error?: string;
}

// Module-level dedup: prevents double saves across Strict Mode remounts.
// Uses a 5-second window — any save with the same user+mode+score within 5s is a duplicate.
const recentSaves = new Map<string, number>();

function makeSaveKey(userId: string, gameMode: string, score: number, correctCount: number): string {
  return `${userId}:${gameMode}:${score}:${correctCount}`;
}

function isDuplicate(key: string): boolean {
  const lastSaveTime = recentSaves.get(key);
  if (lastSaveTime && Date.now() - lastSaveTime < 5000) return true;
  return false;
}

function markSaved(key: string): void {
  recentSaves.set(key, Date.now());
  // Clean up old entries
  setTimeout(() => recentSaves.delete(key), 10000);
}

/**
 * Hook for saving game results to Supabase.
 * Handles: game_sessions insert, XP update, streak tracking, level calculation.
 * Gracefully skips for guest users (not logged in).
 */
export function useGameSave() {
  const { user } = useAuth();
  const supabase = useSupabase();
  const [saving, setSaving] = useState(false);
  const [lastSave, setLastSave] = useState<SaveResult | null>(null);
  const savedRef = useRef(false);
  const addToast = useToast((s) => s.addToast);

  const saveGame = useCallback(
    async (params: SaveGameParams): Promise<SaveResult> => {
      // Skip for guests
      if (!user) {
        const result: SaveResult = { success: false, xpEarned: 0, streakDays: 0 };
        setLastSave(result);
        return result;
      }

      // Guard against double-calls (React Strict Mode double-mount)
      const dedupeKey = makeSaveKey(user.id, params.gameMode, params.score, params.correctCount);
      if (savedRef.current || isDuplicate(dedupeKey)) {
        return lastSave || { success: false, xpEarned: 0, streakDays: 0 };
      }
      savedRef.current = true;
      markSaved(dedupeKey);

      setSaving(true);

      try {
        // 1. Fetch current profile for streak calculation
        const { data: profile } = await supabase
          .from("profiles")
          .select("xp, level, current_streak, longest_streak, last_played_at")
          .eq("id", user.id)
          .single();

        if (!profile) throw new Error("Profile not found");

        // 2. Calculate XP earned
        const xpEarned = calculateGameXp(params.score, profile.current_streak);

        // 3. Calculate streak
        const now = new Date();
        const lastPlayed = profile.last_played_at
          ? new Date(profile.last_played_at)
          : null;

        let newStreak = profile.current_streak;
        if (lastPlayed) {
          const diffDays = Math.floor(
            (now.getTime() - lastPlayed.getTime()) / 86400000
          );
          if (diffDays === 0) {
            // Same day — keep streak
          } else if (diffDays === 1) {
            // Yesterday — increment
            newStreak += 1;
          } else {
            // Missed days — reset
            newStreak = 1;
          }
        } else {
          newStreak = 1; // First game ever
        }

        const newLongestStreak = Math.max(newStreak, profile.longest_streak);

        // 4. Calculate new level
        const newTotalXp = profile.xp + xpEarned;
        const { level: newLevel } = getLevelFromXp(newTotalXp);

        // 5. Insert game session
        const { error: sessionError } = await supabase
          .from("game_sessions")
          .insert({
            user_id: user.id,
            game_mode: params.gameMode,
            score: params.score,
            max_score: params.maxScore ?? null,
            time_seconds: params.timeSeconds ?? null,
            correct_count: params.correctCount,
            total_count: params.totalCount,
            xp_earned: xpEarned,
            metadata: params.metadata ?? {},
            is_daily: params.isDaily ?? false,
          });

        if (sessionError) throw sessionError;

        // 6. Update profile
        const { error: profileError } = await supabase
          .from("profiles")
          .update({
            xp: newTotalXp,
            level: newLevel,
            current_streak: newStreak,
            longest_streak: newLongestStreak,
            last_played_at: now.toISOString(),
          })
          .eq("id", user.id);

        if (profileError) throw profileError;

        // 7. Check for newly unlocked achievements (fire-and-forget)
        try {
          const { data: achievementDefs } = await supabase
            .from("achievements")
            .select("id, name, icon, xp_reward, requirement");
          const { data: userAchievements } = await supabase
            .from("user_achievements")
            .select("achievement_id")
            .eq("user_id", user.id);

          if (achievementDefs && userAchievements) {
            const unlockedIds = new Set(userAchievements.map((a) => a.achievement_id));
            const { checkAchievement } = await import("@/domain/achievements");

            // Build minimal stats from this game + profile
            const minimalStats = {
              totalGamesPlayed: (profile as Record<string, number>).total_games_played ?? 1,
              currentStreak: newStreak,
              longestStreak: newLongestStreak,
              level: newLevel,
              friendCount: 0,
              dailyGamesCompleted: params.isDaily ? 1 : 0,
              shapeQuiz: { bestScore: params.gameMode === "country_shape" ? params.correctCount : 0, maxPossible: params.gameMode === "country_shape" ? params.totalCount : 0, uniqueCorrect: 0 },
              nameAll: { bestCount: params.gameMode === "name_all" ? params.correctCount : 0, bestTimeSeconds: params.timeSeconds ?? 9999 },
              worldle: { bestGuessCount: 0, dailyStreak: 0 },
              streetView: { bestDistanceKm: 0, perfectRounds: false, continentsCovered: 0 },
              capitals: { bestScore: params.gameMode === "capitals" ? params.correctCount : 0, maxPossible: params.gameMode === "capitals" ? params.totalCount : 0, uniqueCorrect: 0 },
              flagQuiz: { bestScore: params.gameMode === "flag_quiz" ? params.correctCount : 0, uniqueCorrect: 0 },
              population: { bestStreak: params.gameMode === "population" ? params.correctCount : 0 },
            };

            for (const ach of achievementDefs) {
              if (unlockedIds.has(ach.id)) continue;
              if (checkAchievement(ach, minimalStats)) {
                supabase.from("user_achievements").insert({ user_id: user.id, achievement_id: ach.id }).then(() => {});
                addToast({
                  icon: ach.icon,
                  title: ach.name,
                  subtitle: `+${ach.xp_reward} XP`,
                  type: "achievement",
                });
              }
            }
          }
        } catch {
          // Achievement check is best-effort, don't fail the save
        }

        const result: SaveResult = {
          success: true,
          xpEarned,
          newLevel,
          streakDays: newStreak,
        };

        setLastSave(result);
        setSaving(false);
        return result;
      } catch (err) {
        const result: SaveResult = {
          success: false,
          xpEarned: 0,
          streakDays: 0,
          error: err instanceof Error ? err.message : "Failed to save",
        };
        setLastSave(result);
        setSaving(false);
        return result;
      }
    },
    [user, supabase]
  );

  const resetSaveGuard = useCallback(() => {
    savedRef.current = false;
    setLastSave(null);
  }, []);

  return { saveGame, saving, lastSave, resetSaveGuard };
}
