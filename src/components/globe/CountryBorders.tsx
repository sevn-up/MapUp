"use client";

import { useEffect, useMemo, useState } from "react";
import * as THREE from "three";
import type { FeatureCollection, Geometry, Position } from "geojson";
import { loadCountryFeatures, latLngToVector3, numericToAlpha2 } from "@/lib/geo/geojson-utils";
import { useGlobeStore } from "@/hooks/useGlobeStore";

interface CountryBordersProps {
  radius: number;
}

function coordsToPoints(
  coords: Position[],
  radius: number
): THREE.Vector3[] {
  return coords.map(([lng, lat]) => {
    const [x, y, z] = latLngToVector3(lat, lng, radius + 0.003);
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
    default:
      break;
  }

  return rings;
}

function CountryMesh({
  rings,
  color,
  opacity,
  radius,
}: {
  rings: Position[][];
  color: string;
  opacity: number;
  radius: number;
}) {
  const geometry = useMemo(() => {
    const points: THREE.Vector3[] = [];
    for (const ring of rings) {
      const verts = coordsToPoints(ring, radius);
      for (let i = 0; i < verts.length - 1; i++) {
        points.push(verts[i], verts[i + 1]);
      }
    }
    return new THREE.BufferGeometry().setFromPoints(points);
  }, [rings, radius]);

  return (
    <lineSegments geometry={geometry}>
      <lineBasicMaterial color={color} transparent opacity={opacity} />
    </lineSegments>
  );
}

/**
 * Renders filled land polygons as a subtle solid layer beneath the borders.
 */
function LandFill({
  features,
  radius,
}: {
  features: FeatureCollection;
  radius: number;
}) {
  const geometry = useMemo(() => {
    const allPoints: THREE.Vector3[] = [];

    for (const feature of features.features) {
      const rings = extractRings(feature.geometry);
      for (const ring of rings) {
        const verts = coordsToPoints(ring, radius + 0.001);
        for (let i = 0; i < verts.length - 1; i++) {
          allPoints.push(verts[i], verts[i + 1]);
        }
      }
    }

    return new THREE.BufferGeometry().setFromPoints(allPoints);
  }, [features, radius]);

  return (
    <lineSegments geometry={geometry}>
      <lineBasicMaterial color="#0f4d2a" transparent opacity={0.35} />
    </lineSegments>
  );
}

export function CountryBorders({ radius }: CountryBordersProps) {
  const [features, setFeatures] = useState<FeatureCollection | null>(null);
  const highlightedCountries = useGlobeStore((s) => s.highlightedCountries);

  useEffect(() => {
    loadCountryFeatures("50m").then(setFeatures);
  }, []);

  // Parse highlighted features vs default features
  const { defaultRings, highlightedFeatures } = useMemo(() => {
    if (!features) return { defaultRings: [] as Position[][], highlightedFeatures: [] as { rings: Position[][]; color: string }[] };

    const defRings: Position[][] = [];
    const hlFeatures: { rings: Position[][]; color: string }[] = [];

    for (const feature of features.features) {
      const numericId = feature.id?.toString() ?? "";
      const alpha2 = numericToAlpha2(numericId);
      const hlColor = alpha2 ? highlightedCountries.get(alpha2) : undefined;

      const rings = extractRings(feature.geometry);

      if (hlColor) {
        hlFeatures.push({ rings, color: hlColor });
      } else {
        defRings.push(...rings);
      }
    }

    return { defaultRings: defRings, highlightedFeatures: hlFeatures };
  }, [features, highlightedCountries]);

  if (!features) return null;

  return (
    <group>
      {/* Subtle land fill */}
      <LandFill features={features} radius={radius} />

      {/* Default country borders */}
      {defaultRings.length > 0 && (
        <CountryMesh
          rings={defaultRings}
          color="#00e676"
          opacity={0.55}
          radius={radius}
        />
      )}

      {/* Highlighted countries */}
      {highlightedFeatures.map((hf, i) => (
        <CountryMesh
          key={i}
          rings={hf.rings}
          color={hf.color}
          opacity={0.9}
          radius={radius}
        />
      ))}
    </group>
  );
}
