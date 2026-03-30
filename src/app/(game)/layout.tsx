"use client";

import dynamic from "next/dynamic";
import { useGlobeStore } from "@/application/useGlobe";
import { useStreetViewGame } from "@/application/useStreetView";
import { StreetViewGuessPanel } from "@/presentation/game/StreetViewGuessPanel";
import { usePathname } from "next/navigation";

const Globe = dynamic(
  () => import("@/presentation/globe/Globe").then((m) => m.Globe),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center bg-navy">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-green/30 border-t-green" />
      </div>
    ),
  }
);

export default function GameLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isPlaying = useStreetViewGame((s) => s.isPlaying);
  const isFinished = useStreetViewGame((s) => s.isFinished);

  // Show Mapbox map for the entire Street View page (start, game, results)
  const showStreetViewMap = pathname === "/street-view";

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col lg:flex-row">
      {/* Left Panel — 3D Globe or Mapbox Guess Map */}
      <div className="globe-container relative h-[40vh] w-full shrink-0 lg:h-full lg:w-1/2">
        {showStreetViewMap ? <StreetViewGuessPanel /> : <Globe />}
      </div>

      {/* Game Content Panel */}
      <div className={`flex-1 overflow-y-auto bg-navy-light ${showStreetViewMap ? "" : "p-6 lg:p-8"}`}>
        {children}
      </div>
    </div>
  );
}
