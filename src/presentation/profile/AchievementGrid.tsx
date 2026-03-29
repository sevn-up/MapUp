"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils/cn";

export interface AchievementData {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  xp_reward: number;
  unlocked: boolean;
  unlocked_at?: string;
  progress?: number; // 0-1 for partially complete
}

interface AchievementGridProps {
  achievements: AchievementData[];
  className?: string;
}

const CATEGORY_LABELS: Record<string, string> = {
  general: "General",
  country_shape: "Shape Quiz",
  name_all: "Name All",
  worldle: "Worldle",
  street_view: "Street View",
};

export function AchievementGrid({ achievements, className }: AchievementGridProps) {
  const unlocked = achievements.filter((a) => a.unlocked);
  const locked = achievements.filter((a) => !a.unlocked);

  // Group by category
  const categories = new Map<string, AchievementData[]>();
  for (const a of achievements) {
    const cat = a.category;
    const arr = categories.get(cat) || [];
    arr.push(a);
    categories.set(cat, arr);
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Summary */}
      <div className="flex items-center gap-3 text-sm">
        <span className="font-bold text-green">{unlocked.length}</span>
        <span className="text-slate-500">/ {achievements.length} unlocked</span>
        <div className="flex-1 h-1.5 rounded-full bg-navy-lighter overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(unlocked.length / achievements.length) * 100}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="h-full rounded-full bg-gradient-to-r from-green-dark to-green"
          />
        </div>
      </div>

      {/* By category */}
      {Array.from(categories.entries()).map(([cat, items]) => (
        <div key={cat}>
          <div className="mb-2 text-[10px] font-medium uppercase tracking-widest text-slate-600">
            {CATEGORY_LABELS[cat] || cat}
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
            {items.map((a, i) => (
              <motion.div
                key={a.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.03 }}
                className={cn(
                  "relative rounded-xl border p-3 transition-all",
                  a.unlocked
                    ? "border-green/20 bg-green/5"
                    : "border-white/5 bg-navy-card opacity-50"
                )}
              >
                <div className="flex items-start gap-2">
                  <span className={cn("text-2xl", !a.unlocked && "grayscale")}>{a.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className={cn(
                      "text-xs font-semibold truncate",
                      a.unlocked ? "text-white" : "text-slate-500"
                    )}>
                      {a.name}
                    </div>
                    <div className="text-[10px] text-slate-600 leading-tight mt-0.5">
                      {a.description}
                    </div>
                  </div>
                </div>

                {a.unlocked && (
                  <div className="mt-2 text-[10px] text-green/60">
                    +{a.xp_reward} XP
                  </div>
                )}

                {/* Lock icon for locked achievements */}
                {!a.unlocked && (
                  <div className="absolute top-2 right-2 text-xs text-slate-700">
                    🔒
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
