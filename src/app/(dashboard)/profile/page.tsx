"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/presentation/providers/AuthProvider";
import { useSupabase } from "@/presentation/providers/SupabaseProvider";
import { getLevelFromXp } from "@/domain/xp";
import { Button } from "@/presentation/ui/Button";
import { cn } from "@/lib/utils/cn";
import { formatNumber } from "@/lib/utils/formatters";
import Link from "next/link";
import { useRouter } from "next/navigation";

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
  created_at: string;
}

const GAME_MODE_LABELS: Record<string, string> = {
  country_shape: "Shape Quiz",
  name_all: "Name All",
  worldle: "Worldle",
  street_view: "Street View",
};

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const supabase = useSupabase();
  const router = useRouter();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [stats, setStats] = useState<GameStat[]>([]);
  const [recentGames, setRecentGames] = useState<RecentGame[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/login");
      return;
    }

    async function loadProfile() {
      // Fetch profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("username, display_name, avatar_url, xp, level, current_streak, longest_streak, created_at")
        .eq("id", user!.id)
        .single();

      if (profileData) setProfile(profileData);

      // Fetch game stats (aggregated)
      const { data: sessionsData } = await supabase
        .from("game_sessions")
        .select("game_mode, score, created_at")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });

      if (sessionsData && sessionsData.length > 0) {
        // Aggregate stats per game mode
        const modeMap = new Map<string, { scores: number[]; lastPlayed: string }>();
        for (const s of sessionsData) {
          const existing = modeMap.get(s.game_mode);
          if (existing) {
            existing.scores.push(s.score);
          } else {
            modeMap.set(s.game_mode, { scores: [s.score], lastPlayed: s.created_at });
          }
        }

        const aggregated: GameStat[] = Array.from(modeMap.entries()).map(
          ([mode, data]) => ({
            game_mode: mode,
            games_played: data.scores.length,
            best_score: Math.max(...data.scores),
            avg_score: Math.round(
              data.scores.reduce((a, b) => a + b, 0) / data.scores.length
            ),
            last_played: data.lastPlayed,
          })
        );
        setStats(aggregated);
      }

      // Fetch recent games
      const { data: recentData } = await supabase
        .from("game_sessions")
        .select("id, game_mode, score, max_score, correct_count, total_count, xp_earned, created_at")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false })
        .limit(20);

      if (recentData) setRecentGames(recentData);

      setLoading(false);
    }

    loadProfile();
  }, [user, authLoading, supabase, router]);

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-green/30 border-t-green" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="py-20 text-center">
        <h1 className="text-2xl font-bold text-white">Profile not found</h1>
        <p className="mt-2 text-slate-500">Please sign in to view your profile.</p>
        <Link href="/login">
          <Button className="mt-4">Sign In</Button>
        </Link>
      </div>
    );
  }

  const levelInfo = getLevelFromXp(profile.xp);
  const displayName = profile.display_name || profile.username;

  return (
    <div className="space-y-8">
      {/* User Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-green/10 bg-navy-card p-6"
      >
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-green-dark to-green text-2xl font-bold text-navy">
            {displayName[0]?.toUpperCase()}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white">{displayName}</h1>
            <p className="text-sm text-slate-500">@{profile.username}</p>
          </div>
          <Link href="/settings">
            <Button variant="ghost" size="sm">Settings</Button>
          </Link>
        </div>

        {/* Level + XP bar */}
        <div className="mt-5">
          <div className="mb-1 flex items-center justify-between text-xs">
            <span className="font-bold text-green">Level {levelInfo.level}</span>
            <span className="text-slate-500">
              {formatNumber(levelInfo.currentLevelXp)} / {formatNumber(levelInfo.nextLevelXp)} XP
            </span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-navy-lighter">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${levelInfo.progress * 100}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="h-full rounded-full bg-gradient-to-r from-green-dark to-green"
            />
          </div>
        </div>

        {/* Quick stats */}
        <div className="mt-5 grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-white">{formatNumber(profile.xp)}</div>
            <div className="text-xs text-slate-500">Total XP</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-white">
              {profile.current_streak > 0 ? profile.current_streak : 0}
            </div>
            <div className="text-xs text-slate-500">Day Streak</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-white">{profile.longest_streak}</div>
            <div className="text-xs text-slate-500">Best Streak</div>
          </div>
        </div>
      </motion.div>

      {/* Game Stats */}
      <div>
        <h2 className="mb-3 text-sm font-medium uppercase tracking-wider text-green/60">
          Game Stats
        </h2>
        {stats.length === 0 ? (
          <div className="rounded-xl border border-white/5 bg-navy-card p-8 text-center">
            <p className="text-slate-500">No games played yet. Go play some!</p>
            <Link href="/">
              <Button className="mt-3" size="sm">Play Now</Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {stats.map((stat) => (
              <motion.div
                key={stat.game_mode}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="rounded-xl border border-green/10 bg-navy-card p-4"
              >
                <div className="mb-3 text-sm font-semibold text-green">
                  {GAME_MODE_LABELS[stat.game_mode] || stat.game_mode}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-lg font-bold text-white">{stat.games_played}</div>
                    <div className="text-xs text-slate-500">Played</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-white">{formatNumber(stat.best_score)}</div>
                    <div className="text-xs text-slate-500">Best</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-white">{formatNumber(stat.avg_score)}</div>
                    <div className="text-xs text-slate-500">Average</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">
                      {stat.last_played
                        ? new Date(stat.last_played).toLocaleDateString()
                        : "—"}
                    </div>
                    <div className="text-xs text-slate-500">Last Played</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Games */}
      <div>
        <h2 className="mb-3 text-sm font-medium uppercase tracking-wider text-green/60">
          Recent Games
        </h2>
        {recentGames.length === 0 ? (
          <div className="rounded-xl border border-white/5 bg-navy-card p-8 text-center">
            <p className="text-slate-500">No game history yet.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {recentGames.map((game, i) => (
              <motion.div
                key={game.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                className="flex items-center gap-3 rounded-lg border border-white/5 bg-navy-card px-4 py-3"
              >
                <div className={cn(
                  "h-2 w-2 rounded-full",
                  game.correct_count === game.total_count ? "bg-green" : "bg-slate-500"
                )} />
                <div className="flex-1">
                  <span className="text-sm font-medium text-white">
                    {GAME_MODE_LABELS[game.game_mode] || game.game_mode}
                  </span>
                </div>
                <div className="text-sm font-bold text-white">
                  {game.score}
                  {game.max_score && (
                    <span className="text-slate-500">/{game.max_score}</span>
                  )}
                </div>
                <div className="text-xs text-green">+{game.xp_earned} XP</div>
                <div className="text-xs text-slate-600">
                  {new Date(game.created_at).toLocaleDateString()}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
