"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils/cn";
import { formatNumber } from "@/lib/utils/formatters";

interface ScoreDisplayProps {
  score: number;
  maxScore?: number;
  label?: string;
  className?: string;
}

export function ScoreDisplay({
  score,
  maxScore,
  label = "Score",
  className,
}: ScoreDisplayProps) {
  return (
    <div className={cn("text-center", className)}>
      <div className="text-xs font-medium uppercase tracking-wider text-green/60">
        {label}
      </div>
      <motion.div
        key={score}
        initial={{ scale: 1.3, color: "#00e676" }}
        animate={{ scale: 1, color: "#ffffff" }}
        transition={{ type: "spring", damping: 15 }}
        className="text-3xl font-bold tabular-nums"
      >
        {formatNumber(score)}
        {maxScore != null && (
          <span className="text-lg text-slate-500">/{formatNumber(maxScore)}</span>
        )}
      </motion.div>
    </div>
  );
}
