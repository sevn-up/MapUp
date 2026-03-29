"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stars, useTexture } from "@react-three/drei";
import * as THREE from "three";
import { Suspense, useMemo } from "react";
import { Atmosphere } from "@/presentation/globe/Atmosphere";
import { latLngToVector3, loadCountryFeatures, numericToAlpha2 } from "@/infrastructure/geojson";
import { useEffect, useState } from "react";
import type { FeatureCollection, Geometry, Position } from "geojson";

const GLOBE_RADIUS = 2;

interface KnowledgeGlobeProps {
  countryCounts: Map<string, number>;
  totalDiscovered: number;
  className?: string;
}

function EarthSphere() {
  const texture = useTexture("/textures/earth-dark.jpg");
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

function extractRings(geometry: Geometry): Position[][] {
  const rings: Position[][] = [];
  switch (geometry.type) {
    case "Polygon":
      (geometry as { coordinates: Position[][] }).coordinates.forEach((r) => rings.push(r));
      break;
    case "MultiPolygon":
      (geometry as { coordinates: Position[][][] }).coordinates.forEach((p) => p.forEach((r) => rings.push(r)));
      break;
  }
  return rings;
}

function buildLineGeometry(rings: Position[][], radius: number): THREE.BufferGeometry {
  const points: THREE.Vector3[] = [];
  for (const ring of rings) {
    const verts = ring.map(([lng, lat]) => {
      const [x, y, z] = latLngToVector3(lat, lng, radius);
      return new THREE.Vector3(x, y, z);
    });
    for (let i = 0; i < verts.length - 1; i++) {
      points.push(verts[i], verts[i + 1]);
    }
  }
  return new THREE.BufferGeometry().setFromPoints(points);
}

/**
 * Standalone country borders for the knowledge globe — doesn't use the shared globe store.
 * Highlights countries based on the countryCounts prop.
 */
function KnowledgeBorders({ countryCounts }: { countryCounts: Map<string, number> }) {
  const [features, setFeatures] = useState<FeatureCollection | null>(null);

  useEffect(() => {
    loadCountryFeatures("110m").then(setFeatures);
  }, []);

  const { defaultGeo, highlightedItems } = useMemo(() => {
    if (!features) return { defaultGeo: null, highlightedItems: [] as { geo: THREE.BufferGeometry; color: string }[] };

    const defaultRings: Position[][] = [];
    const hlItems: { geo: THREE.BufferGeometry; color: string }[] = [];

    for (const feature of features.features) {
      const numId = feature.id?.toString() ?? "";
      const alpha2 = numericToAlpha2(numId);
      const count = alpha2 ? countryCounts.get(alpha2) : undefined;
      const rings = extractRings(feature.geometry);

      if (count && count > 0) {
        const intensity = Math.min(count / 5, 1);
        const g = Math.round(80 + intensity * 150);
        const color = `rgb(0, ${g}, ${Math.round(40 + intensity * 60)})`;
        hlItems.push({ geo: buildLineGeometry(rings, GLOBE_RADIUS + 0.005), color });
      } else {
        defaultRings.push(...rings);
      }
    }

    return { defaultGeo: buildLineGeometry(defaultRings, GLOBE_RADIUS + 0.003), highlightedItems: hlItems };
  }, [features, countryCounts]);

  if (!features) return null;

  return (
    <group>
      {defaultGeo && (
        <lineSegments geometry={defaultGeo}>
          <lineBasicMaterial color="#4ade80" transparent opacity={0.25} />
        </lineSegments>
      )}
      {highlightedItems.map((item, i) => (
        <lineSegments key={i} geometry={item.geo}>
          <lineBasicMaterial color={item.color} transparent opacity={0.8} />
        </lineSegments>
      ))}
    </group>
  );
}

function KnowledgeGlobeScene({ countryCounts }: { countryCounts: Map<string, number> }) {
  return (
    <>
      <ambientLight intensity={1.0} />
      <directionalLight position={[5, 3, 5]} intensity={1.0} />
      <directionalLight position={[-5, -3, -5]} intensity={0.5} />

      <EarthSphere />
      <KnowledgeBorders countryCounts={countryCounts} />
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

export function KnowledgeGlobe({ countryCounts, totalDiscovered, className }: KnowledgeGlobeProps) {
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
            <KnowledgeGlobeScene countryCounts={countryCounts} />
          </Suspense>
        </Canvas>

        <div className="absolute bottom-3 left-3 rounded-lg bg-navy/80 px-3 py-1.5 backdrop-blur-sm border border-green/20">
          <span className="text-lg font-bold text-green">{totalDiscovered}</span>
          <span className="text-sm text-slate-400">/197 discovered</span>
        </div>
      </div>
    </div>
  );
}
