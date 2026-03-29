"use client";

import { useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCountryShapeGame } from "@/hooks/useCountryShapeGame";
import { useGlobeStore } from "@/hooks/useGlobeStore";
import { CountryShape } from "@/components/game/CountryShape";
import { CountryInput } from "@/components/game/CountryInput";
import { ScoreDisplay } from "@/components/game/ScoreDisplay";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils/cn";

function StartScreen() {
  const startGame = useCountryShapeGame((s) => s.startGame);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-lg text-center"
    >
      <h1 className="mb-2 text-3xl font-bold text-white">
        Country Shape Quiz
      </h1>
      <p className="mb-10 text-slate-500">
        Identify countries by their silhouette. How many can you recognize?
      </p>

      <div className="space-y-3">
        <Button onClick={() => startGame(10)} size="lg" className="w-full">
          10 Rounds
        </Button>
        <Button
          onClick={() => startGame(20)}
          size="lg"
          variant="secondary"
          className="w-full"
        >
          20 Rounds
        </Button>
        <Button
          onClick={() => startGame(50)}
          size="lg"
          variant="ghost"
          className="w-full"
        >
          50 Rounds (Challenge)
        </Button>
      </div>
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
    submitGuess,
    revealAnswer,
    nextRound,
  } = useCountryShapeGame();

  const { flyToCountry, highlightCountry, setAutoRotate } = useGlobeStore();

  useEffect(() => {
    setAutoRotate(false);
    return () => setAutoRotate(true);
  }, [setAutoRotate]);

  const handleGuess = useCallback(
    (guess: string) => {
      const isCorrect = submitGuess(guess);
      if (currentCountry) {
        flyToCountry(currentCountry.lat, currentCountry.lng);
        highlightCountry(
          currentCountry.code,
          isCorrect ? "#00e676" : "#ff5252"
        );
      }
    },
    [submitGuess, currentCountry, flyToCountry, highlightCountry]
  );

  const handleSkip = useCallback(() => {
    revealAnswer();
    if (currentCountry) {
      flyToCountry(currentCountry.lat, currentCountry.lng);
      highlightCountry(currentCountry.code, "#ff5252");
    }
  }, [revealAnswer, currentCountry, flyToCountry, highlightCountry]);

  if (!currentCountry) return null;

  return (
    <div className="mx-auto max-w-lg">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="text-sm text-slate-500">
          Round{" "}
          <span className="font-bold text-white">
            {currentRound}/{totalRounds}
          </span>
        </div>
        <ScoreDisplay score={score} maxScore={totalRounds} />
        <div className="flex gap-1">
          {Array.from({ length: Math.min(totalRounds, 20) }, (_, i) => {
            const guesses = useCountryShapeGame.getState().guesses;
            const guess = guesses[i];
            return (
              <div
                key={i}
                className={cn(
                  "h-2 w-2 rounded-full",
                  !guess
                    ? i === currentRound - 1
                      ? "bg-green animate-pulse"
                      : "bg-navy-lighter"
                    : guess.isCorrect
                      ? "bg-green"
                      : "bg-wrong"
                )}
              />
            );
          })}
        </div>
      </div>

      {/* Shape Display */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentCountry.code}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="mb-6 flex justify-center"
        >
          <div className="rounded-2xl border border-green/10 bg-navy p-6">
            <CountryShape
              countryCode={currentCountry.code}
              revealed={revealed}
              isCorrect={
                useCountryShapeGame.getState().guesses[currentRound - 1]
                  ?.isCorrect
              }
              size={260}
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
            <span className="text-2xl">{currentCountry.flag}</span>
            <h2 className="text-xl font-bold text-white">
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
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
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
          className="mb-4 text-5xl font-bold"
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
          {percentage >= 80
            ? "Amazing!"
            : percentage >= 50
              ? "Good job!"
              : "Keep practicing!"}
        </h1>
        <p className="mt-2 text-lg text-slate-400">
          You got{" "}
          <span className="font-bold text-green">
            {score}/{totalRounds}
          </span>{" "}
          correct ({percentage}%)
        </p>
      </div>

      {/* Results list */}
      <div className="mb-6 max-h-[300px] space-y-2 overflow-y-auto pr-2">
        {guesses.map((g, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className={cn(
              "flex items-center gap-3 rounded-lg border p-3",
              g.isCorrect
                ? "border-green/20 bg-green/5"
                : "border-wrong/20 bg-wrong/5"
            )}
          >
            <span className="text-lg">{g.answer.flag}</span>
            <div className="flex-1">
              <div className="text-sm font-medium text-white">
                {g.answer.name}
              </div>
              {!g.isCorrect && g.guess !== "(skipped)" && (
                <div className="text-xs text-slate-600">
                  Your guess: {g.guess}
                </div>
              )}
            </div>
            <span className={g.isCorrect ? "text-green" : "text-wrong"}>
              {g.isCorrect ? "✓" : "✗"}
            </span>
          </motion.div>
        ))}
      </div>

      <div className="space-y-3">
        <Button onClick={handlePlayAgain} className="w-full" size="lg">
          Play Again
        </Button>
        <Button
          onClick={() => {
            resetGlobe();
            resetGame();
          }}
          variant="ghost"
          className="w-full"
        >
          Back to Menu
        </Button>
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
