"use client";

import { useEffect, useState, useMemo } from "react";
import { geoMercator, geoPath, geoArea } from "d3-geo";
import type { FeatureCollection, Feature, Geometry, Polygon, MultiPolygon } from "geojson";
import { loadCountryFeatures, alpha2ToNumericCode } from "@/lib/geo/geojson-utils";
import { cn } from "@/lib/utils/cn";

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

  const totalArea = geoArea(geometry);
  if (largestArea / totalArea > 0.3) {
    return { type: "Polygon", coordinates: largestCoords } as Polygon;
  }
  return geometry;
}

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
  const [allFeatures, setAllFeatures] = useState<FeatureCollection | null>(cachedFeatures);

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
    const mainlandGeometry = getLargestPolygon(feature.geometry);
    const mainlandFeature: Feature<Geometry> = { ...feature, geometry: mainlandGeometry };
    const padding = size * 0.1;
    const inner = size - padding * 2;
    const projection = geoMercator().fitSize([inner, inner], mainlandFeature);
    const pathGenerator = geoPath().projection(projection);
    return pathGenerator(feature) || "";
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

  const padding = size * 0.1;
  const uid = `cs-${countryCode}`;

  // Color scheme based on state
  const gradientColors = revealed
    ? isCorrect
      ? { outer: "#064e1e", mid: "#16a34a", inner: "#4ade80" }
      : { outer: "#7f1d1d", mid: "#dc2626", inner: "#fca5a5" }
    : { outer: "#052e16", mid: "#15803d", inner: "#86efac" };

  const borderColor = revealed
    ? isCorrect ? "#4ade80" : "#fca5a5"
    : "#22c55e";

  return (
    <div className={cn("relative", className)}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <defs>
          {/* Radial gradient for elevation effect */}
          <radialGradient id={`grad-${uid}`} cx="50%" cy="45%" r="55%" fx="45%" fy="40%">
            <stop offset="0%" stopColor={gradientColors.inner} />
            <stop offset="50%" stopColor={gradientColors.mid} />
            <stop offset="100%" stopColor={gradientColors.outer} />
          </radialGradient>

          {/* Noise filter for terrain texture */}
          <filter id={`noise-${uid}`} x="0%" y="0%" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" result="noise" />
            <feColorMatrix type="saturate" values="0" in="noise" result="grayNoise" />
            <feBlend in="SourceGraphic" in2="grayNoise" mode="soft-light" result="textured" />
            <feComposite in="textured" in2="SourceGraphic" operator="in" />
          </filter>

          {/* Inner shadow for depth */}
          <filter id={`shadow-${uid}`} x="-10%" y="-10%" width="120%" height="120%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="6" result="blur" />
            <feOffset dx="0" dy="2" result="offsetBlur" />
            <feFlood floodColor="#000000" floodOpacity="0.4" result="shadowColor" />
            <feComposite in="shadowColor" in2="offsetBlur" operator="in" result="shadow" />
            <feMerge>
              <feMergeNode in="shadow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Outer glow */}
          <filter id={`glow-${uid}`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <g transform={`translate(${padding}, ${padding})`}>
          {/* Outer glow layer */}
          <path
            d={svgPath}
            fill={borderColor}
            opacity={0.15}
            filter={`url(#glow-${uid})`}
          />

          {/* Main fill with gradient + noise texture */}
          <path
            d={svgPath}
            fill={`url(#grad-${uid})`}
            filter={`url(#noise-${uid})`}
            className="transition-all duration-500"
          />

          {/* Inner shadow overlay */}
          <path
            d={svgPath}
            fill={`url(#grad-${uid})`}
            filter={`url(#shadow-${uid})`}
            opacity={0.8}
            className="transition-all duration-500"
          />

          {/* Border outline */}
          <path
            d={svgPath}
            fill="none"
            stroke={borderColor}
            strokeWidth={1.5}
            strokeLinejoin="round"
            opacity={0.8}
          />
        </g>
      </svg>
    </div>
  );
}
