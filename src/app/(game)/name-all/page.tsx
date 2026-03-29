"use client";

import { useEffect, useCallback, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNameAllGame, NAME_ALL_CATEGORIES, type NameAllCategory } from "@/hooks/useNameAllGame";
import { useGlobeStore } from "@/hooks/useGlobeStore";
import { useCountdown } from "@/hooks/useCountdown";
import { GameTimer } from "@/components/game/GameTimer";
import { FeedbackOverlay } from "@/components/game/FeedbackOverlay";
import { ConfettiEffect } from "@/components/game/ConfettiEffect";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils/cn";
import { formatNumber } from "@/lib/utils/formatters";

function StartScreen() {
  const startGame = useNameAllGame((s) => s.startGame);
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
        onClick={() => startGame(timeMinutes, category)}
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

  const [inputValue, setInputValue] = useState("");
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [confettiTrigger, setConfettiTrigger] = useState(0);
  const [alreadyMsg, setAlreadyMsg] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const feedbackTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Start timer and stop globe spin
  useEffect(() => {
    start();
    setAutoRotate(false);
    return () => setAutoRotate(true);
  }, [start, setAutoRotate]);

  // End game when timer expires
  useEffect(() => {
    if (isExpired) endGame();
  }, [isExpired, endGame]);

  // Focus input
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const clearFeedback = useCallback(() => {
    if (feedbackTimer.current) clearTimeout(feedbackTimer.current);
    feedbackTimer.current = setTimeout(() => {
      setFeedback(null);
      setAlreadyMsg(false);
    }, 600);
  }, []);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const value = inputValue.trim();
      if (!value) return;

      const result = submitGuess(value);
      setInputValue("");

      if (result.matched) {
        // Correct!
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
      inputRef.current?.focus();
    },
    [inputValue, submitGuess, highlightCountry, flyToCountry, clearFeedback]
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

      {/* Input */}
      <form onSubmit={handleSubmit} className="mb-4">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Type a country name..."
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          className={cn(
            "w-full rounded-xl border bg-navy px-4 py-3 text-lg text-white",
            "placeholder:text-slate-600 transition-all",
            "focus:shadow-[0_0_15px_rgba(0,230,118,0.1)]",
            feedback === "correct"
              ? "border-green/50"
              : feedback === "wrong"
                ? "border-wrong/50"
                : "border-green/20 focus:border-green"
          )}
        />
      </form>

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
  const { pool, namedCodes, resetGame } = useNameAllGame();
  const { reset: resetGlobe } = useGlobeStore();

  const named = pool.filter((c) => namedCodes.has(c.code));
  const missed = pool.filter((c) => !namedCodes.has(c.code));
  const percentage = Math.round((named.length / pool.length) * 100);

  const [showTab, setShowTab] = useState<"named" | "missed">("missed");

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
            <motion.div
              key={c.code}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: Math.min(i * 0.02, 0.5) }}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-3 py-2",
                showTab === "named"
                  ? "bg-green/5 border border-green/10"
                  : "bg-wrong/5 border border-wrong/10"
              )}
            >
              <span className="text-base">{c.flag}</span>
              <span className="flex-1 text-sm text-white">{c.name}</span>
              <span className="text-xs text-slate-600">{c.continent}</span>
            </motion.div>
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
