"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type GlobeStyle = "dark" | "blue" | "night" | "wireframe";

interface GlobeStyleStore {
  style: GlobeStyle;
  setStyle: (style: GlobeStyle) => void;
}

export const GLOBE_STYLES: { id: GlobeStyle; label: string; texture: string | null }[] = [
  { id: "dark", label: "Dark", texture: "/textures/earth-dark.jpg" },
  { id: "blue", label: "Blue Marble", texture: "/textures/earth-blue.jpg" },
  { id: "night", label: "Night Lights", texture: "/textures/earth-night.jpg" },
  { id: "wireframe", label: "Wireframe", texture: null },
];

export function getTexturePath(style: GlobeStyle): string | null {
  return GLOBE_STYLES.find((s) => s.id === style)?.texture ?? null;
}

export const useGlobeStyle = create<GlobeStyleStore>()(
  persist(
    (set) => ({
      style: "dark",
      setStyle: (style) => set({ style }),
    }),
    { name: "mapup-globe-style" }
  )
);
