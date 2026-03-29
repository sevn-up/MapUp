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
import Image from "next/image";

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
  created_at: string;
}

const GAME_MODES: Record<string, { label: string; icon: string; color: string }> = {
  country_shape: { label: "Shape Quiz", icon: "🗺️", color: "from-emerald-500 to-green" },
  name_all: { label: "Name All", icon: "🌍", color: "from-teal-500 to-emerald-500" },
  worldle: { label: "Worldle", icon: "🧩", color: "from-green to-green-light" },
  street_view: { label: "Street View", icon: "📍", color: "from-green-dark to-green" },
};

function relativeTime(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = now - then;
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
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="#00e676"
        strokeWidth={4}
        strokeDasharray={`${filled} ${circ - filled}`}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        className="transition-all duration-700"
      />
      <text
        x={size / 2}
        y={size / 2}
        textAnchor="middle"
        dominantBaseline="central"
        className="fill-white text-[10px] font-bold"
      >
        {percent}%
      </text>
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/login");
      return;
    }

    async function loadProfile() {
      const { data: profileData } = await supabase
        .from("profiles")
        .select("username, display_name, avatar_url, xp, level, current_streak, longest_streak, created_at")
        .eq("id", user!.id)
        .single();

      if (profileData) setProfile(profileData);

      const { data: sessionsData } = await supabase
        .from("game_sessions")
        .select("game_mode, score, correct_count, total_count, created_at")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });

      if (sessionsData && sessionsData.length > 0) {
        setTotalGames(sessionsData.length);

        const modeMap = new Map<string, { scores: number[]; correct: number; total: number; lastPlayed: string }>();
        for (const s of sessionsData) {
          const existing = modeMap.get(s.game_mode);
          if (existing) {
            existing.scores.push(s.score);
            existing.correct += s.correct_count;
            existing.total += s.total_count;
          } else {
            modeMap.set(s.game_mode, {
              scores: [s.score],
              correct: s.correct_count,
              total: s.total_count,
              lastPlayed: s.created_at,
            });
          }
        }

        const aggregated: GameStat[] = Array.from(modeMap.entries()).map(
          ([mode, data]) => ({
            game_mode: mode,
            games_played: data.scores.length,
            best_score: Math.max(...data.scores),
            avg_score: Math.round(data.scores.reduce((a, b) => a + b, 0) / data.scores.length),
            total_correct: data.correct,
            total_questions: data.total,
            last_played: data.lastPlayed,
          })
        );
        setStats(aggregated);
      }

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
        <Link href="/login"><Button className="mt-4">Sign In</Button></Link>
      </div>
    );
  }

  const levelInfo = getLevelFromXp(profile.xp);
  const displayName = profile.display_name || profile.username;

  return (
    <div className="space-y-6">
      {/* User Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-green/10 bg-navy-card p-6"
      >
        <div className="flex items-center gap-4">
          {profile.avatar_url ? (
            <Image
              src={profile.avatar_url}
              alt={displayName}
              width={64}
              height={64}
              className="h-16 w-16 rounded-full"
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-green-dark to-green text-2xl font-bold text-navy">
              {displayName[0]?.toUpperCase()}
            </div>
          )}
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white">{displayName}</h1>
            <p className="text-sm text-slate-500">@{profile.username}</p>
          </div>
          <Link href="/settings">
            <Button variant="ghost" size="sm">Settings</Button>
          </Link>
        </div>

        {/* Level + XP */}
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
        <div className="mt-5 grid grid-cols-4 gap-3">
          {[
            { value: formatNumber(profile.xp), label: "Total XP" },
            { value: totalGames.toString(), label: "Games" },
            { value: profile.current_streak > 0 ? `${profile.current_streak}` : "0", label: "Streak" },
            { value: profile.longest_streak.toString(), label: "Best Streak" },
          ].map((s) => (
            <div key={s.label} className="rounded-lg bg-navy-lighter/50 p-3 text-center">
              <div className="text-xl font-bold text-white">{s.value}</div>
              <div className="text-[10px] text-slate-500 uppercase tracking-wider">{s.label}</div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Game Stats */}
      <div>
        <h2 className="mb-3 text-xs font-medium uppercase tracking-widest text-green/60">
          Game Stats
        </h2>
        {stats.length === 0 ? (
          <div className="rounded-xl border border-white/5 bg-navy-card p-8 text-center">
            <p className="text-slate-500">No games played yet</p>
            <Link href="/"><Button className="mt-3" size="sm">Play Now</Button></Link>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {stats.map((stat, i) => {
              const mode = GAME_MODES[stat.game_mode] || { label: stat.game_mode, icon: "🎮", color: "from-green to-green-light" };
              const accuracy = stat.total_questions > 0
                ? Math.round((stat.total_correct / stat.total_questions) * 100)
                : 0;

              return (
                <motion.div
                  key={stat.game_mode}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="rounded-xl border border-green/10 bg-navy-card p-4"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{mode.icon}</span>
                      <span className="text-sm font-semibold text-green">{mode.label}</span>
                    </div>
                    <AccuracyRing percent={accuracy} />
                  </div>

                  <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                    <div>
                      <div className="text-lg font-bold text-white">{stat.games_played}</div>
                      <div className="text-[10px] text-slate-500 uppercase">Played</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-white">{formatNumber(stat.best_score)}</div>
                      <div className="text-[10px] text-slate-500 uppercase">Best</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-white">{formatNumber(stat.avg_score)}</div>
                      <div className="text-[10px] text-slate-500 uppercase">Average</div>
                    </div>
                    <div>
                      <div className="text-sm text-slate-400">
                        {stat.last_played ? relativeTime(stat.last_played) : "—"}
                      </div>
                      <div className="text-[10px] text-slate-500 uppercase">Last</div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Recent Games */}
      <div>
        <h2 className="mb-3 text-xs font-medium uppercase tracking-widest text-green/60">
          Recent Games
        </h2>
        {recentGames.length === 0 ? (
          <div className="rounded-xl border border-white/5 bg-navy-card p-8 text-center">
            <p className="text-slate-500">No game history yet</p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {recentGames.map((game, i) => {
              const mode = GAME_MODES[game.game_mode] || { label: game.game_mode, icon: "🎮", color: "" };
              const accuracy = game.total_count > 0
                ? Math.round((game.correct_count / game.total_count) * 100)
                : 0;
              const isGood = game.max_score ? game.score / game.max_score >= 0.7 : accuracy >= 70;

              return (
                <motion.div
                  key={game.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="flex items-center gap-3 rounded-lg border border-white/5 bg-navy-card px-4 py-2.5"
                >
                  <span className="text-sm">{mode.icon}</span>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium text-white">{mode.label}</span>
                  </div>
                  <div className={cn(
                    "rounded px-1.5 py-0.5 text-xs font-bold",
                    isGood ? "bg-green/10 text-green" : "bg-white/5 text-slate-400"
                  )}>
                    {accuracy}%
                  </div>
                  <div className="text-sm font-bold tabular-nums text-white">
                    {game.score}
                    {game.max_score && <span className="text-slate-600">/{game.max_score}</span>}
                  </div>
                  <div className="text-xs text-green/60">+{game.xp_earned}</div>
                  <div className="text-xs text-slate-600 w-16 text-right">
                    {relativeTime(game.created_at)}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
