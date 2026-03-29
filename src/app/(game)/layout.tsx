"use client";

import dynamic from "next/dynamic";

const Globe = dynamic(
  () => import("@/components/globe/Globe").then((m) => m.Globe),
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
  return (
    <div className="flex h-screen flex-col lg:flex-row">
      {/* 3D Globe Panel */}
      <div className="globe-container relative h-[40vh] w-full shrink-0 lg:h-full lg:w-1/2">
        <Globe />
      </div>

      {/* Game Content Panel */}
      <div className="flex-1 overflow-y-auto bg-navy-light p-6 lg:p-8">
        {children}
      </div>
    </div>
  );
}
