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
// Country Card
// ---------------------------------------------------------------------------
function CountryCard({
  country,
  showPopulation,
  highlight,
  animatePopulation,
}: {
  country: { flag: string; name: string; population: number };
  showPopulation: boolean;
  highlight?: "correct" | "wrong" | null;
  animatePopulation?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border bg-navy p-5 text-center transition-colors duration-300",
        highlight === "correct"
          ? "border-green/40 shadow-[0_0_20px_rgba(0,230,118,0.1)]"
          : highlight === "wrong"
            ? "border-wrong/40 shadow-[0_0_20px_rgba(255,82,82,0.1)]"
            : "border-green/10"
      )}
    >
      <div className="mb-2 text-4xl">{country.flag}</div>
      <h2 className="mb-1 text-lg font-bold text-white">{country.name}</h2>
      <div className="text-[10px] uppercase tracking-widest text-slate-500">Population</div>
      <div className="mt-1 text-xl font-bold">
        {showPopulation ? (
          <span className={highlight === "correct" ? "text-green" : highlight === "wrong" ? "text-wrong" : "text-green"}>
            {animatePopulation ? <AnimatedCounter target={country.population} /> : formatNumber(country.population)}
          </span>
        ) : (
          <span className="text-3xl text-slate-600">?</span>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// GameScreen — Vertical conveyor belt layout
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

  // Keyboard controls: Arrow Up = Higher, Arrow Down = Lower, Enter = Next
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (revealed) {
        if (e.key === "Enter" || e.key === "ArrowUp" || e.key === "ArrowDown") nextPair();
        return;
      }
      if (e.key === "ArrowUp") submitGuess("higher");
      if (e.key === "ArrowDown") submitGuess("lower");
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [revealed, nextPair, submitGuess]);

  if (!countryA || !countryB) return null;

  const isFinished = usePopulationGame.getState().isFinished;

  return (
    <div className="mx-auto max-w-sm">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        {mode === "streak" ? (
          <div className="text-sm text-slate-500">
            Streak <span className="font-bold text-green">{streak}</span>
          </div>
        ) : (
          <div className="text-sm text-slate-500">
            Round <span className="font-bold text-white">{currentRound}/{totalRounds}</span>
          </div>
        )}
        <div className="text-sm text-slate-500">
          Score <span className="font-bold text-green">{score}</span>
        </div>
      </div>

      {/* Vertical card stack — tap the country you think has more people */}
      <div className="space-y-3">
        {/* Top: Country A (known population) — tap = A has more = B is lower */}
        <AnimatePresence mode="popLayout">
          <motion.div
            key={`a-${countryA.code}`}
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            transition={{ type: "spring", damping: 20, stiffness: 200 }}
          >
            <button
              onClick={() => !revealed && submitGuess("lower")}
              disabled={revealed}
              className={cn("w-full text-left transition-transform", !revealed && "hover:scale-[1.02] active:scale-[0.98] cursor-pointer")}
            >
              <CountryCard country={countryA} showPopulation />
            </button>
          </motion.div>
        </AnimatePresence>

        {/* VS divider + streak badge */}
        <div className="flex items-center justify-center gap-3">
          <div className="h-px flex-1 bg-white/5" />
          <span className="text-[10px] font-medium text-slate-600">{revealed ? "" : "tap who has more"}</span>
          {mode === "streak" && streak > 0 && (
            <span className="rounded-full bg-green/10 border border-green/20 px-2 py-0.5 text-xs font-bold text-green">
              {streak}
            </span>
          )}
          <div className="h-px flex-1 bg-white/5" />
        </div>

        {/* Bottom: Country B (unknown population) — tap = B has more = B is higher */}
        <AnimatePresence mode="popLayout">
          <motion.div
            key={`b-${countryB.code}`}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            transition={{ type: "spring", damping: 20, stiffness: 200 }}
          >
            <button
              onClick={() => !revealed && submitGuess("higher")}
              disabled={revealed}
              className={cn("w-full text-left transition-transform", !revealed && "hover:scale-[1.02] active:scale-[0.98] cursor-pointer")}
            >
              <CountryCard
                country={countryB}
                showPopulation={revealed}
                highlight={revealed ? (lastAnswerCorrect ? "correct" : "wrong") : null}
                animatePopulation={revealed}
              />
            </button>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Next / feedback when revealed */}
      {revealed && !isFinished && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-5">
          <div className="mb-3 text-center">
            <span className={cn("text-lg font-bold", lastAnswerCorrect ? "text-green" : "text-wrong")}>
              {lastAnswerCorrect ? "Correct!" : "Wrong!"}
            </span>
          </div>
          <Button onClick={nextPair} size="lg" className="w-full">
            Next
          </Button>
        </motion.div>
      )}

      {/* Keyboard hint */}
      {!revealed && (
        <div className="mt-4 text-center text-[10px] text-slate-600">
          Tap a country or use ↑↓ arrow keys
        </div>
      )}
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
