"use client";

import { cn } from "@/lib/utils/cn";
import { formatTime } from "@/lib/utils/formatters";

interface GameTimerProps {
  timeLeft: number;
  className?: string;
}

export function GameTimer({ timeLeft, className }: GameTimerProps) {
  const isLow = timeLeft <= 30;
  const isCritical = timeLeft <= 10;

  return (
    <div
      className={cn(
        "tabular-nums text-2xl font-bold",
        isCritical
          ? "animate-pulse text-wrong"
          : isLow
            ? "text-warning"
            : "text-green",
        className
      )}
    >
      {formatTime(timeLeft)}
    </div>
  );
}
