"use client";

import { useEffect, useState, useMemo } from "react";
import { geoMercator, geoPath, geoArea } from "d3-geo";
import type {
  FeatureCollection,
  Feature,
  Geometry,
  Polygon,
  MultiPolygon,
} from "geojson";
import { loadCountryFeatures, alpha2ToNumericCode } from "@/lib/geo/geojson-utils";
import { cn } from "@/lib/utils/cn";

function getLargestPolygon(geometry: Geometry): Geometry {
  if (geometry.type !== "MultiPolygon") return geometry;
  const multi = geometry as MultiPolygon;
  if (multi.coordinates.length <= 1) return geometry;

  let largestArea = -1;
  let largestCoords = multi.coordinates[0];
  for (const coords of multi.coordinates) {
    const poly: Polygon = { type: "Polygon", coordinates: coords };
    const area = geoArea(poly);
    if (area > largestArea) {
      largestArea = area;
      largestCoords = coords;
    }
  }
  const totalArea = geoArea(geometry);
  if (largestArea / totalArea > 0.3) {
    return { type: "Polygon", coordinates: largestCoords } as Polygon;
  }
  return geometry;
}

// Cache features across renders
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

interface CountryShapeProps {
  countryCode: string;
  revealed?: boolean;
  isCorrect?: boolean;
  size?: number;
  className?: string;
}

export function CountryShape({
  countryCode,
  revealed = false,
  isCorrect,
  size = 280,
  className,
}: CountryShapeProps) {
  const [allFeatures, setAllFeatures] = useState<FeatureCollection | null>(
    cachedFeatures
  );

  useEffect(() => {
    if (!allFeatures) getFeatures().then(setAllFeatures);
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
    const mainGeom = getLargestPolygon(feature.geometry);
    const mainFeature: Feature<Geometry> = { ...feature, geometry: mainGeom };
    const pad = size * 0.1;
    const inner = size - pad * 2;
    const proj = geoMercator().fitSize([inner, inner], mainFeature);
    const gen = geoPath().projection(proj);
    return gen(feature) || "";
  }, [feature, size]);

  if (!allFeatures) {
    return (
      <div
        className={cn("flex items-center justify-center", className)}
        style={{ width: size, height: size }}
      >
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-green border-t-transparent" />
      </div>
    );
  }

  if (!svgPath) {
    return (
      <div
        className={cn(
          "flex items-center justify-center text-slate-600",
          className
        )}
        style={{ width: size, height: size }}
      >
        Shape not available
      </div>
    );
  }

  const pad = size * 0.1;
  const uid = `shape-${countryCode}`;

  // Simple, reliable color scheme
  let fillColor: string;
  let strokeColor: string;
  let gradInner: string;
  let gradOuter: string;

  if (!revealed) {
    fillColor = "#16a34a";
    strokeColor = "#4ade80";
    gradInner = "#22c55e";
    gradOuter = "#0a3d20";
  } else if (isCorrect) {
    fillColor = "#22c55e";
    strokeColor = "#86efac";
    gradInner = "#4ade80";
    gradOuter = "#064e1e";
  } else {
    fillColor = "#dc2626";
    strokeColor = "#fca5a5";
    gradInner = "#ef4444";
    gradOuter = "#7f1d1d";
  }

  return (
    <div className={cn("relative", className)}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
      >
        <defs>
          <radialGradient
            id={`g-${uid}`}
            cx="50%"
            cy="45%"
            r="60%"
          >
            <stop offset="0%" stopColor={gradInner} stopOpacity={0.9} />
            <stop offset="100%" stopColor={gradOuter} stopOpacity={0.9} />
          </radialGradient>
        </defs>

        <g transform={`translate(${pad}, ${pad})`}>
          {/* Main fill with gradient */}
          <path
            d={svgPath}
            fill={`url(#g-${uid})`}
            stroke={strokeColor}
            strokeWidth={1.5}
            strokeLinejoin="round"
          />
        </g>
      </svg>
    </div>
  );
}
