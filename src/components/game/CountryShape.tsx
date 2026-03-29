"use client";

import { useEffect, useState, useMemo } from "react";
import { geoMercator, geoPath } from "d3-geo";
import type { FeatureCollection, Feature, Geometry } from "geojson";
import { loadCountryFeatures, alpha2ToNumericCode } from "@/lib/geo/geojson-utils";
import { cn } from "@/lib/utils/cn";

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
  const [allFeatures, setAllFeatures] = useState<FeatureCollection | null>(null);

  useEffect(() => {
    loadCountryFeatures("50m").then(setAllFeatures);
  }, []);

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
    const projection = geoMercator().fitSize([size, size], feature);
    const pathGenerator = geoPath().projection(projection);
    return pathGenerator(feature) || "";
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
        className={cn("flex items-center justify-center text-slate-600", className)}
        style={{ width: size, height: size }}
      >
        Shape not available
      </div>
    );
  }

  const fillColor = revealed
    ? isCorrect
      ? "#00e676"
      : "#ff5252"
    : "#00e676";

  const strokeColor = revealed
    ? isCorrect
      ? "#69f0ae"
      : "#ff8a80"
    : "#69f0ae";

  return (
    <div className={cn("relative", className)}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{ filter: revealed ? undefined : "drop-shadow(0 0 12px rgba(0,230,118,0.2))" }}
      >
        <path
          d={svgPath}
          fill={fillColor}
          stroke={strokeColor}
          strokeWidth={1.5}
          opacity={revealed ? 0.9 : 0.7}
          className="transition-all duration-500"
        />
      </svg>
    </div>
  );
}
