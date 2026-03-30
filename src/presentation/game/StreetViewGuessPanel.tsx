"use client";

import { useCallback, useMemo } from "react";
import { useStreetViewGame } from "@/application/useStreetView";
import { GuessMap } from "./GuessMap";
import { formatNumber } from "@/lib/utils/formatters";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/presentation/ui/Button";

/**
 * Renders the Mapbox guess map in the left panel of the game layout.
 * During gameplay: shows current guess + submit button.
 * After game: shows all rounds' guesses and actual positions.
 * On start screen: shows empty globe.
 */
export function StreetViewGuessPanel() {
  const {
    rounds,
    currentRound,
    totalRounds,
    totalScore,
    isRoundRevealed,
    isPlaying,
    isFinished,
    submitGuess,
    nextRound,
  } = useStreetViewGame();

  const round = isPlaying ? rounds[currentRound] : null;
  const guessPos = round?.guess ?? null;
  const currentScore = round?.score ?? 0;
  const distanceKm = round?.distanceKm ?? 0;

  const handleGuess = useCallback((lat: number, lng: number) => {
    useStreetViewGame.getState().submitGuessPosition(lat, lng);
  }, []);

  // Build completed rounds for the results map view
  const completedRounds = useMemo(() => {
    if (!isFinished) return undefined;
    return rounds
      .filter((r) => r.guess && r.score !== null)
      .map((r) => ({
        guess: r.guess!,
        actual: { lat: r.location.lat, lng: r.location.lng },
        score: r.score!,
      }));
  }, [isFinished, rounds]);

  // Start screen — empty globe
  if (!isPlaying && !isFinished) {
    return (
      <GuessMap
        onGuess={() => {}}
        guessPosition={null}
        interactive={false}
        className="h-full w-full"
      />
    );
  }

  // Results screen — show all rounds
  if (isFinished) {
    return (
      <div className="relative h-full w-full">
        <GuessMap
          onGuess={() => {}}
          guessPosition={null}
          interactive={false}
          completedRounds={completedRounds}
          className="h-full w-full"
        />
        <div className="absolute top-3 left-3 z-10">
          <div className="rounded-lg bg-navy/80 px-3 py-1.5 backdrop-blur-sm border border-green/20">
            <span className="text-sm text-green font-semibold">
              {formatNumber(totalScore)} pts total
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Active game — guess mode
  return (
    <div className="relative h-full w-full">
      <GuessMap
        onGuess={handleGuess}
        guessPosition={guessPos}
        actualPosition={isRoundRevealed ? { lat: round!.location.lat, lng: round!.location.lng } : null}
        revealed={isRoundRevealed}
        className="h-full w-full"
      />

      {/* Round info */}
      <div className="absolute top-3 left-3 z-10 flex items-center gap-3">
        <div className="rounded-lg bg-navy/80 px-3 py-1.5 backdrop-blur-sm border border-white/10">
          <span className="text-sm font-bold text-white">
            Round {currentRound + 1}/{totalRounds}
          </span>
        </div>
        <div className="rounded-lg bg-navy/80 px-3 py-1.5 backdrop-blur-sm border border-green/20">
          <span className="text-sm text-green font-semibold">
            {formatNumber(totalScore)} pts
          </span>
        </div>
      </div>

      {/* Score on reveal */}
      {isRoundRevealed && (
        <div className="absolute top-3 right-3 z-10 flex items-center gap-3 rounded-lg bg-navy/80 px-4 py-2 backdrop-blur-sm border border-white/10">
          <span className="text-sm text-slate-400">
            {formatNumber(distanceKm)} km
          </span>
          <span className={cn(
            "rounded px-2 py-0.5 text-sm font-bold",
            currentScore >= 4000 ? "bg-green/10 text-green" :
            currentScore >= 2000 ? "bg-yellow-500/10 text-yellow-400" :
            "bg-wrong/10 text-wrong"
          )}>
            +{formatNumber(currentScore)}
          </span>
        </div>
      )}

      {/* Submit / Next button */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10">
        {!isRoundRevealed ? (
          <Button
            onClick={() => submitGuess()}
            disabled={!guessPos}
            size="lg"
            className="shadow-lg shadow-green/20 px-8"
          >
            Submit Guess
          </Button>
        ) : (
          <Button
            onClick={() => nextRound()}
            size="lg"
            className="shadow-lg shadow-green/20 px-8"
          >
            {currentRound + 1 >= totalRounds ? "See Results" : "Next Round"}
          </Button>
        )}
      </div>
    </div>
  );
}
