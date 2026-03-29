"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils/cn";
import { getLevelFromXp } from "@/domain/xp";
import { formatNumber } from "@/lib/utils/formatters";

interface XPBarProps {
  totalXp: number;
  className?: string;
}

export function XPBar({ totalXp, className }: XPBarProps) {
  const { level, currentLevelXp, nextLevelXp, progress } =
    getLevelFromXp(totalXp);

  return (
    <div className={cn("space-y-1", className)}>
      <div className="flex items-center justify-between text-xs">
        <span className="font-bold text-green">Level {level}</span>
        <span className="text-slate-500">
          {formatNumber(currentLevelXp)} / {formatNumber(nextLevelXp)} XP
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-navy-lighter">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress * 100}%` }}
          transition={{ type: "spring", damping: 20, stiffness: 100 }}
          className="h-full rounded-full bg-gradient-to-r from-green-dark to-green"
        />
      </div>
    </div>
  );
}
