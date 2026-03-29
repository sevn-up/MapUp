"use client";

import { useEffect, useState, useMemo } from "react";
import { geoMercator, geoPath, geoArea } from "d3-geo";
import type { FeatureCollection, Feature, Geometry, Polygon, MultiPolygon } from "geojson";
import { loadCountryFeatures, alpha2ToNumericCode } from "@/lib/geo/geojson-utils";
import { cn } from "@/lib/utils/cn";

/**
 * For MultiPolygon countries with distant territories (e.g., France with
 * French Guiana), extract only the largest polygon so the silhouette
 * shows the recognizable mainland shape rather than zooming out to fit
 * everything.
 */
function getLargestPolygon(geometry: Geometry): Geometry {
  if (geometry.type !== "MultiPolygon") return geometry;

  const multi = geometry as MultiPolygon;
  if (multi.coordinates.length <= 1) return geometry;

  let largestArea = -1;
  let largestCoords = multi.coordinates[0];

  for (const polygonCoords of multi.coordinates) {
    const poly: Polygon = { type: "Polygon", coordinates: polygonCoords };
    const area = geoArea(poly);
    if (area > largestArea) {
      largestArea = area;
      largestCoords = polygonCoords;
    }
  }

  // If the largest polygon is >80% of total area, just show it.
  // Otherwise show the full multi (e.g., Indonesia where islands matter)
  const totalArea = geoArea(geometry);
  if (largestArea / totalArea > 0.3) {
    return { type: "Polygon", coordinates: largestCoords } as Polygon;
  }

  return geometry;
}

interface CountryShapeProps {
  countryCode: string;
  revealed?: boolean;
  isCorrect?: boolean;
  size?: number;
  className?: string;
}

// Cache the loaded features so we don't refetch every round
let cachedFeatures: FeatureCollection | null = null;
let loadingPromise: Promise<FeatureCollection> | null = null;

function getFeatures(): Promise<FeatureCollection> {
  if (cachedFeatures) return Promise.resolve(cachedFeatures);
  if (!loadingPromise) {
    loadingPromise = loadCountryFeatures("50m").then((f) => {
      cachedFeatures = f;
      return f;
    });
  }
  return loadingPromise;
}

export function CountryShape({
  countryCode,
  revealed = false,
  isCorrect,
  size = 280,
  className,
}: CountryShapeProps) {
  const [allFeatures, setAllFeatures] = useState<FeatureCollection | null>(cachedFeatures);

  useEffect(() => {
    if (!allFeatures) {
      getFeatures().then(setAllFeatures);
    }
  }, [allFeatures]);

  const feature = useMemo(() => {
    if (!allFeatures) return null;
    const numericCode = alpha2ToNumericCode(countryCode);
    if (!numericCode) return null;
    return allFeatures.features.find(
      (f) => f.id?.toString() === numericCode
    ) as Feature<Geometry> | undefined;
  }, [allFeatures, countryCode]);

  const svgPath = useMemo(() => {
    if (!feature) return null;

    // Extract the largest polygon for countries with distant territories
    const mainlandGeometry = getLargestPolygon(feature.geometry);
    const mainlandFeature: Feature<Geometry> = {
      ...feature,
      geometry: mainlandGeometry,
    };

    const padding = size * 0.1;
    const inner = size - padding * 2;
    const projection = geoMercator().fitSize([inner, inner], mainlandFeature);
    const pathGenerator = geoPath().projection(projection);

    // Render the full feature (including islands) with the mainland-fitted projection
    const d = pathGenerator(feature);
    return d || "";
  }, [feature, size]);

  if (!allFeatures) {
    return (
      <div className={cn("flex items-center justify-center", className)} style={{ width: size, height: size }}>
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-green border-t-transparent" />
      </div>
    );
  }

  if (!svgPath) {
    return (
      <div className={cn("flex items-center justify-center text-slate-600", className)} style={{ width: size, height: size }}>
        Shape not available
      </div>
    );
  }

  const padding = size * 0.08;

  // Color scheme based on state
  const fillColor = revealed
    ? isCorrect ? "#00e676" : "#ff5252"
    : "#00e676";
  const strokeColor = revealed
    ? isCorrect ? "#69f0ae" : "#ff8a80"
    : "#00c853";
  const fillOpacity = revealed
    ? isCorrect ? 0.85 : 0.75
    : 0.6;
  const glowColor = revealed
    ? isCorrect ? "rgba(0,230,118,0.4)" : "rgba(255,82,82,0.4)"
    : "rgba(0,230,118,0.25)";

  return (
    <div className={cn("relative", className)}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
      >
        {/* Glow filter */}
        <defs>
          <filter id={`glow-${countryCode}`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feFlood floodColor={glowColor} result="color" />
            <feComposite in="color" in2="blur" operator="in" result="shadow" />
            <feMerge>
              <feMergeNode in="shadow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <g transform={`translate(${padding}, ${padding})`}>
          {/* Shadow/glow layer */}
          <path
            d={svgPath}
            fill={fillColor}
            stroke="none"
            opacity={0.15}
            filter={`url(#glow-${countryCode})`}
            className="transition-all duration-500"
          />

          {/* Main fill */}
          <path
            d={svgPath}
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth={2}
            strokeLinejoin="round"
            opacity={fillOpacity}
            className="transition-all duration-500"
          />

          {/* Inner highlight stroke for definition */}
          <path
            d={svgPath}
            fill="none"
            stroke={revealed ? (isCorrect ? "#b9f6ca" : "#ffcdd2") : "#b9f6ca"}
            strokeWidth={0.5}
            strokeLinejoin="round"
            opacity={0.3}
            className="transition-all duration-500"
          />
        </g>
      </svg>
    </div>
  );
}
