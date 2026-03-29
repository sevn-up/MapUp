"use client";

import { useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useWorldle, generateShareText } from "@/application/useWorldle";
import { useGlobeStore } from "@/application/useGlobe";
import { useGameFeedback } from "@/hooks/useGameFeedback";
import { getCountryByName } from "@/domain/countries";
import { CountryShape } from "@/presentation/game/CountryShape";
import { CountryInput } from "@/presentation/game/CountryInput";
import { DistanceHint } from "@/presentation/game/DistanceHint";
import { FeedbackOverlay } from "@/presentation/game/FeedbackOverlay";
import { ConfettiEffect } from "@/presentation/game/ConfettiEffect";
import { Button } from "@/presentation/ui/Button";
import { cn } from "@/lib/utils/cn";

function StartScreen() {
  const { startDaily, startPractice } = useWorldle();
  const resetGlobe = useGlobeStore((s) => s.reset);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-lg text-center"
    >
      <h1 className="mb-2 text-3xl font-bold text-white">Worldle</h1>
      <p className="mb-8 text-slate-500">
        Guess the country in 6 tries. After each guess, see how close you are.
      </p>

      <div className="space-y-3">
        <Button
          onClick={() => { resetGlobe(); startDaily(); }}
          size="lg"
          className="w-full"
        >
          Daily Challenge
        </Button>
        <Button
          onClick={() => { resetGlobe(); startPractice(); }}
          size="lg"
          variant="secondary"
          className="w-full"
        >
          Practice Mode
        </Button>
      </div>
    </motion.div>
  );
}

function GameScreen() {
  const {
    targetCountry,
    guesses,
    maxGuesses,
    isFinished,
    isWon,
    submitGuess,
  } = useWorldle();

  const { setAutoRotate } = useGlobeStore();
  const { feedback, confettiTrigger, shaking, onCorrect, onWrong } = useGameFeedback();

  useEffect(() => {
    setAutoRotate(false);
    return () => setAutoRotate(true);
  }, [setAutoRotate]);

  const handleGuess = useCallback(
    (name: string) => {
      const country = getCountryByName(name);
      if (!country) return;

      const guess = submitGuess(country.code);
      if (!guess) return;

      if (guess.isCorrect) {
        onCorrect(guess.country);
      } else {
        onWrong(guess.country);
      }
    },
    [submitGuess, onCorrect, onWrong]
  );

  if (!targetCountry) return null;

  const guessedCodes = guesses.map((g) => g.country.code);
  const remaining = maxGuesses - guesses.length;

  return (
    <div className={cn("mx-auto max-w-lg", shaking && "animate-[shake_0.4s_ease-in-out]")}>
      <FeedbackOverlay type={feedback} />
      <ConfettiEffect trigger={confettiTrigger} />

      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold text-white">Worldle</h2>
        <div className="text-sm text-slate-400">
          <span className="font-bold text-white">{guesses.length}</span>/{maxGuesses} guesses
        </div>
      </div>

      {/* Country silhouette hint */}
      <div className="mb-5 flex justify-center">
        <div className="rounded-2xl border border-green/10 bg-navy p-4">
          <CountryShape
            countryCode={targetCountry.code}
            revealed={isFinished}
            isCorrect={isWon}
            size={200}
          />
        </div>
      </div>

      {/* Guess history */}
      <div className="mb-4 space-y-2">
        {guesses.map((g, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <DistanceHint
              result={g.result}
              countryName={g.country.name}
              countryFlag={g.country.flag}
            />
          </motion.div>
        ))}

        {/* Empty slots */}
        {!isFinished &&
          Array.from({ length: remaining }, (_, i) => (
            <div
              key={`empty-${i}`}
              className="h-12 rounded-lg border border-dashed border-white/5"
            />
          ))}
      </div>

      {/* Input or Result */}
      {!isFinished ? (
        <CountryInput
          onSubmit={handleGuess}
          placeholder={`Guess ${guesses.length + 1} of ${maxGuesses}...`}
          excludeCodes={guessedCodes}
        />
      ) : (
        <ResultBanner />
      )}
    </div>
  );
}

function ResultBanner() {
  const { targetCountry, guesses, isWon, reset } = useWorldle();
  const { reset: resetGlobe } = useGlobeStore();

  if (!targetCountry) return null;

  const shareText = generateShareText(guesses, isWon);

  const handleCopy = () => {
    navigator.clipboard.writeText(shareText);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div className={cn(
        "rounded-xl border p-4 text-center",
        isWon ? "border-green/30 bg-green/5" : "border-wrong/30 bg-wrong/5"
      )}>
        <span className="text-3xl">{targetCountry.flag}</span>
        <h3 className={cn("text-xl font-bold", isWon ? "text-green" : "text-wrong")}>
          {targetCountry.name}
        </h3>
        <p className="text-sm text-slate-500">
          {targetCountry.capital} &middot; {targetCountry.continent}
        </p>
        {isWon && (
          <p className="mt-2 text-sm text-green">
            Got it in {guesses.length}!
          </p>
        )}
      </div>

      <div className="flex gap-2">
        <Button onClick={handleCopy} variant="secondary" className="flex-1">
          Share Result
        </Button>
        <Button
          onClick={() => { resetGlobe(); reset(); }}
          className="flex-1"
        >
          Play Again
        </Button>
      </div>
    </motion.div>
  );
}

export default function WorldlePage() {
  const { isPlaying, isFinished, mode } = useWorldle();

  return (
    <AnimatePresence mode="wait">
      {!mode && <StartScreen key="start" />}
      {(isPlaying || isFinished) && <GameScreen key="game" />}
    </AnimatePresence>
  );
}
