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

export function CountryBorders({ radius }: CountryBordersProps) {
  const [features, setFeatures] = useState<FeatureCollection | null>(null);
  const highlightedCountries = useGlobeStore((s) => s.highlightedCountries);

  useEffect(() => {
    loadCountryFeatures("50m").then(setFeatures);
  }, []);

  const { defaultBorderGeo, highlightedBorders } = useMemo(() => {
    if (!features)
      return {
        defaultBorderGeo: null,
        highlightedBorders: [] as { geo: THREE.BufferGeometry; color: string }[],
      };

    const defaultRings: Position[][] = [];
    const hlBorders: { geo: THREE.BufferGeometry; color: string }[] = [];

    for (const feature of features.features) {
      const numericId = feature.id?.toString() ?? "";
      const alpha2 = numericToAlpha2(numericId);
      const hlColor = alpha2 ? highlightedCountries.get(alpha2) : undefined;
      const rings = extractRings(feature.geometry);

      if (hlColor) {
        const lineGeo = buildLineGeometry(rings, radius + 0.005);
        hlBorders.push({ geo: lineGeo, color: hlColor });
      } else {
        defaultRings.push(...rings);
      }
    }

    const borderLines = buildLineGeometry(defaultRings, radius + 0.003);
    return { defaultBorderGeo: borderLines, highlightedBorders: hlBorders };
  }, [features, highlightedCountries, radius]);

  if (!features) return null;

  return (
    <group>
      {/* Main country borders — bright enough to see clearly */}
      {defaultBorderGeo && (
        <lineSegments geometry={defaultBorderGeo}>
          <lineBasicMaterial color="#3ddc84" transparent opacity={0.65} />
        </lineSegments>
      )}

      {/* Second pass — subtle glow layer underneath for thickness feel */}
      {defaultBorderGeo && (
        <lineSegments geometry={defaultBorderGeo}>
          <lineBasicMaterial color="#1a6b3a" transparent opacity={0.35} />
        </lineSegments>
      )}

      {/* Highlighted country borders — bright, full opacity */}
      {highlightedBorders.map((hb, i) => (
        <lineSegments key={`hl-${i}`} geometry={hb.geo}>
          <lineBasicMaterial color={hb.color} transparent opacity={0.95} />
        </lineSegments>
      ))}
    </group>
  );
}
