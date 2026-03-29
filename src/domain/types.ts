// ============ Geography Types ============

export interface Country {
  code: string; // ISO alpha-2
  code3: string; // ISO alpha-3
  name: string;
  officialName?: string;
  alternateNames: string[];
  capital: string;
  continent: Continent;
  subregion: string;
  lat: number;
  lng: number;
  population: number;
  areaKm2: number;
  flag: string; // emoji flag
}

export type Continent =
  | "Africa"
  | "Asia"
  | "Europe"
  | "North America"
  | "South America"
  | "Oceania"
  | "Antarctica";

export interface GeoPoint {
  lat: number;
  lng: number;
}

export interface DistanceResult {
  distanceKm: number;
  bearing: number;
  direction: string;
  proximityPercent: number;
}

// ============ Game Types ============

export type GameMode = "country_shape" | "name_all" | "worldle" | "street_view";

export interface GameSession {
  id: string;
  userId: string;
  gameMode: GameMode;
  score: number;
  maxScore?: number;
  timeSeconds?: number;
  correctCount: number;
  totalCount: number;
  xpEarned: number;
  metadata: Record<string, unknown>;
  isDaily: boolean;
  createdAt: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  xpReward: number;
}
