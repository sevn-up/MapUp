"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils/cn";

interface DataPoint {
  date: string; // ISO date
  score: number;
  gameMode: string;
}

interface ScoreChartProps {
  data: DataPoint[];
  className?: string;
}

const MODE_COLORS: Record<string, string> = {
  country_shape: "#00e676",
  name_all: "#69f0ae",
  worldle: "#00c853",
  street_view: "#4ade80",
};

const MODE_LABELS: Record<string, string> = {
  country_shape: "Shape Quiz",
  name_all: "Name All",
  worldle: "Worldle",
  street_view: "Street View",
};

function formatAxisLabel(timestamp: number, sameDay: boolean): string {
  const d = new Date(timestamp);
  if (sameDay) {
    return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  }
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

export function ScoreChart({ data, className }: ScoreChartProps) {
  const availableModes = useMemo(() => {
    const modes = new Set<string>();
    for (const d of data) modes.add(d.gameMode);
    return Array.from(modes);
  }, [data]);

  const [activeModes, setActiveModes] = useState<Set<string>>(new Set(availableModes));

  const toggleMode = (mode: string) => {
    setActiveModes((prev) => {
      const next = new Set(prev);
      if (next.has(mode)) {
        if (next.size > 1) next.delete(mode); // Keep at least one active
      } else {
        next.add(mode);
      }
      return next;
    });
  };

  const { paths, yLabels, xLabels, width, height } = useMemo(() => {
    const filtered = data.filter((d) => activeModes.has(d.gameMode));
    if (filtered.length === 0) return { paths: [], yLabels: [], xLabels: [], width: 0, height: 0 };

    const w = 600;
    const h = 200;
    const padL = 45;
    const padR = 16;
    const padT = 16;
    const padB = 28;
    const plotW = w - padL - padR;
    const plotH = h - padT - padB;

    // Group by mode
    const byMode = new Map<string, { date: string; score: number }[]>();
    for (const d of filtered) {
      const arr = byMode.get(d.gameMode) || [];
      arr.push({ date: d.date, score: d.score });
      byMode.set(d.gameMode, arr);
    }

    // Scale per active modes
    const allScores = filtered.map((d) => d.score);
    const maxScore = Math.max(...allScores, 10);

    // Date range
    const dates = filtered.map((d) => new Date(d.date).getTime());
    const minDate = Math.min(...dates);
    const maxDate = Math.max(...dates);
    const dateRange = maxDate - minDate || 1;

    // Detect if all data is from the same calendar day
    const sameDay = new Date(minDate).toDateString() === new Date(maxDate).toDateString();

    // Build SVG paths per mode
    const svgPaths: { d: string; color: string; mode: string; points: { x: number; y: number; score: number }[] }[] = [];

    for (const [mode, points] of byMode.entries()) {
      const sorted = points.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      const coords = sorted.map((p) => {
        const x = padL + ((new Date(p.date).getTime() - minDate) / dateRange) * plotW;
        const y = padT + plotH - (p.score / maxScore) * plotH;
        return { x, y, score: p.score };
      });

      if (coords.length === 1) {
        svgPaths.push({
          d: `M ${coords[0].x - 3} ${coords[0].y} a 3 3 0 1 0 6 0 a 3 3 0 1 0 -6 0`,
          color: MODE_COLORS[mode] || "#00e676",
          mode,
          points: coords,
        });
      } else {
        const pathD = coords.map((c, i) => `${i === 0 ? "M" : "L"} ${c.x.toFixed(1)} ${c.y.toFixed(1)}`).join(" ");
        svgPaths.push({
          d: pathD,
          color: MODE_COLORS[mode] || "#00e676",
          mode,
          points: coords,
        });
      }
    }

    // Y-axis labels
    const yLbls = [0, Math.round(maxScore / 2), maxScore].map((v) => ({
      value: v,
      y: padT + plotH - (v / maxScore) * plotH,
    }));

    // X-axis labels
    const xCount = Math.min(4, filtered.length);
    const xLbls = Array.from({ length: xCount }, (_, i) => {
      const t = minDate + (i / (xCount - 1 || 1)) * dateRange;
      return {
        label: formatAxisLabel(t, sameDay),
        x: padL + (i / (xCount - 1 || 1)) * plotW,
      };
    });

    return { paths: svgPaths, yLabels: yLbls, xLabels: xLbls, width: w, height: h };
  }, [data, activeModes]);

  if (data.length === 0) {
    return (
      <div className={cn("rounded-xl border border-white/5 bg-navy-card p-8 text-center", className)}>
        <p className="text-slate-500">Play some games to see your progress chart</p>
      </div>
    );
  }

  return (
    <div className={cn("", className)}>
      {/* Mode filter toggles */}
      <div className="mb-3 flex flex-wrap gap-2">
        {availableModes.map((m) => {
          const active = activeModes.has(m);
          return (
            <button
              key={m}
              onClick={() => toggleMode(m)}
              className={cn(
                "flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-all",
                active
                  ? "border-green/30 bg-green/10 text-green"
                  : "border-white/5 bg-white/[0.02] text-slate-600 hover:text-slate-400"
              )}
            >
              <div
                className={cn("h-2 w-2 rounded-full transition-opacity", !active && "opacity-30")}
                style={{ backgroundColor: MODE_COLORS[m] || "#00e676" }}
              />
              {MODE_LABELS[m] || m}
            </button>
          );
        })}
      </div>

      {/* Chart */}
      <div className="overflow-x-auto">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full" preserveAspectRatio="xMidYMid meet">
          {/* Grid lines */}
          {yLabels.map((yl) => (
            <g key={yl.value}>
              <line x1={45} y1={yl.y} x2={width - 16} y2={yl.y} stroke="#1a2332" strokeWidth={1} />
              <text x={4} y={yl.y + 4} className="fill-slate-600 text-[10px]">{yl.value}</text>
            </g>
          ))}

          {/* X labels */}
          {xLabels.map((xl, i) => (
            <text key={i} x={xl.x} y={height - 4} textAnchor="middle" className="fill-slate-600 text-[10px]">
              {xl.label}
            </text>
          ))}

          {/* Score lines */}
          {paths.map((p) => (
            <g key={p.mode}>
              <path
                d={p.d}
                fill="none"
                stroke={p.color}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity={0.8}
              />
              {/* Data point dots */}
              {p.points.map((pt, i) => (
                <circle
                  key={i}
                  cx={pt.x}
                  cy={pt.y}
                  r={3}
                  fill={p.color}
                  stroke="#0a1929"
                  strokeWidth={1.5}
                  opacity={0.9}
                />
              ))}
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}
