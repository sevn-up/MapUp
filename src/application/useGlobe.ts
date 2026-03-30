import { create } from "zustand";

interface Arc {
  from: [number, number]; // [lat, lng]
  to: [number, number];
}

interface GlobeStore {
  highlightedCountries: Map<string, string>; // countryCode -> color
  flyTarget: { lat: number; lng: number } | null;
  arcs: Arc[];
  autoRotate: boolean;
  hideGlobe: boolean;
  leftPanelMode: "globe" | "street-view-map";

  flyToCountry: (lat: number, lng: number) => void;
  highlightCountry: (code: string, color: string) => void;
  removeHighlight: (code: string) => void;
  showArc: (from: [number, number], to: [number, number]) => void;
  clearArcs: () => void;
  setAutoRotate: (enabled: boolean) => void;
  setHideGlobe: (hide: boolean) => void;
  setLeftPanelMode: (mode: "globe" | "street-view-map") => void;
  reset: () => void;
}

export const useGlobeStore = create<GlobeStore>((set) => ({
  highlightedCountries: new Map(),
  flyTarget: null,
  arcs: [],
  autoRotate: true,
  hideGlobe: false,
  leftPanelMode: "globe" as const,

  flyToCountry: (lat, lng) => set({ flyTarget: { lat, lng }, autoRotate: false }),

  highlightCountry: (code, color) =>
    set((state) => {
      const next = new Map(state.highlightedCountries);
      next.set(code, color);
      return { highlightedCountries: next };
    }),

  removeHighlight: (code) =>
    set((state) => {
      const next = new Map(state.highlightedCountries);
      next.delete(code);
      return { highlightedCountries: next };
    }),

  showArc: (from, to) =>
    set((state) => ({ arcs: [...state.arcs, { from, to }] })),

  clearArcs: () => set({ arcs: [] }),

  setAutoRotate: (enabled) => set({ autoRotate: enabled }),

  setHideGlobe: (hide) => set({ hideGlobe: hide }),

  setLeftPanelMode: (mode) => set({ leftPanelMode: mode }),

  reset: () =>
    set({
      highlightedCountries: new Map(),
      flyTarget: null,
      arcs: [],
      autoRotate: true,
      hideGlobe: false,
      leftPanelMode: "globe" as const,
    }),
}));
