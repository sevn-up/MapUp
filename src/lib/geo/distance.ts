import type { DistanceResult, GeoPoint } from "@/types/geo";

const EARTH_RADIUS_KM = 6371;
const MAX_DISTANCE_KM = 20000; // approx half circumference

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

function toDeg(rad: number): number {
  return (rad * 180) / Math.PI;
}

export function haversineDistance(from: GeoPoint, to: GeoPoint): number {
  const dLat = toRad(to.lat - from.lat);
  const dLng = toRad(to.lng - from.lng);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(from.lat)) *
      Math.cos(toRad(to.lat)) *
      Math.sin(dLng / 2) ** 2;
  return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function bearing(from: GeoPoint, to: GeoPoint): number {
  const dLng = toRad(to.lng - from.lng);
  const y = Math.sin(dLng) * Math.cos(toRad(to.lat));
  const x =
    Math.cos(toRad(from.lat)) * Math.sin(toRad(to.lat)) -
    Math.sin(toRad(from.lat)) * Math.cos(toRad(to.lat)) * Math.cos(dLng);
  const brng = toDeg(Math.atan2(y, x));
  return (brng + 360) % 360;
}

export function bearingToDirection(deg: number): string {
  const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  const index = Math.round(deg / 45) % 8;
  return dirs[index];
}

export function bearingToArrow(deg: number): string {
  const arrows = ["⬆️", "↗️", "➡️", "↘️", "⬇️", "↙️", "⬅️", "↖️"];
  const index = Math.round(deg / 45) % 8;
  return arrows[index];
}

export function getDistanceResult(from: GeoPoint, to: GeoPoint): DistanceResult {
  const distanceKm = haversineDistance(from, to);
  const brng = bearing(from, to);
  return {
    distanceKm,
    bearing: brng,
    direction: bearingToDirection(brng),
    proximityPercent: Math.max(
      0,
      Math.round(((MAX_DISTANCE_KM - distanceKm) / MAX_DISTANCE_KM) * 100)
    ),
  };
}
