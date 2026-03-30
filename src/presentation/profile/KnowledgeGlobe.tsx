"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stars, useTexture } from "@react-three/drei";
import * as THREE from "three";
import { Suspense, useMemo } from "react";
import { Atmosphere } from "@/presentation/globe/Atmosphere";
import {
  extractRings,
  extractOuterRings,
  buildLineGeometry,
  buildFillLines,
} from "@/presentation/globe/geoUtils";
import { useGlobeStyle, getTexturePath } from "@/application/useGlobeStyle";
import { loadCountryFeatures, numericToAlpha2, resolveUndefinedFeature } from "@/infrastructure/geojson";
import { useEffect, useState } from "react";
import type { FeatureCollection } from "geojson";

const GLOBE_RADIUS = 2;

interface KnowledgeGlobeProps {
  countryAccuracy: Map<string, { correct: number; total: number }>;
  className?: string;
}

function accuracyColor(correct: number, total: number): string {
  const ratio = total > 0 ? correct / total : 0;
  if (ratio >= 0.8) return "#00e676";  // mastered
  if (ratio >= 0.6) return "#69f0ae";  // good
  if (ratio >= 0.3) return "#ffab40";  // learning
  return "#ff5252";                     // weak
}

function TexturedEarthSphere({ texturePath }: { texturePath: string }) {
  const texture = useTexture(texturePath);
  const material = useMemo(() => {
    texture.colorSpace = THREE.SRGBColorSpace;
    return new THREE.MeshStandardMaterial({ map: texture, roughness: 0.9, metalness: 0.05 });
  }, [texture]);
  return (
    <mesh material={material}>
      <sphereGeometry args={[GLOBE_RADIUS, 64, 64]} />
    </mesh>
  );
}

function EarthSphere() {
  const style = useGlobeStyle((s) => s.style);
  const texturePath = getTexturePath(style);

  if (!texturePath) {
    return (
      <mesh>
        <sphereGeometry args={[GLOBE_RADIUS, 32, 32]} />
        <meshBasicMaterial color="#0a1929" />
      </mesh>
    );
  }
  return <TexturedEarthSphere texturePath={texturePath} />;
}

/**
 * Standalone country borders for the knowledge globe — doesn't use the shared globe store.
 * Highlights countries based on the countryCounts prop with solid mesh fill.
 */
function KnowledgeBorders({ countryAccuracy }: { countryAccuracy: Map<string, { correct: number; total: number }> }) {
  const [features, setFeatures] = useState<FeatureCollection | null>(null);

  useEffect(() => {
    loadCountryFeatures("50m").then(setFeatures);
  }, []);

  const { defaultGeo, highlightedItems } = useMemo(() => {
    if (!features)
      return {
        defaultGeo: null,
        highlightedItems: [] as { fillGeo: THREE.BufferGeometry; borderGeo: THREE.BufferGeometry; color: string }[],
      };

    const defaultRings: import("geojson").Position[][] = [];
    const hlItems: { fillGeo: THREE.BufferGeometry; borderGeo: THREE.BufferGeometry; color: string }[] = [];

    for (const feature of features.features) {
      const numId = feature.id?.toString() ?? "";
      const alpha2 = numId
        ? numericToAlpha2(numId)
        : resolveUndefinedFeature(feature.geometry as { type: string; coordinates: number[][][] | number[][][][] });
      const acc = alpha2 ? countryAccuracy.get(alpha2) : undefined;

      if (acc && acc.total > 0) {
        const color = accuracyColor(acc.correct, acc.total);

        const rings = extractRings(feature.geometry);
        const outerRings = extractOuterRings(feature.geometry);
        const fillGeo = buildFillLines(outerRings, GLOBE_RADIUS + 0.004);
        const borderGeo = buildLineGeometry(rings, GLOBE_RADIUS + 0.005);
        hlItems.push({ fillGeo, borderGeo, color });
      } else {
        const rings = extractRings(feature.geometry);
        defaultRings.push(...rings);
      }
    }

    return {
      defaultGeo: buildLineGeometry(defaultRings, GLOBE_RADIUS + 0.003),
      highlightedItems: hlItems,
    };
  }, [features, countryAccuracy]);

  if (!features) return null;

  return (
    <group>
      {defaultGeo && (
        <lineSegments geometry={defaultGeo}>
          <lineBasicMaterial color="#4ade80" transparent opacity={0.25} />
        </lineSegments>
      )}
      {highlightedItems.map((item, i) => (
        <group key={i}>
          <lineSegments geometry={item.fillGeo}>
            <lineBasicMaterial color={item.color} transparent opacity={0.5} />
          </lineSegments>
          <lineSegments geometry={item.borderGeo}>
            <lineBasicMaterial color={item.color} transparent opacity={0.8} />
          </lineSegments>
        </group>
      ))}
    </group>
  );
}

function KnowledgeGlobeScene({ countryAccuracy }: { countryAccuracy: Map<string, { correct: number; total: number }> }) {
  return (
    <>
      <ambientLight intensity={1.0} />
      <directionalLight position={[5, 3, 5]} intensity={1.0} />
      <directionalLight position={[-5, -3, -5]} intensity={0.5} />

      <EarthSphere />
      <KnowledgeBorders countryAccuracy={countryAccuracy} />
      <Atmosphere radius={GLOBE_RADIUS} />

      <Stars radius={80} depth={60} count={1500} factor={3} saturation={0} fade speed={0.1} />

      <OrbitControls
        enablePan={false}
        enableZoom={false}
        autoRotate
        autoRotateSpeed={0.3}
        dampingFactor={0.08}
        enableDamping
        rotateSpeed={0.5}
      />
    </>
  );
}

export function KnowledgeGlobe({ countryAccuracy, className }: KnowledgeGlobeProps) {
  // Count mastered countries (>80% accuracy)
  let mastered = 0;
  for (const [, acc] of countryAccuracy) {
    if (acc.total > 0 && acc.correct / acc.total >= 0.8) mastered++;
  }

  return (
    <div className={className}>
      <div className="relative h-[300px] w-full rounded-2xl border border-green/10 bg-navy-card overflow-hidden">
        <Canvas
          camera={{ position: [0, 0, 4.5], fov: 45 }}
          style={{ background: "transparent" }}
          gl={{ antialias: true, alpha: true }}
          dpr={[1, 2]}
        >
          <Suspense fallback={null}>
            <KnowledgeGlobeScene countryAccuracy={countryAccuracy} />
          </Suspense>
        </Canvas>

        <div className="absolute bottom-3 left-3 rounded-lg bg-navy/80 px-3 py-1.5 backdrop-blur-sm border border-green/20">
          <span className="text-lg font-bold text-green">{mastered}</span>
          <span className="text-sm text-slate-400">/197 mastered</span>
        </div>
        <div className="absolute bottom-3 right-3 flex gap-2 text-[10px]">
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-[#ff5252]" />Weak</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-[#ffab40]" />Learning</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-[#69f0ae]" />Good</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-[#00e676]" />Mastered</span>
        </div>
      </div>
    </div>
  );
}
