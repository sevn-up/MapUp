"use client";

import { useMemo } from "react";
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

export function ScoreChart({ data, className }: ScoreChartProps) {
  const { paths, modes, yLabels, xLabels, width, height } = useMemo(() => {
    if (data.length === 0) return { paths: [], modes: [], yLabels: [], xLabels: [], width: 0, height: 0 };

    const w = 600;
    const h = 200;
    const padL = 40;
    const padR = 16;
    const padT = 16;
    const padB = 24;
    const plotW = w - padL - padR;
    const plotH = h - padT - padB;

    // Group by mode
    const byMode = new Map<string, { date: string; score: number }[]>();
    for (const d of data) {
      const arr = byMode.get(d.gameMode) || [];
      arr.push({ date: d.date, score: d.score });
      byMode.set(d.gameMode, arr);
    }

    // Global min/max
    const allScores = data.map((d) => d.score);
    const maxScore = Math.max(...allScores, 100);
    const minScore = 0;

    // Date range
    const dates = data.map((d) => new Date(d.date).getTime());
    const minDate = Math.min(...dates);
    const maxDate = Math.max(...dates);
    const dateRange = maxDate - minDate || 1;

    // Build SVG paths per mode
    const svgPaths: { d: string; color: string; mode: string }[] = [];
    const modeNames: string[] = [];

    for (const [mode, points] of byMode.entries()) {
      modeNames.push(mode);
      const sorted = points.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      const coords = sorted.map((p) => {
        const x = padL + ((new Date(p.date).getTime() - minDate) / dateRange) * plotW;
        const y = padT + plotH - ((p.score - minScore) / (maxScore - minScore)) * plotH;
        return { x, y };
      });

      if (coords.length === 1) {
        // Single point — draw a dot
        svgPaths.push({
          d: `M ${coords[0].x - 3} ${coords[0].y} a 3 3 0 1 0 6 0 a 3 3 0 1 0 -6 0`,
          color: MODE_COLORS[mode] || "#00e676",
          mode,
        });
      } else {
        const pathD = coords.map((c, i) => `${i === 0 ? "M" : "L"} ${c.x.toFixed(1)} ${c.y.toFixed(1)}`).join(" ");
        svgPaths.push({
          d: pathD,
          color: MODE_COLORS[mode] || "#00e676",
          mode,
        });
      }
    }

    // Y-axis labels
    const yLbls = [0, Math.round(maxScore / 2), maxScore].map((v) => ({
      value: v,
      y: padT + plotH - (v / maxScore) * plotH,
    }));

    // X-axis labels (3-4 date markers)
    const xCount = Math.min(4, data.length);
    const xLbls = Array.from({ length: xCount }, (_, i) => {
      const t = minDate + (i / (xCount - 1 || 1)) * dateRange;
      const d = new Date(t);
      return {
        label: `${d.getMonth() + 1}/${d.getDate()}`,
        x: padL + (i / (xCount - 1 || 1)) * plotW,
      };
    });

    return { paths: svgPaths, modes: modeNames, yLabels: yLbls, xLabels: xLbls, width: w, height: h };
  }, [data]);

  if (data.length === 0) {
    return (
      <div className={cn("rounded-xl border border-white/5 bg-navy-card p-8 text-center", className)}>
        <p className="text-slate-500">Play some games to see your progress chart</p>
      </div>
    );
  }

  return (
    <div className={cn("overflow-x-auto", className)}>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full" preserveAspectRatio="xMidYMid meet">
        {/* Grid lines */}
        {yLabels.map((yl) => (
          <g key={yl.value}>
            <line x1={40} y1={yl.y} x2={width - 16} y2={yl.y} stroke="#1a2332" strokeWidth={1} />
            <text x={4} y={yl.y + 4} className="fill-slate-600 text-[10px]">{yl.value}</text>
          </g>
        ))}

        {/* X labels */}
        {xLabels.map((xl) => (
          <text key={xl.label} x={xl.x} y={height - 4} textAnchor="middle" className="fill-slate-600 text-[10px]">
            {xl.label}
          </text>
        ))}

        {/* Score lines */}
        {paths.map((p) => (
          <path
            key={p.mode}
            d={p.d}
            fill="none"
            stroke={p.color}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={0.8}
          />
        ))}
      </svg>

      {/* Legend */}
      <div className="mt-2 flex flex-wrap gap-3">
        {modes.map((m) => (
          <div key={m} className="flex items-center gap-1.5 text-xs text-slate-400">
            <div className="h-2 w-2 rounded-full" style={{ backgroundColor: MODE_COLORS[m] || "#00e676" }} />
            {MODE_LABELS[m] || m}
          </div>
        ))}
      </div>
    </div>
  );
}
