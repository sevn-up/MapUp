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
