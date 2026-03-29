"use client";

import { useRef, useEffect, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import * as THREE from "three";
import { useGlobeStore } from "@/hooks/useGlobeStore";
import { CountryBorders } from "./CountryBorders";
import { Atmosphere } from "./Atmosphere";
import { GlobePins } from "./GlobePins";
import { ArcLine } from "./ArcLine";
import { latLngToVector3 } from "@/lib/geo/geojson-utils";

const GLOBE_RADIUS = 2;

function EarthSphere() {
  const material = useMemo(() => {
    return new THREE.MeshPhongMaterial({
      color: new THREE.Color("#060d1f"),
      emissive: new THREE.Color("#020810"),
      emissiveIntensity: 0.3,
      shininess: 15,
    });
  }, []);

  return (
    <mesh material={material}>
      <sphereGeometry args={[GLOBE_RADIUS, 64, 64]} />
    </mesh>
  );
}

function GlobeGrid() {
  const geometry = useMemo(() => {
    const points: THREE.Vector3[] = [];
    const r = GLOBE_RADIUS + 0.002;

    for (let lat = -60; lat <= 60; lat += 30) {
      for (let lng = 0; lng <= 360; lng += 2) {
        const [x1, y1, z1] = latLngToVector3(lat, lng, r);
        const [x2, y2, z2] = latLngToVector3(lat, lng + 2, r);
        points.push(new THREE.Vector3(x1, y1, z1));
        points.push(new THREE.Vector3(x2, y2, z2));
      }
    }

    for (let lng = 0; lng < 360; lng += 30) {
      for (let lat = -90; lat < 90; lat += 2) {
        const [x1, y1, z1] = latLngToVector3(lat, lng, r);
        const [x2, y2, z2] = latLngToVector3(lat + 2, lng, r);
        points.push(new THREE.Vector3(x1, y1, z1));
        points.push(new THREE.Vector3(x2, y2, z2));
      }
    }

    return new THREE.BufferGeometry().setFromPoints(points);
  }, []);

  return (
    <lineSegments geometry={geometry}>
      <lineBasicMaterial color="#145530" transparent opacity={0.3} />
    </lineSegments>
  );
}

function CameraController() {
  const { camera } = useThree();
  const flyTarget = useGlobeStore((s) => s.flyTarget);
  const targetRef = useRef<THREE.Vector3 | null>(null);
  const progressRef = useRef(1);

  useEffect(() => {
    if (flyTarget) {
      const [x, y, z] = latLngToVector3(flyTarget.lat, flyTarget.lng, 4.5);
      targetRef.current = new THREE.Vector3(x, y, z);
      progressRef.current = 0;
    }
  }, [flyTarget]);

  useFrame(() => {
    if (targetRef.current && progressRef.current < 1) {
      progressRef.current = Math.min(progressRef.current + 0.015, 1);
      const t = easeInOutCubic(progressRef.current);
      camera.position.lerp(targetRef.current, t * 0.05);
      camera.lookAt(0, 0, 0);
      if (progressRef.current >= 1) {
        targetRef.current = null;
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
      <ambientLight intensity={0.1} />
      <directionalLight position={[5, 3, 5]} intensity={0.8} color="#e0ffe0" />
      <directionalLight position={[-3, -1, -3]} intensity={0.2} color="#00e676" />
      <pointLight position={[0, 5, 0]} intensity={0.15} color="#00e676" />

      <EarthSphere />
      <GlobeGrid />
      <CountryBorders radius={GLOBE_RADIUS} />
      <Atmosphere radius={GLOBE_RADIUS} />

      {arcs.map((arc, i) => (
        <ArcLine key={i} from={arc.from} to={arc.to} radius={GLOBE_RADIUS} />
      ))}

      <GlobePins radius={GLOBE_RADIUS} />

      <Stars
        radius={80}
        depth={60}
        count={3000}
        factor={3}
        saturation={0}
        fade
        speed={0.2}
      />

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
