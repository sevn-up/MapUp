"use client";

import { useRef, useCallback, useEffect, useState } from "react";
import Map, { Marker, Source, Layer, type MapRef } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";

interface CompletedRound {
  guess: { lat: number; lng: number };
  actual: { lat: number; lng: number };
  score: number;
}

interface GuessMapProps {
  onGuess: (lat: number, lng: number) => void;
  guessPosition: { lat: number; lng: number } | null;
  actualPosition?: { lat: number; lng: number } | null;
  revealed?: boolean;
  completedRounds?: CompletedRound[];
  interactive?: boolean;
  className?: string;
}

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
const DARK_STYLE = "mapbox://styles/mapbox/dark-v11";

export function GuessMap({
  onGuess,
  guessPosition,
  actualPosition,
  revealed,
  completedRounds,
  interactive = true,
  className,
}: GuessMapProps) {
  const mapRef = useRef<MapRef>(null);
  const [viewState, setViewState] = useState({
    longitude: 0,
    latitude: 20,
    zoom: 1.5,
  });

  const handleClick = useCallback(
    (e: { lngLat: { lat: number; lng: number } }) => {
      if (revealed || !interactive) return;
      onGuess(e.lngLat.lat, e.lngLat.lng);
    },
    [onGuess, revealed, interactive]
  );

  // Fit bounds to show both pins on reveal
  useEffect(() => {
    if (revealed && guessPosition && actualPosition && mapRef.current) {
      const bounds = [
        [
          Math.min(guessPosition.lng, actualPosition.lng) - 5,
          Math.min(guessPosition.lat, actualPosition.lat) - 5,
        ],
        [
          Math.max(guessPosition.lng, actualPosition.lng) + 5,
          Math.max(guessPosition.lat, actualPosition.lat) + 5,
        ],
      ] as [[number, number], [number, number]];

      mapRef.current.fitBounds(bounds, { padding: 60, duration: 1000 });
    }
  }, [revealed, guessPosition, actualPosition]);

  // Line between guess and actual
  const lineGeoJson = revealed && guessPosition && actualPosition
    ? {
        type: "Feature" as const,
        properties: {},
        geometry: {
          type: "LineString" as const,
          coordinates: [
            [guessPosition.lng, guessPosition.lat],
            [actualPosition.lng, actualPosition.lat],
          ],
        },
      }
    : null;

  if (!MAPBOX_TOKEN) {
    return (
      <div className={`flex items-center justify-center bg-navy-card ${className || ""}`}>
        <div className="text-center p-4">
          <p className="text-slate-400 text-sm">Mapbox token not configured</p>
          <p className="text-slate-600 text-xs mt-1">
            Set NEXT_PUBLIC_MAPBOX_TOKEN in .env.local
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <Map
        ref={mapRef}
        {...viewState}
        onMove={(e) => setViewState(e.viewState)}
        onClick={handleClick}
        mapboxAccessToken={MAPBOX_TOKEN}
        mapStyle={DARK_STYLE}
        projection={{ name: "globe" }}
        cursor={revealed || !interactive ? "default" : "crosshair"}
        style={{ width: "100%", height: "100%" }}
        fog={{
          color: "#0a1929",
          "high-color": "#0d2137",
          "horizon-blend": 0.02,
          "space-color": "#0a1929",
          "star-intensity": 0.3,
        }}
      >
        {/* Guess pin */}
        {guessPosition && (
          <Marker
            latitude={guessPosition.lat}
            longitude={guessPosition.lng}
            anchor="bottom"
          >
            <div className="flex flex-col items-center">
              <div className="h-6 w-6 rounded-full border-2 border-white bg-green shadow-lg shadow-green/30" />
              <div className="h-2 w-0.5 bg-white" />
            </div>
          </Marker>
        )}

        {/* Actual position pin (on reveal) */}
        {revealed && actualPosition && (
          <Marker
            latitude={actualPosition.lat}
            longitude={actualPosition.lng}
            anchor="bottom"
          >
            <div className="flex flex-col items-center">
              <div className="h-6 w-6 rounded-full border-2 border-white bg-red-500 shadow-lg shadow-red-500/30" />
              <div className="h-2 w-0.5 bg-white" />
            </div>
          </Marker>
        )}

        {/* Distance line on reveal */}
        {lineGeoJson && (
          <Source type="geojson" data={lineGeoJson}>
            <Layer
              id="distance-line"
              type="line"
              paint={{
                "line-color": "#ffffff",
                "line-width": 2,
                "line-dasharray": [2, 2],
                "line-opacity": 0.7,
              }}
            />
          </Source>
        )}

        {/* All completed rounds (results view) */}
        {completedRounds && completedRounds.map((r, i) => (
          <Marker key={`guess-${i}`} latitude={r.guess.lat} longitude={r.guess.lng} anchor="center">
            <div className="flex items-center justify-center h-5 w-5 rounded-full border-2 border-white bg-green text-[9px] font-bold text-navy">
              {i + 1}
            </div>
          </Marker>
        ))}
        {completedRounds && completedRounds.map((r, i) => (
          <Marker key={`actual-${i}`} latitude={r.actual.lat} longitude={r.actual.lng} anchor="center">
            <div className="flex items-center justify-center h-5 w-5 rounded-full border-2 border-white bg-red-500 text-[9px] font-bold text-white">
              {i + 1}
            </div>
          </Marker>
        ))}
        {completedRounds && (
          <Source
            type="geojson"
            data={{
              type: "FeatureCollection" as const,
              features: completedRounds.map((r) => ({
                type: "Feature" as const,
                properties: {},
                geometry: {
                  type: "LineString" as const,
                  coordinates: [
                    [r.guess.lng, r.guess.lat],
                    [r.actual.lng, r.actual.lat],
                  ],
                },
              })),
            }}
          >
            <Layer
              id="completed-lines"
              type="line"
              paint={{
                "line-color": "#ffffff",
                "line-width": 1.5,
                "line-dasharray": [2, 2],
                "line-opacity": 0.5,
              }}
            />
          </Source>
        )}
      </Map>
    </div>
  );
}
