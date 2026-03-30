"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import { useAuth } from "@/presentation/providers/AuthProvider";
import { useSupabase } from "@/presentation/providers/SupabaseProvider";
import { getLevelFromXp } from "@/domain/xp";
import { Button } from "@/presentation/ui/Button";
import { StreakCalendar } from "@/presentation/profile/StreakCalendar";
import { ScoreChart } from "@/presentation/profile/ScoreChart";
import { AchievementGrid, type AchievementData } from "@/presentation/profile/AchievementGrid";
import { checkAchievement } from "@/domain/achievements";
import { cn } from "@/lib/utils/cn";
import { formatNumber } from "@/lib/utils/formatters";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";

const KnowledgeGlobe = dynamic(
  () => import("@/presentation/profile/KnowledgeGlobe").then((m) => m.KnowledgeGlobe),
  { ssr: false, loading: () => <div className="h-[300px] rounded-2xl bg-navy-card animate-pulse" /> }
);

interface Profile {
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  xp: number;
  level: number;
  current_streak: number;
  longest_streak: number;
  created_at: string;
}

interface GameStat {
  game_mode: string;
  games_played: number;
  best_score: number;
  avg_score: number;
  total_correct: number;
  total_questions: number;
  last_played: string | null;
}

interface RecentGame {
  id: string;
  game_mode: string;
  score: number;
  max_score: number | null;
  correct_count: number;
  total_count: number;
  xp_earned: number;
  time_seconds: number | null;
  created_at: string;
}

const GAME_MODES: Record<string, { label: string; icon: string }> = {
  country_shape: { label: "Shape Quiz", icon: "🗺️" },
  name_all: { label: "Name All", icon: "🌍" },
  worldle: { label: "Worldle", icon: "🧩" },
  street_view: { label: "Street View", icon: "📍" },
  capitals: { label: "Capitals", icon: "🏛️" },
  flag_quiz: { label: "Flag Quiz", icon: "🚩" },
  population: { label: "Population", icon: "👥" },
};

function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

function AccuracyRing({ percent, size = 48 }: { percent: number; size?: number }) {
  const r = (size - 6) / 2;
  const circ = 2 * Math.PI * r;
  const filled = circ * (percent / 100);
  return (
    <svg width={size} height={size} className="shrink-0">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#1a2332" strokeWidth={4} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#00e676" strokeWidth={4}
        strokeDasharray={`${filled} ${circ - filled}`} strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`} className="transition-all duration-700" />
      <text x={size / 2} y={size / 2} textAnchor="middle" dominantBaseline="central"
        className="fill-white text-[10px] font-bold">{percent}%</text>
    </svg>
  );
}

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const supabase = useSupabase();
  const router = useRouter();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [stats, setStats] = useState<GameStat[]>([]);
  const [recentGames, setRecentGames] = useState<RecentGame[]>([]);
  const [totalGames, setTotalGames] = useState(0);
  const [activityMap, setActivityMap] = useState<Map<string, number>>(new Map());
  const [chartData, setChartData] = useState<{ date: string; score: number; gameMode: string }[]>([]);
  const [countryAccuracy, setCountryAccuracy] = useState<Map<string, { correct: number; total: number }>>(new Map());
  const [achievements, setAchievements] = useState<AchievementData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.push("/login"); return; }

    async function loadAll() {
      // Profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("username, display_name, avatar_url, xp, level, current_streak, longest_streak, created_at")
        .eq("id", user!.id).single();
      if (profileData) setProfile(profileData);

      // All sessions
      const { data: sessions } = await supabase
        .from("game_sessions")
        .select("id, game_mode, score, max_score, correct_count, total_count, xp_earned, time_seconds, metadata, created_at")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });

      if (!sessions || sessions.length === 0) { setLoading(false); return; }

      setTotalGames(sessions.length);
      setRecentGames(sessions.slice(0, 20));

      // Aggregate stats per mode
      const modeMap = new Map<string, { scores: number[]; correct: number; total: number; lastPlayed: string }>();
      for (const s of sessions) {
        const e = modeMap.get(s.game_mode);
        if (e) { e.scores.push(s.score); e.correct += s.correct_count; e.total += s.total_count; }
        else modeMap.set(s.game_mode, { scores: [s.score], correct: s.correct_count, total: s.total_count, lastPlayed: s.created_at });
      }
      setStats(Array.from(modeMap.entries()).map(([mode, d]) => ({
        game_mode: mode, games_played: d.scores.length, best_score: Math.max(...d.scores),
        avg_score: Math.round(d.scores.reduce((a, b) => a + b, 0) / d.scores.length),
        total_correct: d.correct, total_questions: d.total, last_played: d.lastPlayed,
      })));

      // Activity map for streak calendar
      const aMap = new Map<string, number>();
      for (const s of sessions) {
        const day = s.created_at.split("T")[0];
        aMap.set(day, (aMap.get(day) || 0) + 1);
      }
      setActivityMap(aMap);

      // Chart data
      setChartData(sessions.map((s) => ({ date: s.created_at, score: s.score, gameMode: s.game_mode })).reverse());

      // Country accuracy extraction — track correct AND total attempts per country
      const correctMap = new Map<string, number>();
      const attemptsMap = new Map<string, number>();
      for (const s of sessions) {
        const meta = s.metadata as Record<string, unknown>;
        if (s.game_mode === "country_shape" && Array.isArray(meta?.guesses)) {
          for (const g of meta.guesses as { answer: string; correct: boolean }[]) {
            attemptsMap.set(g.answer, (attemptsMap.get(g.answer) || 0) + 1);
            if (g.correct) correctMap.set(g.answer, (correctMap.get(g.answer) || 0) + 1);
          }
        }
        if (s.game_mode === "name_all" && Array.isArray(meta?.named)) {
          for (const code of meta.named as string[]) {
            correctMap.set(code, (correctMap.get(code) || 0) + 1);
            attemptsMap.set(code, (attemptsMap.get(code) || 0) + 1);
          }
        }
        if (s.game_mode === "worldle" && meta?.target) {
          const code = meta.target as string;
          attemptsMap.set(code, (attemptsMap.get(code) || 0) + 1);
          if (s.correct_count > 0) correctMap.set(code, (correctMap.get(code) || 0) + 1);
        }
      }
      // Build accuracy map
      const accMap = new Map<string, { correct: number; total: number }>();
      for (const [code, total] of attemptsMap) {
        accMap.set(code, { correct: correctMap.get(code) || 0, total });
      }
      setCountryAccuracy(accMap);

      // Achievements — fetch all definitions, check which are earned
      const { data: achievementDefs } = await supabase
        .from("achievements")
        .select("id, name, description, icon, category, xp_reward, requirement");

      const { data: userAchievements } = await supabase
        .from("user_achievements")
        .select("achievement_id, unlocked_at")
        .eq("user_id", user!.id);

      const unlockedSet = new Map<string, string>();
      if (userAchievements) {
        for (const ua of userAchievements) {
          unlockedSet.set(ua.achievement_id, ua.unlocked_at);
        }
      }

      if (achievementDefs && profileData) {
        // Build stats for achievement checking
        const shapeGames = sessions.filter((s) => s.game_mode === "country_shape");
        const nameAllGames = sessions.filter((s) => s.game_mode === "name_all");
        const worldleGames = sessions.filter((s) => s.game_mode === "worldle");
        const dailyGames = sessions.filter((s) => (s.metadata as Record<string, unknown>)?.mode === "daily");

        // Compute Worldle daily streak — consecutive days with a daily Worldle win
        const dailyWorldleWins = worldleGames
          .filter((s) => s.correct_count > 0 && (s.metadata as Record<string, unknown>)?.mode === "daily")
          .map((s) => s.created_at.split("T")[0]);
        const uniqueDailyDates = [...new Set(dailyWorldleWins)].sort().reverse();
        let worldleDailyStreak = 0;
        const today = new Date().toISOString().split("T")[0];
        for (let i = 0; i < uniqueDailyDates.length; i++) {
          const expected = new Date(Date.now() - i * 86400000).toISOString().split("T")[0];
          if (uniqueDailyDates[i] === expected) {
            worldleDailyStreak++;
          } else if (i === 0 && uniqueDailyDates[0] !== today) {
            // Allow streak to start from yesterday
            const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
            if (uniqueDailyDates[0] === yesterday) {
              worldleDailyStreak++;
            } else break;
          } else break;
        }

        const userStats = {
          totalGamesPlayed: sessions.length,
          currentStreak: profileData.current_streak,
          longestStreak: profileData.longest_streak,
          level: profileData.level,
          friendCount: 0,
          dailyGamesCompleted: dailyGames.length,
          shapeQuiz: {
            bestScore: shapeGames.length > 0 ? Math.max(...shapeGames.map((s) => s.correct_count)) : 0,
            maxPossible: shapeGames.length > 0 ? Math.max(...shapeGames.map((s) => s.total_count)) : 0,
            uniqueCorrect: correctMap.size,
          },
          nameAll: {
            bestCount: nameAllGames.length > 0 ? Math.max(...nameAllGames.map((s) => s.correct_count)) : 0,
            bestTimeSeconds: nameAllGames.length > 0
              ? Math.min(...nameAllGames.map((s) => {
                  const meta = s.metadata as Record<string, unknown>;
                  return (meta?.elapsedSeconds as number) || s.time_seconds || 9999;
                }))
              : 9999,
          },
          worldle: {
            bestGuessCount: worldleGames.length > 0
              ? Math.min(...worldleGames.filter((s) => s.correct_count > 0).map((s) => {
                  const meta = s.metadata as Record<string, unknown>;
                  return (meta?.guessCount as number) || 6;
                })) : 0,
            dailyStreak: worldleDailyStreak,
          },
          streetView: { bestDistanceKm: 0, perfectRounds: false, continentsCovered: 0 },
        };

        const achievementList: AchievementData[] = achievementDefs.map((a) => {
          const alreadyUnlocked = unlockedSet.has(a.id);
          const earned = alreadyUnlocked || checkAchievement(a, userStats);

          // Auto-unlock newly earned achievements
          if (earned && !alreadyUnlocked) {
            supabase.from("user_achievements").insert({
              user_id: user!.id,
              achievement_id: a.id,
            }).then(() => {});
          }

          return {
            ...a,
            unlocked: earned,
            unlocked_at: unlockedSet.get(a.id),
          };
        });

        setAchievements(achievementList);
      }

      setLoading(false);
    }
    loadAll();
  }, [user, authLoading, supabase, router]);

  if (authLoading || loading) {
    return <div className="flex items-center justify-center py-20">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-green/30 border-t-green" />
    </div>;
  }

  if (!profile) {
    return <div className="py-20 text-center">
      <h1 className="text-2xl font-bold text-white">Profile not found</h1>
      <Link href="/login"><Button className="mt-4">Sign In</Button></Link>
    </div>;
  }

  const levelInfo = getLevelFromXp(profile.xp);
  const displayName = profile.display_name || profile.username;

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-green/10 bg-navy-card p-6">
        <div className="flex items-center gap-4">
          {profile.avatar_url ? (
            <Image src={profile.avatar_url} alt={displayName} width={64} height={64} className="h-16 w-16 rounded-full" />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-green-dark to-green text-2xl font-bold text-navy">
              {displayName[0]?.toUpperCase()}
            </div>
          )}
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white">{displayName}</h1>
            <p className="text-sm text-slate-500">@{profile.username}</p>
          </div>
          <Link href="/settings"><Button variant="ghost" size="sm">Settings</Button></Link>
        </div>

        <div className="mt-5">
          <div className="mb-1 flex items-center justify-between text-xs">
            <span className="font-bold text-green">Level {levelInfo.level}</span>
            <span className="text-slate-500">{formatNumber(levelInfo.currentLevelXp)} / {formatNumber(levelInfo.nextLevelXp)} XP</span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-navy-lighter">
            <motion.div initial={{ width: 0 }} animate={{ width: `${levelInfo.progress * 100}%` }}
              transition={{ duration: 0.8 }} className="h-full rounded-full bg-gradient-to-r from-green-dark to-green" />
          </div>
        </div>

        <div className="mt-5 grid grid-cols-4 gap-3">
          {[
            { value: formatNumber(profile.xp), label: "Total XP" },
            { value: totalGames.toString(), label: "Games" },
            { value: `${profile.current_streak}`, label: "Streak" },
            { value: profile.longest_streak.toString(), label: "Best" },
          ].map((s) => (
            <div key={s.label} className="rounded-lg bg-navy-lighter/50 p-3 text-center">
              <div className="text-xl font-bold text-white">{s.value}</div>
              <div className="text-[10px] text-slate-500 uppercase tracking-wider">{s.label}</div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Knowledge Globe */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <h2 className="mb-3 text-xs font-medium uppercase tracking-widest text-green/60">World Knowledge</h2>
        <KnowledgeGlobe countryAccuracy={countryAccuracy} />
      </motion.div>

      {/* Streak Calendar */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <h2 className="mb-3 text-xs font-medium uppercase tracking-widest text-green/60">Activity</h2>
        <div className="rounded-2xl border border-green/10 bg-navy-card p-4">
          <StreakCalendar activityMap={activityMap} />
        </div>
      </motion.div>

      {/* Game Stats */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <h2 className="mb-3 text-xs font-medium uppercase tracking-widest text-green/60">Game Stats</h2>
        {stats.length === 0 ? (
          <div className="rounded-xl border border-white/5 bg-navy-card p-8 text-center">
            <p className="text-slate-500">No games played yet</p>
            <Link href="/"><Button className="mt-3" size="sm">Play Now</Button></Link>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {stats.map((stat, i) => {
              const mode = GAME_MODES[stat.game_mode] || { label: stat.game_mode, icon: "🎮" };
              const accuracy = stat.total_questions > 0 ? Math.round((stat.total_correct / stat.total_questions) * 100) : 0;
              return (
                <motion.div key={stat.game_mode} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }} className="rounded-xl border border-green/10 bg-navy-card p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{mode.icon}</span>
                      <span className="text-sm font-semibold text-green">{mode.label}</span>
                    </div>
                    <AccuracyRing percent={accuracy} />
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                    <div><div className="text-lg font-bold text-white">{stat.games_played}</div><div className="text-[10px] text-slate-500 uppercase">Played</div></div>
                    <div><div className="text-lg font-bold text-white">{formatNumber(stat.best_score)}</div><div className="text-[10px] text-slate-500 uppercase">Best</div></div>
                    <div><div className="text-lg font-bold text-white">{formatNumber(stat.avg_score)}</div><div className="text-[10px] text-slate-500 uppercase">Average</div></div>
                    <div><div className="text-sm text-slate-400">{stat.last_played ? relativeTime(stat.last_played) : "—"}</div><div className="text-[10px] text-slate-500 uppercase">Last</div></div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* Achievements */}
      {achievements.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
          <h2 className="mb-3 text-xs font-medium uppercase tracking-widest text-green/60">Achievements</h2>
          <div className="rounded-2xl border border-green/10 bg-navy-card p-4">
            <AchievementGrid achievements={achievements} />
          </div>
        </motion.div>
      )}

      {/* Score Progression */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <h2 className="mb-3 text-xs font-medium uppercase tracking-widest text-green/60">Score Progression</h2>
        <div className="rounded-2xl border border-green/10 bg-navy-card p-4">
          <ScoreChart data={chartData} />
        </div>
      </motion.div>

      {/* Recent Games */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
        <h2 className="mb-3 text-xs font-medium uppercase tracking-widest text-green/60">Recent Games</h2>
        {recentGames.length === 0 ? (
          <div className="rounded-xl border border-white/5 bg-navy-card p-8 text-center"><p className="text-slate-500">No history yet</p></div>
        ) : (
          <div className="space-y-1.5">
            {recentGames.map((game, i) => {
              const mode = GAME_MODES[game.game_mode] || { label: game.game_mode, icon: "🎮" };
              const accuracy = game.total_count > 0 ? Math.round((game.correct_count / game.total_count) * 100) : 0;
              const isGood = accuracy >= 70;
              return (
                <motion.div key={game.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + i * 0.03 }} className="flex items-center gap-3 rounded-lg border border-white/5 bg-navy-card px-4 py-2.5">
                  <span className="text-sm">{mode.icon}</span>
                  <span className="flex-1 text-sm font-medium text-white">{mode.label}</span>
                  <div className={cn("rounded px-1.5 py-0.5 text-xs font-bold", isGood ? "bg-green/10 text-green" : "bg-white/5 text-slate-400")}>{accuracy}%</div>
                  <div className="text-sm font-bold tabular-nums text-white">{game.score}{game.max_score && <span className="text-slate-600">/{game.max_score}</span>}</div>
                  <div className="text-xs text-green/60">+{game.xp_earned}</div>
                  <div className="text-xs text-slate-600 w-16 text-right">{relativeTime(game.created_at)}</div>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>
    </div>
  );
}
