"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { motion } from "framer-motion";

const HomeGlobe = dynamic(
  () => import("@/presentation/globe/HomeGlobe").then((m) => m.HomeGlobe),
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
    ready: true,
  },
  {
    href: "/street-view",
    title: "Street View",
    description: "Guess locations from street imagery",
    ready: true,
  },
];

export default function HomePage() {
  return (
    <div className="relative h-screen -mt-16 overflow-hidden bg-navy">
      {/* Full-screen 3D Globe */}
      <div className="absolute inset-0">
        <HomeGlobe />
      </div>

      {/* Gradient overlay for readability */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-navy via-navy/70 to-transparent" />

      {/* Content — flexed to fill viewport, pointer-events pass through to globe */}
      <div className="pointer-events-none relative z-10 flex h-full flex-col">
        {/* Title — centered */}
        <div className="flex flex-1 flex-col items-center justify-center pb-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-6xl">
              Map<span className="text-green">Up</span>
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Spin the globe. Pick a game. Test your world knowledge.
            </p>
          </motion.div>
        </div>

        {/* Game mode bar — pinned to bottom, no scroll needed */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="pointer-events-auto shrink-0 px-4 pb-4 sm:px-6 sm:pb-6"
        >
          <div className="mx-auto max-w-3xl rounded-2xl border border-green/15 bg-navy/90 p-3 backdrop-blur-xl">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
              {games.map((game) => (
                <Link
                  key={game.href}
                  href={game.href}
                  className={`group relative rounded-xl border p-3 transition-all ${
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
                  <p className="mt-1 text-xs text-slate-500 leading-snug">
                    {game.description}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
