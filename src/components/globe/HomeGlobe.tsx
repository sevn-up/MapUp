"use client";

import { useRef, useState, useMemo, useCallback } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Stars, Html } from "@react-three/drei";
import * as THREE from "three";
import { Suspense } from "react";
import { useRouter } from "next/navigation";
import { CountryBorders } from "./CountryBorders";
import { Atmosphere } from "./Atmosphere";
import { latLngToVector3 } from "@/lib/geo/geojson-utils";

const GLOBE_RADIUS = 2;

interface GamePin {
  id: string;
  label: string;
  description: string;
  href: string;
  lat: number;
  lng: number;
  ready: boolean;
}

const gamePins: GamePin[] = [
  {
    id: "country-shape",
    label: "Shape Quiz",
    description: "Identify countries by silhouette",
    href: "/country-shape",
    lat: 48.8,
    lng: 2.35, // Paris, Europe
    ready: true,
  },
  {
    id: "name-all",
    label: "Name All",
    description: "Name 197 countries",
    href: "/name-all",
    lat: -1.3,
    lng: 36.8, // Nairobi, Africa
    ready: false,
  },
  {
    id: "worldle",
    label: "Worldle",
    description: "Daily country puzzle",
    href: "/worldle",
    lat: 35.7,
    lng: 139.7, // Tokyo, Asia
    ready: false,
  },
  {
    id: "street-view",
    label: "Street View",
    description: "Guess the location",
    href: "/street-view",
    lat: -22.9,
    lng: -43.2, // Rio, South America
    ready: false,
  },
];

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

function GamePinMarker({
  pin,
  onSelect,
}: {
  pin: GamePin;
  onSelect: (pin: GamePin) => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const position = useMemo(
    () => latLngToVector3(pin.lat, pin.lng, GLOBE_RADIUS + 0.04),
    [pin.lat, pin.lng]
  );

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.lookAt(0, 0, 0);
      // Gentle float
      const t = state.clock.elapsedTime;
      meshRef.current.position.set(
        position[0],
        position[1] + Math.sin(t * 1.5 + pin.lat) * 0.015,
        position[2]
      );
    }
    if (ringRef.current) {
      ringRef.current.lookAt(0, 0, 0);
      // Pulsing ring
      const scale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.15;
      ringRef.current.scale.set(scale, scale, 1);
    }
  });

  return (
    <group>
      {/* Glowing dot */}
      <mesh
        ref={meshRef}
        position={position}
        onClick={() => onSelect(pin)}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <sphereGeometry args={[hovered ? 0.06 : 0.04, 16, 16]} />
        <meshBasicMaterial
          color={pin.ready ? "#00e676" : "#334155"}
          transparent
          opacity={pin.ready ? 1 : 0.6}
        />
      </mesh>

      {/* Pulse ring */}
      {pin.ready && (
        <mesh ref={ringRef} position={position}>
          <ringGeometry args={[0.05, 0.07, 32]} />
          <meshBasicMaterial
            color="#00e676"
            transparent
            opacity={0.3}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {/* Label */}
      <Html
        position={position}
        center
        style={{
          pointerEvents: hovered ? "auto" : "none",
          transition: "all 0.2s ease",
        }}
        distanceFactor={5}
      >
        <div
          onClick={() => onSelect(pin)}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          className={`
            cursor-pointer select-none whitespace-nowrap rounded-lg px-3 py-1.5
            text-center transition-all duration-200
            ${
              hovered
                ? "scale-110 bg-navy-light/95 border border-green/40 shadow-[0_0_20px_rgba(0,230,118,0.2)]"
                : "bg-navy/80 border border-green/10"
            }
          `}
          style={{ transform: "translateY(-30px)" }}
        >
          <div
            className={`text-xs font-bold ${pin.ready ? "text-green" : "text-slate-500"}`}
          >
            {pin.label}
          </div>
          {hovered && (
            <div className="mt-0.5 text-[10px] text-slate-400">
              {pin.ready ? pin.description : "Coming soon"}
            </div>
          )}
        </div>
      </Html>
    </group>
  );
}

function HomeGlobeScene({
  onSelectGame,
}: {
  onSelectGame: (pin: GamePin) => void;
}) {
  return (
    <>
      <ambientLight intensity={0.1} />
      <directionalLight position={[5, 3, 5]} intensity={0.8} color="#e0ffe0" />
      <directionalLight
        position={[-3, -1, -3]}
        intensity={0.2}
        color="#00e676"
      />
      <pointLight position={[0, 5, 0]} intensity={0.15} color="#00e676" />

      <EarthSphere />
      <GlobeGrid />
      <CountryBorders radius={GLOBE_RADIUS} />
      <Atmosphere radius={GLOBE_RADIUS} />

      {gamePins.map((pin) => (
        <GamePinMarker key={pin.id} pin={pin} onSelect={onSelectGame} />
      ))}

      <Stars
        radius={80}
        depth={60}
        count={3000}
        factor={3}
        saturation={0}
        fade
        speed={0.2}
      />

      <OrbitControls
        enablePan={false}
        enableZoom={true}
        minDistance={3}
        maxDistance={10}
        autoRotate
        autoRotateSpeed={0.5}
        dampingFactor={0.08}
        enableDamping
        rotateSpeed={0.5}
      />
    </>
  );
}

export function HomeGlobe() {
  const router = useRouter();

  const handleSelectGame = useCallback(
    (pin: GamePin) => {
      router.push(pin.href);
    },
    [router]
  );

  return (
    <Canvas
      camera={{ position: [0, 1.5, 4.5], fov: 45 }}
      style={{ background: "transparent" }}
      gl={{ antialias: true, alpha: true }}
      dpr={[1, 2]}
    >
      <Suspense fallback={null}>
        <HomeGlobeScene onSelectGame={handleSelectGame} />
      </Suspense>
    </Canvas>
  );
}
