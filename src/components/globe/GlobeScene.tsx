"use client";

import { useRef, useEffect, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import * as THREE from "three";
import { useGlobeStore } from "@/hooks/useGlobeStore";
import { CountryBorders } from "./CountryBorders";
import { Atmosphere } from "./Atmosphere";
import { ArcLine } from "./ArcLine";
import { latLngToVector3 } from "@/lib/geo/geojson-utils";

const GLOBE_RADIUS = 2;

/**
 * Ocean sphere — matte dark, no specular
 */
function OceanSphere() {
  const material = useMemo(() => {
    return new THREE.MeshLambertMaterial({
      color: new THREE.Color("#080e18"),
      emissive: new THREE.Color("#030608"),
      emissiveIntensity: 0.5,
    });
  }, []);

  return (
    <mesh material={material}>
      <sphereGeometry args={[GLOBE_RADIUS, 64, 64]} />
    </mesh>
  );
}

/**
 * Subtle lat/lng grid lines for depth
 */
function GlobeGrid() {
  const geometry = useMemo(() => {
    const points: THREE.Vector3[] = [];
    const r = GLOBE_RADIUS + 0.001;

    // Latitude lines every 30 degrees
    for (let lat = -60; lat <= 60; lat += 30) {
      for (let lng = 0; lng <= 360; lng += 3) {
        const [x1, y1, z1] = latLngToVector3(lat, lng, r);
        const [x2, y2, z2] = latLngToVector3(lat, lng + 3, r);
        points.push(new THREE.Vector3(x1, y1, z1));
        points.push(new THREE.Vector3(x2, y2, z2));
      }
    }

    // Longitude lines every 30 degrees
    for (let lng = 0; lng < 360; lng += 30) {
      for (let lat = -90; lat < 90; lat += 3) {
        const [x1, y1, z1] = latLngToVector3(lat, lng, r);
        const [x2, y2, z2] = latLngToVector3(lat + 3, lng, r);
        points.push(new THREE.Vector3(x1, y1, z1));
        points.push(new THREE.Vector3(x2, y2, z2));
      }
    }

    return new THREE.BufferGeometry().setFromPoints(points);
  }, []);

  return (
    <lineSegments geometry={geometry}>
      <lineBasicMaterial color="#1a2a40" transparent opacity={0.2} />
    </lineSegments>
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
  const arcs = useGlobeStore((s) => s.arcs);

  return (
    <>
      {/* Lighting — even, no harsh shadows */}
      <ambientLight intensity={0.4} color="#c0d0e0" />
      <directionalLight position={[5, 3, 5]} intensity={0.6} color="#ffffff" />
      <directionalLight position={[-5, -3, -5]} intensity={0.3} color="#ffffff" />

      {/* Globe */}
      <OceanSphere />
      <GlobeGrid />
      <CountryBorders radius={GLOBE_RADIUS} />
      <Atmosphere radius={GLOBE_RADIUS} />

      {/* Arcs */}
      {arcs.map((arc, i) => (
        <ArcLine key={i} from={arc.from} to={arc.to} radius={GLOBE_RADIUS} />
      ))}

      {/* Stars — dimmer, more ambient */}
      <Stars
        radius={80}
        depth={60}
        count={2500}
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
      />
    </>
  );
}
