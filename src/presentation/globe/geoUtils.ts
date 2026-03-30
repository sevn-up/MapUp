import * as THREE from "three";
import type { Geometry, Position } from "geojson";
import { latLngToVector3 } from "@/infrastructure/geojson";

/** Convert [lng, lat] coordinates to THREE.Vector3 points on a sphere. */
export function coordsToPoints(coords: Position[], radius: number): THREE.Vector3[] {
  return coords.map(([lng, lat]) => {
    const [x, y, z] = latLngToVector3(lat, lng, radius);
    return new THREE.Vector3(x, y, z);
  });
}

/** Extract all rings (flat list) from a GeoJSON geometry — for border rendering. */
export function extractRings(geometry: Geometry): Position[][] {
  const rings: Position[][] = [];
  switch (geometry.type) {
    case "Polygon":
      (geometry as { coordinates: Position[][] }).coordinates.forEach((r) => rings.push(r));
      break;
    case "MultiPolygon":
      (geometry as { coordinates: Position[][][] }).coordinates.forEach((p) =>
        p.forEach((r) => rings.push(r))
      );
      break;
  }
  return rings;
}

/** Extract only outer rings (first ring of each polygon) — for fill rendering. */
export function extractOuterRings(geometry: Geometry): Position[][] {
  const rings: Position[][] = [];
  switch (geometry.type) {
    case "Polygon":
      rings.push((geometry as { coordinates: Position[][] }).coordinates[0]);
      break;
    case "MultiPolygon":
      (geometry as { coordinates: Position[][][] }).coordinates.forEach((p) =>
        rings.push(p[0])
      );
      break;
  }
  return rings;
}

/** Build line segment geometry from polygon rings — for borders. */
export function buildLineGeometry(rings: Position[][], radius: number): THREE.BufferGeometry {
  const points: THREE.Vector3[] = [];
  for (const ring of rings) {
    const verts = coordsToPoints(ring, radius);
    for (let i = 0; i < verts.length - 1; i++) {
      points.push(verts[i], verts[i + 1]);
    }
  }
  return new THREE.BufferGeometry().setFromPoints(points);
}

/**
 * Build a dense line-fill geometry for a country using horizontal scan lines.
 * Scans across the bounding box in latitude steps, clips each line to the polygon boundary,
 * then projects onto the sphere. Produces a visually solid fill with no triangulation artifacts.
 */
/**
 * Check if a ring crosses the antimeridian (±180° longitude).
 * Detected by consecutive vertices with a longitude jump > 180°.
 */
function crossesAntimeridian(ring: Position[]): boolean {
  for (let i = 1; i < ring.length; i++) {
    if (Math.abs(ring[i][0] - ring[i - 1][0]) > 180) return true;
  }
  return false;
}

/**
 * Normalize a ring that crosses the antimeridian by shifting negative
 * longitudes to [180, 360] range, making the ring continuous.
 */
function normalizeRing(ring: Position[]): Position[] {
  return ring.map(([lng, lat]) => [lng < 0 ? lng + 360 : lng, lat]);
}

/**
 * Convert a normalized longitude back to [-180, 180] for sphere projection.
 */
function denormalizeLng(lng: number): number {
  return lng > 180 ? lng - 360 : lng;
}

function scanFillRing(
  ring: Position[],
  radius: number,
  points: THREE.Vector3[]
): void {
  if (ring.length < 4) return;

  const crosses = crossesAntimeridian(ring);
  const workRing = crosses ? normalizeRing(ring) : ring;

  // Compute bounding box
  let minLat = 90, maxLat = -90, minLng = 400, maxLng = -400;
  for (const [lng, lat] of workRing) {
    if (lat < minLat) minLat = lat;
    if (lat > maxLat) maxLat = lat;
    if (lng < minLng) minLng = lng;
    if (lng > maxLng) maxLng = lng;
  }

  const latSpan = maxLat - minLat;
  const lngSpan = maxLng - minLng;
  if (latSpan < 0.1 || lngSpan < 0.1) return;

  // Adaptive step: ~30 lines across the smaller dimension, min 0.3°
  const step = Math.max(0.3, Math.min(latSpan, lngSpan) / 30);

  // Horizontal scan lines
  for (let lat = minLat + step / 2; lat < maxLat; lat += step) {
    const intersections: number[] = [];
    for (let i = 0, j = workRing.length - 1; i < workRing.length; j = i++) {
      const yi = workRing[i][1], yj = workRing[j][1];
      if ((yi > lat) !== (yj > lat)) {
        const xi = workRing[i][0], xj = workRing[j][0];
        const xIntersect = xj + ((lat - yj) / (yi - yj)) * (xi - xj);
        intersections.push(xIntersect);
      }
    }

    intersections.sort((a, b) => a - b);
    for (let k = 0; k < intersections.length - 1; k += 2) {
      const lngStart = intersections[k];
      const lngEnd = intersections[k + 1];
      if (lngEnd - lngStart < 0.05) continue;

      const numSegments = Math.max(1, Math.ceil((lngEnd - lngStart) / 2));
      for (let s = 0; s < numSegments; s++) {
        const lng1 = lngStart + (s / numSegments) * (lngEnd - lngStart);
        const lng2 = lngStart + ((s + 1) / numSegments) * (lngEnd - lngStart);
        const [x1, y1, z1] = latLngToVector3(lat, denormalizeLng(lng1), radius);
        const [x2, y2, z2] = latLngToVector3(lat, denormalizeLng(lng2), radius);
        points.push(new THREE.Vector3(x1, y1, z1), new THREE.Vector3(x2, y2, z2));
      }
    }
  }

  // Vertical scan lines
  for (let lng = minLng + step / 2; lng < maxLng; lng += step) {
    const intersections: number[] = [];
    for (let i = 0, j = workRing.length - 1; i < workRing.length; j = i++) {
      const xi = workRing[i][0], xj = workRing[j][0];
      if ((xi > lng) !== (xj > lng)) {
        const yi = workRing[i][1], yj = workRing[j][1];
        const yIntersect = yj + ((lng - xj) / (xi - xj)) * (yi - yj);
        intersections.push(yIntersect);
      }
    }

    intersections.sort((a, b) => a - b);
    for (let k = 0; k < intersections.length - 1; k += 2) {
      const latStart = intersections[k];
      const latEnd = intersections[k + 1];
      if (latEnd - latStart < 0.05) continue;

      const numSegments = Math.max(1, Math.ceil((latEnd - latStart) / 2));
      for (let s = 0; s < numSegments; s++) {
        const lat1 = latStart + (s / numSegments) * (latEnd - latStart);
        const lat2 = latStart + ((s + 1) / numSegments) * (latEnd - latStart);
        const [x1, y1, z1] = latLngToVector3(lat1, denormalizeLng(lng), radius);
        const [x2, y2, z2] = latLngToVector3(lat2, denormalizeLng(lng), radius);
        points.push(new THREE.Vector3(x1, y1, z1), new THREE.Vector3(x2, y2, z2));
      }
    }
  }
}

export function buildFillLines(rings: Position[][], radius: number): THREE.BufferGeometry {
  const points: THREE.Vector3[] = [];
  for (const ring of rings) {
    scanFillRing(ring, radius, points);
  }
  return new THREE.BufferGeometry().setFromPoints(points);
}
