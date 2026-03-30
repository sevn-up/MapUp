"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePopulationGame } from "@/application/usePopulationGame";
import { useGameSave } from "@/application/useGameSave";
import { formatNumber } from "@/lib/utils/formatters";
import { Button } from "@/presentation/ui/Button";
import { cn } from "@/lib/utils/cn";

// ---------------------------------------------------------------------------
// AnimatedCounter — counts from 0 to target over ~1s
// ---------------------------------------------------------------------------
function AnimatedCounter({ target }: { target: number }) {
  const [display, setDisplay] = useState(0);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    const duration = 1000; // ms
    const start = performance.now();

    function tick(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out quad
      const eased = 1 - (1 - progress) * (1 - progress);
      setDisplay(Math.round(eased * target));
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(tick);
      }
    }

    frameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameRef.current);
  }, [target]);

  return <>{formatNumber(display)}</>;
}

// ---------------------------------------------------------------------------
// StartScreen
// ---------------------------------------------------------------------------
function StartScreen() {
  const startGame = usePopulationGame((s) => s.startGame);
  const [mode, setMode] = useState<"streak" | "rounds">("streak");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-lg"
    >
      <h1 className="mb-2 text-center text-3xl font-bold text-white">
        Population Challenge
      </h1>
      <p className="mb-8 text-center text-slate-500">
        Higher or Lower — can you guess which country has more people?
      </p>

      {/* Mode toggle */}
      <div className="mb-6">
        <div className="mb-2 text-xs font-medium uppercase tracking-wider text-green/60">
          Mode
        </div>
        <div className="flex gap-2">
          {(["streak", "rounds"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={cn(
                "flex-1 rounded-lg border py-2.5 text-sm font-semibold transition-all",
                mode === m
                  ? "border-green/40 bg-green/10 text-green"
                  : "border-white/5 bg-white/[0.02] text-slate-400 hover:bg-white/5"
              )}
            >
              {m === "streak" ? "Streak" : "20 Rounds"}
            </button>
          ))}
        </div>
      </div>

      <Button
        onClick={() => startGame(mode, mode === "rounds" ? 20 : undefined)}
        size="lg"
        className="w-full"
      >
        Start Game
      </Button>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// GameScreen
// ---------------------------------------------------------------------------
function GameScreen() {
  const {
    mode,
    currentRound,
    totalRounds,
    streak,
    score,
    countryA,
    countryB,
    revealed,
    lastAnswerCorrect,
    submitGuess,
    nextPair,
  } = usePopulationGame();

  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const feedbackTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Enter key advances when revealed
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Enter" && revealed) nextPair();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [revealed, nextPair]);

  const handleGuess = (answer: "higher" | "lower") => {
    const correct = submitGuess(answer);
    setFeedback(correct ? "correct" : "wrong");
    if (feedbackTimer.current) clearTimeout(feedbackTimer.current);
    feedbackTimer.current = setTimeout(() => setFeedback(null), 1200);
  };

  if (!countryA || !countryB) return null;

  return (
    <div className="mx-auto max-w-3xl">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        {mode === "streak" ? (
          <div className="text-sm text-slate-500">
            Streak{" "}
            <span className="font-bold text-green">{streak}</span>
          </div>
        ) : (
          <div className="text-sm text-slate-500">
            Round{" "}
            <span className="font-bold text-white">
              {currentRound}/{totalRounds}
            </span>
          </div>
        )}
        <div className="text-sm text-slate-500">
          Score <span className="font-bold text-green">{score}</span>
        </div>
      </div>

      {/* Progress bar (rounds mode only) */}
      {mode === "rounds" && (
        <div className="mb-5">
          <div className="h-2 overflow-hidden rounded-full bg-navy-lighter">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-green-dark to-green"
              animate={{
                width: `${((currentRound - 1) / totalRounds) * 100}%`,
              }}
              transition={{ type: "spring", damping: 20, stiffness: 100 }}
            />
          </div>
        </div>
      )}

      {/* Two-card layout */}
      <div className="flex flex-col gap-4 md:flex-row">
        {/* Country A — always revealed */}
        <motion.div
          key={countryA.code}
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex-1 rounded-2xl border border-green/10 bg-navy p-6 text-center"
        >
          <div className="mb-3 text-5xl">{countryA.flag}</div>
          <h2 className="mb-1 text-xl font-bold text-white">{countryA.name}</h2>
          <div className="text-xs uppercase tracking-wider text-slate-500">
            Population
          </div>
          <div className="mt-1 text-2xl font-bold text-green">
            {formatNumber(countryA.population)}
          </div>
        </motion.div>

        {/* VS divider */}
        <div className="flex items-center justify-center">
          <span className="text-lg font-bold text-slate-600">VS</span>
        </div>

        {/* Country B — revealed on guess */}
        <motion.div
          key={countryB.code}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          className={cn(
            "flex-1 rounded-2xl border bg-navy p-6 text-center transition-colors duration-300",
            revealed
              ? lastAnswerCorrect
                ? "border-green/40 shadow-[0_0_30px_rgba(0,230,118,0.15)]"
                : "border-wrong/40 shadow-[0_0_30px_rgba(255,82,82,0.15)]"
              : "border-green/10"
          )}
        >
          <div className="mb-3 text-5xl">{countryB.flag}</div>
          <h2 className="mb-1 text-xl font-bold text-white">{countryB.name}</h2>
          <div className="text-xs uppercase tracking-wider text-slate-500">
            Population
          </div>
          <div className="mt-1 text-2xl font-bold text-white">
            {revealed ? (
              <span className={lastAnswerCorrect ? "text-green" : "text-wrong"}>
                <AnimatedCounter target={countryB.population} />
              </span>
            ) : (
              <span className="text-slate-600">?</span>
            )}
          </div>

          {/* Guess buttons */}
          {!revealed && (
            <div className="mt-4 flex gap-3">
              <Button
                onClick={() => handleGuess("higher")}
                variant="secondary"
                className="flex-1"
              >
                Higher
              </Button>
              <Button
                onClick={() => handleGuess("lower")}
                variant="secondary"
                className="flex-1"
              >
                Lower
              </Button>
            </div>
          )}
        </motion.div>
      </div>

      {/* Feedback flash */}
      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="mt-4 text-center"
          >
            <span
              className={cn(
                "text-lg font-bold",
                feedback === "correct" ? "text-green" : "text-wrong"
              )}
            >
              {feedback === "correct" ? "Correct!" : "Wrong!"}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Streak callout (streak mode, while playing) */}
      {mode === "streak" && revealed && lastAnswerCorrect && streak > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2 text-center text-2xl font-bold text-green"
        >
          Streak: {streak}
        </motion.div>
      )}

      {/* Next button */}
      <AnimatePresence>
        {revealed && !usePopulationGame.getState().isFinished && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6"
          >
            <Button onClick={nextPair} size="lg" className="w-full">
              {mode === "rounds" && currentRound >= totalRounds
                ? "See Results"
                : "Next"}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ---------------------------------------------------------------------------
// ResultsScreen
// ---------------------------------------------------------------------------
function ResultsScreen() {
  const { mode, score, streak, currentRound, resetGame, startGame } =
    usePopulationGame();
  const { saveGame } = useGameSave();

  // Best streak tracking via localStorage
  const [bestStreak, setBestStreak] = useState(0);
  const isNewBest = mode === "streak" && score > 0 && score >= bestStreak;

  useEffect(() => {
    const stored = localStorage.getItem("population_best_streak");
    const prev = stored ? parseInt(stored, 10) : 0;
    setBestStreak(prev);

    const finalStreak = mode === "streak" ? score : streak;

    if (finalStreak > prev) {
      localStorage.setItem("population_best_streak", String(finalStreak));
      setBestStreak(finalStreak);
    }

    saveGame({
      gameMode: "population",
      score,
      maxScore: mode === "rounds" ? 20 : score,
      correctCount: score,
      totalCount: mode === "rounds" ? 20 : score + 1, // streak ends on wrong answer
      metadata: {
        mode,
        streak: mode === "streak" ? score : streak,
        roundsCompleted: currentRound,
      },
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handlePlayAgain = () => {
    startGame(mode, mode === "rounds" ? 20 : undefined);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-lg text-center"
    >
      {/* Score headline */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", delay: 0.2 }}
        className="mb-2 text-5xl font-bold text-green"
      >
        {score}
      </motion.div>

      <h1 className="mb-1 text-3xl font-bold text-white">
        {mode === "streak" ? "Game Over" : "Results"}
      </h1>

      <p className="mb-4 text-lg text-slate-400">
        {mode === "streak"
          ? `You reached a streak of ${score}`
          : `${score}/20 correct`}
      </p>

      {/* Best Streak badge */}
      {isNewBest && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", delay: 0.4 }}
          className="mb-6 inline-block rounded-full border border-green/30 bg-green/10 px-4 py-1.5 text-sm font-semibold text-green"
        >
          Best Streak!
        </motion.div>
      )}

      <div className="mt-6 space-y-3">
        <Button onClick={handlePlayAgain} size="lg" className="w-full">
          Play Again
        </Button>
        <Button onClick={resetGame} variant="ghost" className="w-full">
          Back to Menu
        </Button>
      </div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Page root
// ---------------------------------------------------------------------------
export default function PopulationPage() {
  const { isPlaying, isFinished } = usePopulationGame();

  return (
    <AnimatePresence mode="wait">
      {!isPlaying && !isFinished && <StartScreen key="start" />}
      {isPlaying && !isFinished && <GameScreen key="game" />}
      {isFinished && <ResultsScreen key="results" />}
    </AnimatePresence>
  );
}
