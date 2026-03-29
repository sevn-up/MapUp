"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils/cn";
import { formatDistance } from "@/lib/utils/formatters";
import { bearingToArrow } from "@/lib/geo/distance";
import type { DistanceResult } from "@/types/geo";

interface DistanceHintProps {
  result: DistanceResult;
  countryName: string;
  countryFlag: string;
  className?: string;
}

function getProximityColor(percent: number): string {
  if (percent >= 95) return "bg-green";
  if (percent >= 80) return "bg-green-dark";
  if (percent >= 60) return "bg-yellow-500";
  if (percent >= 40) return "bg-orange-500";
  if (percent >= 20) return "bg-red-400";
  return "bg-wrong";
}

export function DistanceHint({
  result,
  countryName,
  countryFlag,
  className,
}: DistanceHintProps) {
  const isCorrect = result.distanceKm === 0;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className={cn(
        "flex items-center gap-3 rounded-lg border border-green/10 bg-navy p-3",
        className
      )}
    >
      <span className="text-xl">{countryFlag}</span>
      <span className="flex-1 text-sm font-medium text-white">
        {countryName}
      </span>
      <span className="text-sm text-slate-400">
        {isCorrect ? "0 km" : formatDistance(result.distanceKm)}
      </span>
      <span className="text-lg">
        {isCorrect ? "🎉" : bearingToArrow(result.bearing)}
      </span>
      <div className="h-6 w-16 overflow-hidden rounded-full bg-navy-lighter">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${result.proximityPercent}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className={cn("h-full rounded-full", getProximityColor(result.proximityPercent))}
        />
      </div>
    </motion.div>
  );
}
