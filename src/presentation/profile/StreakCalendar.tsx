"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils/cn";

interface StreakCalendarProps {
  /** Map of "YYYY-MM-DD" → number of games played that day */
  activityMap: Map<string, number>;
  className?: string;
}

const DAYS = ["Mon", "", "Wed", "", "Fri", "", ""];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function getDateKey(date: Date): string {
  return date.toISOString().split("T")[0];
}

function getColor(count: number): string {
  if (count === 0) return "#111827"; // navy-light
  if (count === 1) return "#064e1e";
  if (count === 2) return "#0a7a30";
  if (count <= 4) return "#00c853";
  return "#69f0ae"; // 5+ games
}

export function StreakCalendar({ activityMap, className }: StreakCalendarProps) {
  const [tooltip, setTooltip] = useState<{ x: number; y: number; text: string } | null>(null);

  const { weeks, monthLabels, totalActive } = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Go back 52 weeks from the end of this week
    const endDay = new Date(today);
    // Align to end of week (Sunday)
    endDay.setDate(endDay.getDate() + (6 - endDay.getDay()));

    const startDay = new Date(endDay);
    startDay.setDate(startDay.getDate() - 52 * 7 + 1);

    const wks: { date: Date; count: number }[][] = [];
    let currentWeek: { date: Date; count: number }[] = [];
    const mLabels: { text: string; col: number }[] = [];
    let active = 0;
    let lastMonth = -1;

    const cursor = new Date(startDay);
    let weekIndex = 0;

    while (cursor <= endDay) {
      const key = getDateKey(cursor);
      const count = activityMap.get(key) || 0;
      if (count > 0) active++;

      // Track month labels
      if (cursor.getMonth() !== lastMonth) {
        lastMonth = cursor.getMonth();
        mLabels.push({ text: MONTHS[lastMonth], col: weekIndex });
      }

      currentWeek.push({ date: new Date(cursor), count });

      if (currentWeek.length === 7) {
        wks.push(currentWeek);
        currentWeek = [];
        weekIndex++;
      }

      cursor.setDate(cursor.getDate() + 1);
    }

    if (currentWeek.length > 0) wks.push(currentWeek);

    return { weeks: wks, monthLabels: mLabels, totalActive: active };
  }, [activityMap]);

  const cellSize = 11;
  const gap = 2;
  const labelWidth = 28;
  const headerHeight = 16;
  const totalWidth = labelWidth + weeks.length * (cellSize + gap);
  const totalHeight = headerHeight + 7 * (cellSize + gap);

  return (
    <div className={cn("overflow-x-auto", className)}>
      <svg
        width={totalWidth}
        height={totalHeight}
        className="block"
        onMouseLeave={() => setTooltip(null)}
      >
        {/* Month labels */}
        {monthLabels.map((m, i) => (
          <text
            key={`${m.text}-${i}`}
            x={labelWidth + m.col * (cellSize + gap)}
            y={10}
            className="fill-slate-600 text-[9px]"
          >
            {m.text}
          </text>
        ))}

        {/* Day labels */}
        {DAYS.map((d, i) => (
          d && (
            <text
              key={d}
              x={0}
              y={headerHeight + i * (cellSize + gap) + cellSize - 1}
              className="fill-slate-600 text-[9px]"
            >
              {d}
            </text>
          )
        ))}

        {/* Cells */}
        {weeks.map((week, wi) =>
          week.map((day, di) => {
            const x = labelWidth + wi * (cellSize + gap);
            const y = headerHeight + di * (cellSize + gap);
            const dateStr = getDateKey(day.date);

            return (
              <rect
                key={dateStr}
                x={x}
                y={y}
                width={cellSize}
                height={cellSize}
                rx={2}
                fill={getColor(day.count)}
                className="transition-colors duration-150"
                onMouseEnter={(e) => {
                  const label = day.count === 0
                    ? `No games on ${dateStr}`
                    : `${day.count} game${day.count > 1 ? "s" : ""} on ${dateStr}`;
                  setTooltip({ x: e.clientX, y: e.clientY, text: label });
                }}
                onMouseLeave={() => setTooltip(null)}
              />
            );
          })
        )}
      </svg>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="pointer-events-none fixed z-50 rounded-md bg-navy-card border border-green/20 px-2 py-1 text-xs text-white shadow-lg"
          style={{ left: tooltip.x + 10, top: tooltip.y - 30 }}
        >
          {tooltip.text}
        </div>
      )}

      <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
        <span>{totalActive} days active in the last year</span>
        <div className="flex items-center gap-1">
          <span>Less</span>
          {[0, 1, 2, 3, 5].map((n) => (
            <div
              key={n}
              className="h-[10px] w-[10px] rounded-sm"
              style={{ backgroundColor: getColor(n) }}
            />
          ))}
          <span>More</span>
        </div>
      </div>
    </div>
  );
}
