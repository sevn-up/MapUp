"use client";

import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStreetViewGame, type StreetViewLocation } from "@/application/useStreetView";
import { useGameSave } from "@/application/useGameSave";
import { StreetViewPano } from "@/presentation/game/StreetViewPano";
import { Button } from "@/presentation/ui/Button";
import { getCountryByCode } from "@/domain/countries";
import { formatNumber } from "@/lib/utils/formatters";
import { STREET_VIEW_MAX_SCORE } from "@/lib/utils/constants";
import { cn } from "@/lib/utils/cn";

// Note: The left panel (Mapbox guess map) is rendered by StreetViewGuessPanel
// via the game layout. This page only renders the right panel content.

const REGIONS = [
  { id: "", label: "World", icon: "🌍" },
  { id: "europe", label: "Europe", icon: "🇪🇺" },
  { id: "asia", label: "Asia", icon: "🌏" },
  { id: "africa", label: "Africa", icon: "🌍" },
  { id: "north_america", label: "Americas", icon: "🌎" },
  { id: "south_america", label: "S. America", icon: "🌎" },
  { id: "oceania", label: "Oceania", icon: "🏝️" },
] as const;

const SUB_REGIONS: Record<string, { id: string; label: string }[]> = {
  europe: [
    { id: "western_europe", label: "Western" },
    { id: "eastern_europe", label: "Eastern" },
    { id: "northern_europe", label: "Northern" },
    { id: "southern_europe", label: "Southern" },
  ],
  asia: [
    { id: "east_asia", label: "East Asia" },
    { id: "southeast_asia", label: "SE Asia" },
    { id: "south_asia", label: "South Asia" },
    { id: "middle_east", label: "Middle East" },
    { id: "central_asia", label: "Central" },
  ],
  africa: [
    { id: "north_africa", label: "North" },
    { id: "west_africa", label: "West" },
    { id: "east_africa", label: "East" },
    { id: "southern_africa", label: "Southern" },
  ],
  north_america: [
    { id: "usa", label: "USA" },
    { id: "canada", label: "Canada" },
    { id: "caribbean", label: "Caribbean" },
    { id: "central_america", label: "Central Am." },
  ],
  oceania: [
    { id: "australia", label: "Australia" },
    { id: "new_zealand", label: "New Zealand" },
    { id: "pacific_islands", label: "Pacific" },
  ],
};

const THEMES = [
  { id: "", label: "All Themes" },
  { id: "landmarks", label: "Landmarks" },
  { id: "natural_wonders", label: "Nature" },
  { id: "historic", label: "Historic" },
  { id: "coastal", label: "Coastal" },
  { id: "urban", label: "Urban" },
  { id: "rural", label: "Rural" },
] as const;

function StartScreen() {
  const startGame = useStreetViewGame((s) => s.startGame);

  const [region, setRegion] = useState("");
  const [subRegion, setSubRegion] = useState("");
  const [theme, setTheme] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [numRounds, setNumRounds] = useState(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [availableCount, setAvailableCount] = useState<number | null>(null);

  // Fetch available location count when filters change
  const fetchCount = useCallback(async () => {
    const params = new URLSearchParams();
    if (region) params.set("region", region);
    if (subRegion) params.set("sub_region", subRegion);
    if (theme) params.set("theme", theme);
    if (difficulty) params.set("difficulty", difficulty);

    try {
      const res = await fetch(`/api/street-view/count?${params}`);
      const data = await res.json();
      setAvailableCount(data.count ?? 0);
    } catch {
      setAvailableCount(null);
    }
  }, [region, subRegion, theme, difficulty]);

  useEffect(() => { fetchCount(); }, [fetchCount]);

  const handleRegionChange = (r: string) => {
    setRegion(r);
    setSubRegion(""); // Reset sub-region when region changes
  };

  const handleStart = async () => {
    setLoading(true);
    setError("");
    try {
      // Fetch 3x locations — extras serve as backups for locations without coverage
      const params = new URLSearchParams({ count: (numRounds * 3).toString() });
      if (region) params.set("region", region);
      if (subRegion) params.set("sub_region", subRegion);
      if (theme) params.set("theme", theme);
      if (difficulty) params.set("difficulty", difficulty);

      const res = await fetch(`/api/street-view?${params}`);
      const locations: StreetViewLocation[] = await res.json();

      if (!locations.length) {
        setError("No locations match these filters. Try broader options.");
        setLoading(false);
        return;
      }

      startGame(locations, numRounds, (difficulty || "medium") as "easy" | "medium" | "hard");
    } catch {
      setError("Failed to load locations");
      setLoading(false);
    }
  };

  const subRegions = region ? SUB_REGIONS[region] : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-lg"
    >
      <h1 className="mb-2 text-center text-3xl font-bold text-white">
        Street View Challenge
      </h1>
      <p className="mb-6 text-center text-slate-500">
        Explore the panorama and guess where in the world you are
      </p>

      {/* Region */}
      <div className="mb-4">
        <div className="mb-2 text-xs font-medium uppercase tracking-wider text-green/60">
          Region
        </div>
        <div className="flex flex-wrap gap-1.5">
          {REGIONS.map((r) => (
            <button
              key={r.id}
              onClick={() => handleRegionChange(r.id)}
              className={cn(
                "rounded-lg border px-3 py-2 text-xs font-semibold transition-all",
                region === r.id
                  ? "border-green/40 bg-green/10 text-green"
                  : "border-white/5 bg-white/[0.02] text-slate-400 hover:bg-white/5"
              )}
            >
              {r.label}
            </button>
          ))}
        </div>

        {/* Sub-regions */}
        {subRegions && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            <button
              onClick={() => setSubRegion("")}
              className={cn(
                "rounded-md border px-2.5 py-1.5 text-[11px] font-medium transition-all",
                !subRegion
                  ? "border-green/30 bg-green/5 text-green"
                  : "border-white/5 text-slate-500 hover:text-slate-300"
              )}
            >
              All
            </button>
            {subRegions.map((sr) => (
              <button
                key={sr.id}
                onClick={() => setSubRegion(sr.id)}
                className={cn(
                  "rounded-md border px-2.5 py-1.5 text-[11px] font-medium transition-all",
                  subRegion === sr.id
                    ? "border-green/30 bg-green/5 text-green"
                    : "border-white/5 text-slate-500 hover:text-slate-300"
                )}
              >
                {sr.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Theme */}
      <div className="mb-4">
        <div className="mb-2 text-xs font-medium uppercase tracking-wider text-green/60">
          Theme
        </div>
        <div className="flex flex-wrap gap-1.5">
          {THEMES.map((t) => (
            <button
              key={t.id}
              onClick={() => setTheme(t.id)}
              className={cn(
                "rounded-lg border px-3 py-2 text-xs font-semibold transition-all",
                theme === t.id
                  ? "border-green/40 bg-green/10 text-green"
                  : "border-white/5 bg-white/[0.02] text-slate-400 hover:bg-white/5"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Difficulty */}
      <div className="mb-4">
        <div className="mb-2 text-xs font-medium uppercase tracking-wider text-green/60">
          Difficulty
        </div>
        <div className="flex gap-2">
          {[
            { id: "", label: "All" },
            { id: "easy", label: "Easy" },
            { id: "medium", label: "Medium" },
            { id: "hard", label: "Hard" },
          ].map((d) => (
            <button
              key={d.id}
              onClick={() => setDifficulty(d.id)}
              className={cn(
                "flex-1 rounded-lg border py-2.5 text-xs font-semibold capitalize transition-all",
                difficulty === d.id
                  ? "border-green/40 bg-green/10 text-green"
                  : "border-white/5 bg-white/[0.02] text-slate-400 hover:bg-white/5"
              )}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      {/* Rounds */}
      <div className="mb-5">
        <div className="mb-2 text-xs font-medium uppercase tracking-wider text-green/60">
          Rounds
        </div>
        <div className="flex gap-2">
          {[3, 5, 10].map((n) => (
            <button
              key={n}
              onClick={() => setNumRounds(n)}
              className={cn(
                "flex-1 rounded-lg border py-2.5 text-xs font-semibold transition-all",
                numRounds === n
                  ? "border-green/40 bg-green/10 text-green"
                  : "border-white/5 bg-white/[0.02] text-slate-400 hover:bg-white/5"
              )}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      {error && <p className="mb-4 text-center text-sm text-wrong">{error}</p>}

      <Button
        onClick={handleStart}
        disabled={loading || (availableCount !== null && availableCount < numRounds)}
        size="lg"
        className="w-full"
      >
        {loading
          ? "Loading..."
          : availableCount !== null
            ? `Start Game — ${availableCount} locations`
            : "Start Game"
        }
      </Button>
    </motion.div>
  );
}

function GameScreen() {
  const { currentRound, rounds, skipCurrentLocation } = useStreetViewGame();
  const round = rounds[currentRound];

  const handleNoCoverage = useCallback(() => {
    // Auto-swap to a backup location when no Street View coverage
    skipCurrentLocation();
  }, [skipCurrentLocation]);

  if (!round) return null;

  return (
    <div className="h-full">
      <StreetViewPano
        key={`${round.location.lat}-${round.location.lng}`}
        lat={round.location.lat}
        lng={round.location.lng}
        className="h-full w-full"
        onNoCoverage={handleNoCoverage}
      />
    </div>
  );
}

function ResultsScreen() {
  const { rounds, totalScore, totalRounds, difficulty, reset } = useStreetViewGame();
  const { saveGame } = useGameSave();
  const savedRef = useRef(false);

  const maxScore = totalRounds * STREET_VIEW_MAX_SCORE;
  const percentage = Math.round((totalScore / maxScore) * 100);

  // Save game
  useEffect(() => {
    if (savedRef.current) return;
    savedRef.current = true;

    const perfectRounds = rounds.filter((r) => (r.score ?? 0) >= 4500).length;
    saveGame({
      gameMode: "street_view",
      score: totalScore,
      maxScore,
      correctCount: perfectRounds,
      totalCount: totalRounds,
      metadata: {
        difficulty,
        rounds: rounds.map((r) => ({
          countryCode: r.location.country_code,
          distanceKm: r.distanceKm,
          score: r.score,
        })),
      },
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handlePlayAgain = () => {
    reset();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-lg p-6"
    >
      <div className="mb-6 text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring" as const, delay: 0.2 }}
          className="mb-2 text-5xl font-bold"
        >
          {percentage >= 80 ? (
            <span className="text-green">S</span>
          ) : percentage >= 50 ? (
            <span className="text-green-light">B</span>
          ) : (
            <span className="text-slate-400">C</span>
          )}
        </motion.div>
        <h1 className="text-2xl font-bold text-white">
          {percentage >= 80 ? "Amazing!" : percentage >= 50 ? "Good job!" : "Keep exploring!"}
        </h1>
        <p className="mt-1 text-lg text-slate-400">
          <span className="font-bold text-green">{formatNumber(totalScore)}</span>
          <span className="text-slate-600">/{formatNumber(maxScore)}</span> points ({percentage}%)
        </p>
      </div>

      {/* Per-round breakdown */}
      <div className="mb-6 space-y-2">
        {rounds.map((round, i) => {
          const country = getCountryByCode(round.location.country_code);
          const score = round.score ?? 0;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.1 }}
              className="flex items-center gap-3 rounded-lg border border-white/5 bg-navy-card px-4 py-3"
            >
              <span className="text-sm font-bold text-slate-500 w-6">#{i + 1}</span>
              <span className="text-base">{country?.flag || "🏳️"}</span>
              <span className="flex-1 text-sm text-white font-medium">
                {country?.name || round.location.country_code}
              </span>
              <span className="text-xs text-slate-500">
                {formatNumber(round.distanceKm ?? 0)} km
              </span>
              <span className={cn(
                "rounded px-2 py-0.5 text-xs font-bold",
                score >= 4000 ? "bg-green/10 text-green" :
                score >= 2000 ? "bg-yellow-500/10 text-yellow-400" :
                "bg-wrong/10 text-wrong"
              )}>
                {formatNumber(score)}
              </span>
            </motion.div>
          );
        })}
      </div>

      <div className="space-y-3">
        <Button onClick={handlePlayAgain} className="w-full" size="lg">
          Play Again
        </Button>
        <Button onClick={handlePlayAgain} variant="ghost" className="w-full">
          Back to Menu
        </Button>
      </div>
    </motion.div>
  );
}

export default function StreetViewPage() {
  const { isPlaying, isFinished } = useStreetViewGame();

  if (isPlaying && !isFinished) {
    return <GameScreen />;
  }

  return (
    <AnimatePresence mode="wait">
      {!isPlaying && !isFinished && <StartScreen key="start" />}
      {isFinished && <ResultsScreen key="results" />}
    </AnimatePresence>
  );
}
