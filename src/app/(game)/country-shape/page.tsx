"use client";

import { useEffect, useCallback, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCountryShapeGame, QUIZ_CATEGORIES, type QuizCategory } from "@/hooks/useCountryShapeGame";
import { useGlobeStore } from "@/hooks/useGlobeStore";
import { CountryShape } from "@/components/game/CountryShape";
import { CountryInput } from "@/components/game/CountryInput";
import { ScoreDisplay } from "@/components/game/ScoreDisplay";
import { FeedbackOverlay } from "@/components/game/FeedbackOverlay";
import { ConfettiEffect } from "@/components/game/ConfettiEffect";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils/cn";

function StartScreen() {
  const startGame = useCountryShapeGame((s) => s.startGame);
  const [selectedCategory, setSelectedCategory] = useState<QuizCategory>("random");
  const [rounds, setRounds] = useState(10);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-lg"
    >
      <h1 className="mb-2 text-center text-3xl font-bold text-white">
        Country Shape Quiz
      </h1>
      <p className="mb-8 text-center text-slate-500">
        Can you name the country from its shape?
      </p>

      {/* Category Selection */}
      <div className="mb-6">
        <div className="mb-2 text-xs font-medium uppercase tracking-wider text-green/60">
          Category
        </div>
        <div className="grid grid-cols-2 gap-2">
          {QUIZ_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={cn(
                "rounded-lg border px-3 py-2.5 text-left transition-all",
                selectedCategory === cat.id
                  ? "border-green/40 bg-green/10 shadow-[0_0_12px_rgba(0,230,118,0.08)]"
                  : "border-white/5 bg-white/[0.02] hover:bg-white/5"
              )}
            >
              <div className={cn(
                "text-sm font-semibold",
                selectedCategory === cat.id ? "text-green" : "text-slate-300"
              )}>
                {cat.label}
              </div>
              <div className="text-xs text-slate-500">{cat.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Round Count */}
      <div className="mb-6">
        <div className="mb-2 text-xs font-medium uppercase tracking-wider text-green/60">
          Rounds
        </div>
        <div className="flex gap-2">
          {[10, 20, 50].map((n) => (
            <button
              key={n}
              onClick={() => setRounds(n)}
              className={cn(
                "flex-1 rounded-lg border py-2.5 text-sm font-semibold transition-all",
                rounds === n
                  ? "border-green/40 bg-green/10 text-green"
                  : "border-white/5 bg-white/[0.02] text-slate-400 hover:bg-white/5"
              )}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      {/* Start */}
      <Button
        onClick={() => startGame(rounds, selectedCategory)}
        size="lg"
        className="w-full"
      >
        Start Quiz
      </Button>
    </motion.div>
  );
}

function GameScreen() {
  const {
    currentRound,
    totalRounds,
    score,
    currentCountry,
    revealed,
    guesses,
    submitGuess,
    revealAnswer,
    nextRound,
  } = useCountryShapeGame();

  const { flyToCountry, highlightCountry, setAutoRotate } = useGlobeStore();

  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [confettiTrigger, setConfettiTrigger] = useState(0);
  const [shaking, setShaking] = useState(false);
  const feedbackTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Enter key advances to next country when answer is revealed
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Enter" && revealed) {
        nextRound();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [revealed, nextRound]);

  // Stop auto-rotation during game
  useEffect(() => {
    setAutoRotate(false);
    return () => setAutoRotate(true);
  }, [setAutoRotate]);

  // Fly to country immediately when it appears (before guessing)
  useEffect(() => {
    if (currentCountry && !revealed) {
      flyToCountry(currentCountry.lat, currentCountry.lng);
    }
  }, [currentCountry, revealed, flyToCountry]);

  const triggerFeedback = useCallback((type: "correct" | "wrong") => {
    setFeedback(type);
    if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
    feedbackTimerRef.current = setTimeout(() => setFeedback(null), 800);

    if (type === "correct") {
      setConfettiTrigger((c) => c + 1);
    } else {
      setShaking(true);
      setTimeout(() => setShaking(false), 500);
    }
  }, []);

  const handleGuess = useCallback(
    (guess: string) => {
      const isCorrect = submitGuess(guess);
      if (currentCountry) {
        highlightCountry(currentCountry.code, isCorrect ? "#00e676" : "#ff5252");
      }
      triggerFeedback(isCorrect ? "correct" : "wrong");
    },
    [submitGuess, currentCountry, highlightCountry, triggerFeedback]
  );

  const handleSkip = useCallback(() => {
    revealAnswer();
    if (currentCountry) {
      highlightCountry(currentCountry.code, "#ff5252");
    }
    triggerFeedback("wrong");
  }, [revealAnswer, currentCountry, highlightCountry, triggerFeedback]);

  if (!currentCountry) return null;

  const lastGuess = guesses[currentRound - 1];

  return (
    <div
      className={cn(
        "mx-auto max-w-lg transition-transform",
        shaking && "animate-[shake_0.4s_ease-in-out]"
      )}
    >
      <FeedbackOverlay type={feedback} />
      <ConfettiEffect trigger={confettiTrigger} />

      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="text-sm text-slate-500">
          Round{" "}
          <span className="font-bold text-white">
            {currentRound}/{totalRounds}
          </span>
        </div>
        <ScoreDisplay score={score} maxScore={totalRounds} />
      </div>

      {/* Progress dots */}
      <div className="mb-5 flex justify-center gap-1.5">
        {Array.from({ length: Math.min(totalRounds, 20) }, (_, i) => {
          const guess = guesses[i];
          const isCurrent = i === currentRound - 1;
          return (
            <div
              key={i}
              className={cn(
                "h-2.5 w-2.5 rounded-full transition-all",
                !guess
                  ? isCurrent
                    ? "bg-green scale-125 shadow-[0_0_8px_rgba(0,230,118,0.5)]"
                    : "bg-navy-lighter"
                  : guess.isCorrect
                    ? "bg-green"
                    : "bg-wrong"
              )}
            />
          );
        })}
      </div>

      {/* Shape Display */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentCountry.code}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.3 }}
          className="mb-5 flex justify-center"
        >
          <div
            className={cn(
              "rounded-2xl border bg-navy p-5 transition-all duration-300",
              revealed
                ? lastGuess?.isCorrect
                  ? "border-green/40 shadow-[0_0_30px_rgba(0,230,118,0.15)]"
                  : "border-wrong/40 shadow-[0_0_30px_rgba(255,82,82,0.15)]"
                : "border-green/10"
            )}
          >
            <CountryShape
              countryCode={currentCountry.code}
              revealed={revealed}
              isCorrect={lastGuess?.isCorrect}
              size={280}
            />
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Answer reveal */}
      <AnimatePresence>
        {revealed && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 text-center"
          >
            <span className="text-3xl">{currentCountry.flag}</span>
            <h2 className={cn(
              "text-2xl font-bold",
              lastGuess?.isCorrect ? "text-green" : "text-wrong"
            )}>
              {currentCountry.name}
            </h2>
            <p className="text-sm text-slate-500">
              {currentCountry.capital} &middot; {currentCountry.continent}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input or Next */}
      {!revealed ? (
        <div className="space-y-3">
          <CountryInput
            onSubmit={handleGuess}
            placeholder="Which country is this?"
          />
          <button
            onClick={handleSkip}
            className="w-full text-center text-sm text-slate-600 transition-colors hover:text-slate-400"
          >
            Skip this one
          </button>
        </div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Button onClick={nextRound} className="w-full" size="lg">
            {currentRound >= totalRounds ? "See Results" : "Next Country"}
          </Button>
        </motion.div>
      )}
    </div>
  );
}

function ResultsScreen() {
  const { score, totalRounds, guesses, resetGame } = useCountryShapeGame();
  const { reset: resetGlobe } = useGlobeStore();

  const percentage = Math.round((score / totalRounds) * 100);

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
      <div className="mb-8 text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring" as const, delay: 0.2 }}
          className="mb-3 text-5xl font-bold"
        >
          {percentage >= 80 ? (
            <span className="text-green">S</span>
          ) : percentage >= 50 ? (
            <span className="text-green-light">B</span>
          ) : (
            <span className="text-slate-400">C</span>
          )}
        </motion.div>
        <h1 className="text-3xl font-bold text-white">
          {percentage >= 80 ? "Amazing!" : percentage >= 50 ? "Good job!" : "Keep practicing!"}
        </h1>
        <p className="mt-2 text-lg text-slate-400">
          <span className="font-bold text-green">{score}/{totalRounds}</span> correct ({percentage}%)
        </p>
      </div>

      <div className="mb-6 max-h-[300px] space-y-2 overflow-y-auto pr-2">
        {guesses.map((g, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04 }}
            className={cn(
              "flex items-center gap-3 rounded-lg border p-3",
              g.isCorrect ? "border-green/20 bg-green/5" : "border-wrong/20 bg-wrong/5"
            )}
          >
            <span className="text-lg">{g.answer.flag}</span>
            <div className="flex-1">
              <div className="text-sm font-medium text-white">{g.answer.name}</div>
              {!g.isCorrect && g.guess !== "(skipped)" && (
                <div className="text-xs text-slate-600">Your guess: {g.guess}</div>
              )}
            </div>
            <span className={cn("text-lg font-bold", g.isCorrect ? "text-green" : "text-wrong")}>
              {g.isCorrect ? "✓" : "✗"}
            </span>
          </motion.div>
        ))}
      </div>

      <div className="space-y-3">
        <Button onClick={handlePlayAgain} className="w-full" size="lg">Play Again</Button>
        <Button onClick={handlePlayAgain} variant="ghost" className="w-full">Back to Menu</Button>
      </div>
    </motion.div>
  );
}

export default function CountryShapePage() {
  const { isPlaying, isFinished } = useCountryShapeGame();

  return (
    <AnimatePresence mode="wait">
      {!isPlaying && !isFinished && <StartScreen key="start" />}
      {isPlaying && !isFinished && <GameScreen key="game" />}
      {isFinished && <ResultsScreen key="results" />}
    </AnimatePresence>
  );
}
