"use client";

import { useRef, useEffect, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Stars, useTexture } from "@react-three/drei";
import * as THREE from "three";
import { useGlobeStore } from "@/hooks/useGlobeStore";
import { CountryBorders } from "./CountryBorders";
import { Atmosphere } from "./Atmosphere";
import { ArcLine } from "./ArcLine";
import { latLngToVector3 } from "@/lib/geo/geojson-utils";

const GLOBE_RADIUS = 2;

function EarthSphere() {
  const texture = useTexture("/textures/earth-dark.jpg");

  const material = useMemo(() => {
    texture.colorSpace = THREE.SRGBColorSpace;
    return new THREE.MeshStandardMaterial({
      map: texture,
      roughness: 0.9,
      metalness: 0.05,
    });
  }, [texture]);

  return (
    <mesh material={material}>
      <sphereGeometry args={[GLOBE_RADIUS, 64, 64]} />
    </mesh>
  );
}

function CameraController() {
  const { camera } = useThree();
  const flyTarget = useGlobeStore((s) => s.flyTarget);
  const targetRef = useRef<THREE.Vector3 | null>(null);
  const startRef = useRef<THREE.Vector3 | null>(null);
  const progressRef = useRef(1);

  useEffect(() => {
    if (flyTarget) {
      const [x, y, z] = latLngToVector3(flyTarget.lat, flyTarget.lng, 4.2);
      targetRef.current = new THREE.Vector3(x, y, z);
      startRef.current = camera.position.clone();
      progressRef.current = 0;
    }
  }, [flyTarget, camera]);

  useFrame((_, delta) => {
    if (targetRef.current && startRef.current && progressRef.current < 1) {
      progressRef.current = Math.min(progressRef.current + delta * 0.9, 1);
      const t = easeInOutCubic(progressRef.current);
      camera.position.lerpVectors(startRef.current, targetRef.current, t);
      camera.lookAt(0, 0, 0);
      if (progressRef.current >= 1) {
        targetRef.current = null;
        startRef.current = null;
      }
    }
  });

  return null;
}

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export function GlobeScene() {
  const autoRotate = useGlobeStore((s) => s.autoRotate);
  const setAutoRotate = useGlobeStore((s) => s.setAutoRotate);
  const arcs = useGlobeStore((s) => s.arcs);

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 3, 5]} intensity={0.8} color="#ffffff" />
      <directionalLight position={[-5, -3, -5]} intensity={0.3} color="#ffffff" />

      {/* Textured Earth */}
      <EarthSphere />
      <CountryBorders radius={GLOBE_RADIUS} />
      <Atmosphere radius={GLOBE_RADIUS} />

      {/* Arcs */}
      {arcs.map((arc, i) => (
        <ArcLine key={i} from={arc.from} to={arc.to} radius={GLOBE_RADIUS} />
      ))}

      {/* Stars */}
      <Stars
        radius={80}
        depth={60}
        count={2000}
        factor={3}
        saturation={0.1}
        fade
        speed={0.15}
      />

      {/* Controls */}
      <CameraController />
      <OrbitControls
        enablePan={false}
        enableZoom={true}
        minDistance={2.8}
        maxDistance={12}
        autoRotate={autoRotate}
        autoRotateSpeed={0.4}
        dampingFactor={0.08}
        enableDamping
        rotateSpeed={0.5}
        onStart={() => { if (autoRotate) setAutoRotate(false); }}
      />
    </>
  );
}
