"use client";

import { useState, useCallback, useRef } from "react";
import { useGlobeStore } from "@/application/useGlobe";
import type { Country } from "@/domain/types";

/**
 * Shared hook for game feedback effects — confetti, screen shake, flash overlay,
 * globe highlighting. Used by all game modes to avoid duplicating this logic.
 */
export function useGameFeedback() {
  const { highlightCountry, flyToCountry } = useGlobeStore();

  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [confettiTrigger, setConfettiTrigger] = useState(0);
  const [shaking, setShaking] = useState(false);
  const feedbackTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const clearFeedback = useCallback(() => {
    if (feedbackTimer.current) clearTimeout(feedbackTimer.current);
    feedbackTimer.current = setTimeout(() => setFeedback(null), 700);
  }, []);

  const onCorrect = useCallback(
    (country: Country) => {
      highlightCountry(country.code, "#00e676");
      flyToCountry(country.lat, country.lng);
      setFeedback("correct");
      setConfettiTrigger((c) => c + 1);
      setShaking(false);
      clearFeedback();
    },
    [highlightCountry, flyToCountry, clearFeedback]
  );

  const onWrong = useCallback(
    (country?: Country) => {
      if (country) {
        highlightCountry(country.code, "#ff5252");
        flyToCountry(country.lat, country.lng);
      }
      setFeedback("wrong");
      setShaking(true);
      setTimeout(() => setShaking(false), 500);
      clearFeedback();
    },
    [highlightCountry, flyToCountry, clearFeedback]
  );

  return { feedback, confettiTrigger, shaking, onCorrect, onWrong };
}
