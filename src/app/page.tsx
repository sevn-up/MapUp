"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { motion } from "framer-motion";

const HomeGlobe = dynamic(
  () => import("@/components/globe/HomeGlobe").then((m) => m.HomeGlobe),
  { ssr: false }
);

const games = [
  {
    href: "/country-shape",
    title: "Shape Quiz",
    description: "Identify countries by their silhouette",
    ready: true,
  },
  {
    href: "/name-all",
    title: "Name All",
    description: "Name all 197 countries against the clock",
    ready: true,
  },
  {
    href: "/worldle",
    title: "Worldle",
    description: "Daily country puzzle with distance hints",
    ready: false,
  },
  {
    href: "/street-view",
    title: "Street View",
    description: "Guess locations from street imagery",
    ready: false,
  },
];

export default function HomePage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-navy">
      {/* Full-screen 3D Globe — fills behind navbar */}
      <div className="absolute inset-0">
        <HomeGlobe />
      </div>

      {/* Gradient overlay at bottom for readability */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-80 bg-gradient-to-t from-navy via-navy/80 to-transparent" />

      {/* Header content */}
      <div className="relative z-10 flex flex-col items-center pt-20 sm:pt-28">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-7xl">
            Map<span className="text-green">Up</span>
          </h1>
          <p className="mt-3 text-sm text-slate-500 sm:text-base">
            Spin the globe. Pick a game. Test your world knowledge.
          </p>
        </motion.div>
      </div>

      {/* Bottom game mode bar */}
      <div className="absolute inset-x-0 bottom-0 z-10 p-4 sm:p-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="mx-auto max-w-3xl"
        >
          <div className="rounded-2xl border border-green/15 bg-navy/90 p-3 backdrop-blur-xl sm:p-4">
            <div className="mb-3 px-1 text-xs font-medium uppercase tracking-widest text-green/60">
              Game Modes
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
              {games.map((game) => (
                <Link
                  key={game.href}
                  href={game.href}
                  className={`group relative rounded-xl border p-3 transition-all sm:p-4 ${
                    game.ready
                      ? "border-green/20 bg-green/5 hover:bg-green/10 hover:border-green/40 hover:shadow-[0_0_25px_rgba(0,230,118,0.08)]"
                      : "border-white/5 bg-white/[0.02] hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={`h-2 w-2 rounded-full ${
                        game.ready
                          ? "bg-green shadow-[0_0_8px_rgba(0,230,118,0.5)]"
                          : "bg-slate-600"
                      }`}
                    />
                    <span
                      className={`text-sm font-semibold ${
                        game.ready ? "text-green" : "text-slate-500"
                      }`}
                    >
                      {game.title}
                    </span>
                  </div>
                  <p className="mt-1.5 text-xs text-slate-500 leading-snug">
                    {game.description}
                  </p>
                  {game.ready && (
                    <div className="mt-2 text-[10px] font-bold uppercase tracking-wider text-green/50 group-hover:text-green/80">
                      Play &rarr;
                    </div>
                  )}
                </Link>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
