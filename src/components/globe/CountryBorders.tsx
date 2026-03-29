"use client";

import { useEffect, useMemo, useState } from "react";
import * as THREE from "three";
import type { FeatureCollection, Geometry, Position } from "geojson";
import {
  loadCountryFeatures,
  latLngToVector3,
  numericToAlpha2,
} from "@/lib/geo/geojson-utils";
import { useGlobeStore } from "@/hooks/useGlobeStore";

interface CountryBordersProps {
  radius: number;
}

function coordsToPoints(coords: Position[], radius: number): THREE.Vector3[] {
  return coords.map(([lng, lat]) => {
    const [x, y, z] = latLngToVector3(lat, lng, radius);
    return new THREE.Vector3(x, y, z);
  });
}

function extractRings(geometry: Geometry): Position[][] {
  const rings: Position[][] = [];
  switch (geometry.type) {
    case "Polygon":
      geometry.coordinates.forEach((ring) => rings.push(ring));
      break;
    case "MultiPolygon":
      geometry.coordinates.forEach((polygon) =>
        polygon.forEach((ring) => rings.push(ring))
      );
      break;
  }
  return rings;
}

function buildLineGeometry(
  rings: Position[][],
  radius: number
): THREE.BufferGeometry {
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
 * Build a dense fill by rendering borders at many slightly offset radii,
 * plus inset versions scaled slightly toward center — creates visible
 * filled area without triangulation artifacts.
 */
function buildFillGeometry(
  rings: Position[][],
  radius: number
): THREE.BufferGeometry {
  const points: THREE.Vector3[] = [];

  // Multiple radii layers for thickness
  const layerCount = 8;
  for (let l = 0; l < layerCount; l++) {
    const r = radius + l * 0.0008;
    for (const ring of rings) {
      const verts = coordsToPoints(ring, r);
      for (let i = 0; i < verts.length - 1; i++) {
        points.push(verts[i], verts[i + 1]);
      }
    }
  }

  // Inset rings — scale coordinates slightly toward polygon centroid
  // This fills the interior rather than just tracing the border
  for (const ring of rings) {
    if (ring.length < 4) continue;
    // Compute centroid of this ring
    let cLat = 0, cLng = 0;
    const pts = ring.slice(0, -1); // remove closing duplicate
    for (const [lng, lat] of pts) {
      cLat += lat;
      cLng += lng;
    }
    cLat /= pts.length;
    cLng /= pts.length;

    // Create inset versions at different scales
    const scales = [0.92, 0.84, 0.76, 0.68, 0.60, 0.50, 0.38, 0.25];
    for (const s of scales) {
      const insetRing: Position[] = pts.map(([lng, lat]) => [
        cLng + (lng - cLng) * s,
        cLat + (lat - cLat) * s,
      ]);
      const verts = coordsToPoints(insetRing, radius + 0.002);
      for (let i = 0; i < verts.length - 1; i++) {
        points.push(verts[i], verts[i + 1]);
      }
    }
  }

  return new THREE.BufferGeometry().setFromPoints(points);
}

export function CountryBorders({ radius }: CountryBordersProps) {
  const [features, setFeatures] = useState<FeatureCollection | null>(null);
  const highlightedCountries = useGlobeStore((s) => s.highlightedCountries);

  useEffect(() => {
    loadCountryFeatures("50m").then(setFeatures);
  }, []);

  const { defaultBorderGeo, highlightedItems } = useMemo(() => {
    if (!features)
      return {
        defaultBorderGeo: null,
        highlightedItems: [] as { fillGeo: THREE.BufferGeometry; borderGeo: THREE.BufferGeometry; color: string }[],
      };

    const defaultRings: Position[][] = [];
    const hlItems: { fillGeo: THREE.BufferGeometry; borderGeo: THREE.BufferGeometry; color: string }[] = [];

    for (const feature of features.features) {
      const numericId = feature.id?.toString() ?? "";
      const alpha2 = numericToAlpha2(numericId);
      const hlColor = alpha2 ? highlightedCountries.get(alpha2) : undefined;
      const rings = extractRings(feature.geometry);

      if (hlColor) {
        const fillGeo = buildFillGeometry(rings, radius + 0.002);
        const borderGeo = buildLineGeometry(rings, radius + 0.005);
        hlItems.push({ fillGeo, borderGeo, color: hlColor });
      } else {
        defaultRings.push(...rings);
      }
    }

    const borderLines = buildLineGeometry(defaultRings, radius + 0.003);
    return { defaultBorderGeo: borderLines, highlightedItems: hlItems };
  }, [features, highlightedCountries, radius]);

  if (!features) return null;

  return (
    <group>
      {/* Default country borders */}
      {defaultBorderGeo && (
        <lineSegments geometry={defaultBorderGeo}>
          <lineBasicMaterial color="#3ddc84" transparent opacity={0.6} />
        </lineSegments>
      )}

      {/* Highlighted countries — thick colored fill + bright border */}
      {highlightedItems.map((item, i) => (
        <group key={`hl-${i}`}>
          {/* Dense fill layer */}
          <lineSegments geometry={item.fillGeo}>
            <lineBasicMaterial color={item.color} transparent opacity={0.7} />
          </lineSegments>
          {/* Bright outer border */}
          <lineSegments geometry={item.borderGeo}>
            <lineBasicMaterial color={item.color} transparent opacity={0.95} />
          </lineSegments>
        </group>
      ))}
    </group>
  );
}
