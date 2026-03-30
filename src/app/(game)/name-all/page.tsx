"use client";

import { useEffect, useCallback, useState, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNameAllGame, NAME_ALL_CATEGORIES, type NameAllCategory } from "@/application/useNameAll";
import { useGlobeStore } from "@/application/useGlobe";
import { useGameSave } from "@/application/useGameSave";
import { useCountdown } from "@/hooks/useCountdown";
import { GameTimer } from "@/presentation/game/GameTimer";
import { CountryInput } from "@/presentation/game/CountryInput";
import { FeedbackOverlay } from "@/presentation/game/FeedbackOverlay";
import { ConfettiEffect } from "@/presentation/game/ConfettiEffect";
import { Button } from "@/presentation/ui/Button";
import { cn } from "@/lib/utils/cn";
import { formatNumber } from "@/lib/utils/formatters";

function StartScreen() {
  const startGame = useNameAllGame((s) => s.startGame);
  const resetGlobe = useGlobeStore((s) => s.reset);
  const [category, setCategory] = useState<NameAllCategory>("all");
  const [timeMinutes, setTimeMinutes] = useState(10);

  const selectedCat = NAME_ALL_CATEGORIES.find((c) => c.id === category)!;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-lg"
    >
      <h1 className="mb-2 text-center text-3xl font-bold text-white">
        Name All Countries
      </h1>
      <p className="mb-8 text-center text-slate-500">
        Type as many countries as you can before time runs out
      </p>

      {/* Category */}
      <div className="mb-6">
        <div className="mb-2 text-xs font-medium uppercase tracking-wider text-green/60">
          Region
        </div>
        <div className="grid grid-cols-2 gap-2">
          {NAME_ALL_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              className={cn(
                "rounded-lg border px-3 py-2.5 text-left transition-all",
                category === cat.id
                  ? "border-green/40 bg-green/10"
                  : "border-white/5 bg-white/[0.02] hover:bg-white/5"
              )}
            >
              <div className={cn(
                "text-sm font-semibold",
                category === cat.id ? "text-green" : "text-slate-300"
              )}>
                {cat.label}
              </div>
              <div className="text-xs text-slate-500">{cat.count} countries</div>
            </button>
          ))}
        </div>
      </div>

      {/* Timer */}
      <div className="mb-6">
        <div className="mb-2 text-xs font-medium uppercase tracking-wider text-green/60">
          Time Limit
        </div>
        <div className="flex gap-2">
          {[5, 10, 15, 20].map((m) => (
            <button
              key={m}
              onClick={() => setTimeMinutes(m)}
              className={cn(
                "flex-1 rounded-lg border py-2.5 text-sm font-semibold transition-all",
                timeMinutes === m
                  ? "border-green/40 bg-green/10 text-green"
                  : "border-white/5 bg-white/[0.02] text-slate-400 hover:bg-white/5"
              )}
            >
              {m} min
            </button>
          ))}
        </div>
      </div>

      <Button
        onClick={() => { resetGlobe(); startGame(timeMinutes, category); }}
        size="lg"
        className="w-full"
      >
        Start — {selectedCat.count} countries
      </Button>
    </motion.div>
  );
}

function GameScreen() {
  const {
    pool,
    namedCodes,
    lastNamed,
    wrongGuess,
    submitGuess,
    endGame,
    timeLimitSeconds,
  } = useNameAllGame();

  const { highlightCountry, flyToCountry, setAutoRotate } = useGlobeStore();
  const { timeLeft, isExpired, start } = useCountdown(timeLimitSeconds);

  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [confettiTrigger, setConfettiTrigger] = useState(0);
  const [alreadyMsg, setAlreadyMsg] = useState(false);
  const feedbackTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Start timer and stop globe spin
  useEffect(() => {
    start();
    setAutoRotate(false);
    return () => setAutoRotate(true);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // End game when timer expires
  useEffect(() => {
    if (isExpired) endGame();
  }, [isExpired, endGame]);

  const clearFeedback = useCallback(() => {
    if (feedbackTimer.current) clearTimeout(feedbackTimer.current);
    feedbackTimer.current = setTimeout(() => {
      setFeedback(null);
      setAlreadyMsg(false);
    }, 600);
  }, []);

  const handleGuess = useCallback(
    (value: string) => {
      const result = submitGuess(value);

      if (result.matched) {
        highlightCountry(result.matched.code, "#00e676");
        flyToCountry(result.matched.lat, result.matched.lng);
        setFeedback("correct");
        setConfettiTrigger((c) => c + 1);
        setAlreadyMsg(false);
      } else if (result.alreadyNamed) {
        setAlreadyMsg(true);
        setFeedback(null);
      } else {
        setFeedback("wrong");
        setAlreadyMsg(false);
      }

      clearFeedback();
    },
    [submitGuess, highlightCountry, flyToCountry, clearFeedback]
  );

  const named = namedCodes.size;
  const total = pool.length;
  const progress = total > 0 ? (named / total) * 100 : 0;

  return (
    <div className="mx-auto max-w-lg">
      <FeedbackOverlay type={feedback} />
      <ConfettiEffect trigger={confettiTrigger} />

      {/* Header: timer + progress */}
      <div className="mb-4 flex items-center justify-between">
        <GameTimer timeLeft={timeLeft} />
        <div className="text-right">
          <div className="text-xs font-medium uppercase tracking-wider text-green/60">
            Named
          </div>
          <div className="text-2xl font-bold tabular-nums text-white">
            {named}<span className="text-lg text-slate-500">/{total}</span>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-5 h-2 overflow-hidden rounded-full bg-navy-lighter">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-green-dark to-green"
          animate={{ width: `${progress}%` }}
          transition={{ type: "spring" as const, damping: 20, stiffness: 100 }}
        />
      </div>

      {/* Input with autocomplete */}
      <div className="mb-4">
        <CountryInput
          onSubmit={handleGuess}
          placeholder="Type a country name..."
          excludeCodes={Array.from(namedCodes)}
        />
      </div>

      {/* Status message */}
      <div className="mb-4 h-8 text-center text-sm">
        <AnimatePresence mode="wait">
          {lastNamed && feedback === "correct" && (
            <motion.div
              key={`correct-${lastNamed.code}`}
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-green font-medium"
            >
              {lastNamed.flag} {lastNamed.name} ✓
            </motion.div>
          )}
          {wrongGuess && feedback === "wrong" && (
            <motion.div
              key={`wrong-${wrongGuess}`}
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-wrong"
            >
              Not a country
            </motion.div>
          )}
          {alreadyMsg && (
            <motion.div
              key="already"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-slate-500"
            >
              Already named!
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Give up */}
      <button
        onClick={endGame}
        className="w-full text-center text-sm text-slate-600 transition-colors hover:text-slate-400"
      >
        Give up
      </button>
    </div>
  );
}

function ResultsScreen() {
  const { pool, namedCodes, resetGame, category, timeLimitSeconds, startedAt } = useNameAllGame();
  const { reset: resetGlobe, highlightCountry, flyToCountry } = useGlobeStore();
  const { saveGame } = useGameSave();

  const named = pool.filter((c) => namedCodes.has(c.code));
  const missed = pool.filter((c) => !namedCodes.has(c.code));
  const percentage = Math.round((named.length / pool.length) * 100);
  const elapsedSeconds = startedAt ? Math.round((Date.now() - startedAt) / 1000) : timeLimitSeconds;

  const [showTab, setShowTab] = useState<"named" | "missed">("missed");

  // Highlight missed and save game
  useEffect(() => {
    missed.forEach((c) => highlightCountry(c.code, "#ff5252"));
    saveGame({
      gameMode: "name_all",
      score: named.length,
      maxScore: pool.length,
      correctCount: named.length,
      totalCount: pool.length,
      timeSeconds: elapsedSeconds,
      metadata: { category, named: named.map(c => c.code), elapsedSeconds },
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handlePlayAgain = () => {
    resetGlobe();
    resetGame();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-lg"
    >
      <div className="mb-6 text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring" as const, delay: 0.2 }}
          className="mb-2 text-4xl font-bold"
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
          {named.length === pool.length
            ? "Perfect!"
            : percentage >= 80
              ? "Amazing!"
              : percentage >= 50
                ? "Good job!"
                : "Keep practicing!"}
        </h1>
        <p className="mt-1 text-lg text-slate-400">
          <span className="font-bold text-green">{named.length}/{pool.length}</span> countries ({percentage}%)
        </p>
      </div>

      {/* Tabs */}
      <div className="mb-4 flex rounded-lg border border-white/5 bg-navy p-1">
        <button
          onClick={() => setShowTab("missed")}
          className={cn(
            "flex-1 rounded-md py-2 text-sm font-medium transition-all",
            showTab === "missed"
              ? "bg-wrong/10 text-wrong"
              : "text-slate-500 hover:text-slate-300"
          )}
        >
          Missed ({missed.length})
        </button>
        <button
          onClick={() => setShowTab("named")}
          className={cn(
            "flex-1 rounded-md py-2 text-sm font-medium transition-all",
            showTab === "named"
              ? "bg-green/10 text-green"
              : "text-slate-500 hover:text-slate-300"
          )}
        >
          Named ({named.length})
        </button>
      </div>

      {/* Country list */}
      <div className="mb-6 max-h-[300px] space-y-1 overflow-y-auto pr-2">
        {(showTab === "named" ? named : missed)
          .sort((a, b) => a.name.localeCompare(b.name))
          .map((c, i) => (
            <motion.button
              key={c.code}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: Math.min(i * 0.02, 0.5) }}
              onClick={() => flyToCountry(c.lat, c.lng)}
              className={cn(
                "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left transition-colors",
                showTab === "named"
                  ? "bg-green/5 border border-green/10 hover:bg-green/10"
                  : "bg-wrong/5 border border-wrong/10 hover:bg-wrong/10",
                "cursor-pointer"
              )}
            >
              <span className="text-base">{c.flag}</span>
              <span className="flex-1 text-sm text-white">{c.name}</span>
              <span className="text-xs text-slate-600">{c.continent}</span>
              <svg className="h-3.5 w-3.5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </motion.button>
          ))}
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

export default function NameAllPage() {
  const { isPlaying, isFinished } = useNameAllGame();

  return (
    <AnimatePresence mode="wait">
      {!isPlaying && !isFinished && <StartScreen key="start" />}
      {isPlaying && !isFinished && <GameScreen key="game" />}
      {isFinished && <ResultsScreen key="results" />}
    </AnimatePresence>
  );
}
