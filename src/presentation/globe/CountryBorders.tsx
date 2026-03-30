"use client";

import { useEffect, useMemo, useState } from "react";
import type * as THREE from "three";
import type { FeatureCollection } from "geojson";
import { loadCountryFeatures, numericToAlpha2, resolveUndefinedFeature } from "@/infrastructure/geojson";
import { useGlobeStore } from "@/application/useGlobe";
import {
  extractRings,
  extractOuterRings,
  buildLineGeometry,
  buildFillLines,
} from "./geoUtils";

interface CountryBordersProps {
  radius: number;
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
        highlightedItems: [] as {
          fillGeo: THREE.BufferGeometry;
          borderGeo: THREE.BufferGeometry;
          color: string;
        }[],
      };

    const defaultRings: import("geojson").Position[][] = [];
    const hlItems: {
      fillGeo: THREE.BufferGeometry;
      borderGeo: THREE.BufferGeometry;
      color: string;
    }[] = [];

    for (const feature of features.features) {
      const numericId = feature.id?.toString() ?? "";
      const alpha2 = numericId
        ? numericToAlpha2(numericId)
        : resolveUndefinedFeature(feature.geometry as { type: string; coordinates: number[][][] | number[][][][] });
      const hlColor = alpha2 ? highlightedCountries.get(alpha2) : undefined;

      if (hlColor) {
        const rings = extractRings(feature.geometry);
        // Dense scan-line fill using outer rings only (no holes)
        const outerRings = extractOuterRings(feature.geometry);
        const fillGeo = buildFillLines(outerRings, radius + 0.004);
        // Crisp border lines on top
        const borderGeo = buildLineGeometry(rings, radius + 0.005);
        hlItems.push({ fillGeo, borderGeo, color: hlColor });
      } else {
        const rings = extractRings(feature.geometry);
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
          <lineBasicMaterial color="#4ade80" transparent opacity={0.4} />
        </lineSegments>
      )}

      {/* Highlighted countries — dense line fill + crisp border */}
      {highlightedItems.map((item, i) => (
        <group key={`hl-${i}`}>
          {/* Dense scan-line fill */}
          <lineSegments geometry={item.fillGeo}>
            <lineBasicMaterial color={item.color} transparent opacity={0.6} />
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
