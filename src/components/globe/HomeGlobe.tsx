"use client";

import { useRef, useState, useMemo, useCallback, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
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
  { id: "country-shape", label: "Shape Quiz", description: "Identify countries by silhouette", href: "/country-shape", lat: 48.8, lng: 2.35, ready: true },
  { id: "name-all", label: "Name All", description: "Name 197 countries", href: "/name-all", lat: -1.3, lng: 36.8, ready: true },
  { id: "worldle", label: "Worldle", description: "Daily country puzzle", href: "/worldle", lat: 35.7, lng: 139.7, ready: false },
  { id: "street-view", label: "Street View", description: "Guess the location", href: "/street-view", lat: -22.9, lng: -43.2, ready: false },
];

function EarthSphere() {
  const material = useMemo(() => new THREE.MeshLambertMaterial({
    color: new THREE.Color("#080e18"),
    emissive: new THREE.Color("#030608"),
    emissiveIntensity: 0.5,
  }), []);

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
      <lineBasicMaterial color="#1a2a40" transparent opacity={0.2} />
    </lineSegments>
  );
}

// Glowing pin dots rendered in 3D — no labels here (labels are CSS overlay)
function PinDots() {
  const dotsRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!dotsRef.current) return;
    dotsRef.current.children.forEach((child, i) => {
      const mesh = child as THREE.Mesh;
      const t = state.clock.elapsedTime * 1.5 + i;
      const scale = 1 + Math.sin(t) * 0.2;
      mesh.scale.set(scale, scale, scale);
    });
  });

  return (
    <group ref={dotsRef}>
      {gamePins.map((pin) => {
        const pos = latLngToVector3(pin.lat, pin.lng, GLOBE_RADIUS + 0.025);
        return (
          <mesh key={pin.id} position={pos}>
            <sphereGeometry args={[0.035, 16, 16]} />
            <meshBasicMaterial
              color={pin.ready ? "#00e676" : "#334155"}
              transparent
              opacity={pin.ready ? 0.9 : 0.5}
            />
          </mesh>
        );
      })}
    </group>
  );
}

// Writes projected screen positions to a shared ref — no React state, no re-renders
function ScreenProjector({
  positionsRef,
}: {
  positionsRef: React.MutableRefObject<{ x: number; y: number; visible: boolean }[]>;
}) {
  const { camera, size } = useThree();
  const worldPositions = useMemo(
    () => gamePins.map((pin) => new THREE.Vector3(...latLngToVector3(pin.lat, pin.lng, GLOBE_RADIUS + 0.08))),
    []
  );

  useFrame(() => {
    const halfW = size.width / 2;
    const halfH = size.height / 2;

    worldPositions.forEach((wp, i) => {
      const projected = wp.clone().project(camera);
      const behind = projected.z > 1;
      // Check if on the back side of the globe
      const camDir = new THREE.Vector3().subVectors(wp, camera.position).normalize();
      const globeCenter = new THREE.Vector3(0, 0, 0);
      const toPosDir = new THREE.Vector3().subVectors(wp, globeCenter).normalize();
      const dotProduct = camDir.dot(toPosDir);

      positionsRef.current[i] = {
        x: (projected.x * halfW) + halfW,
        y: -(projected.y * halfH) + halfH,
        visible: !behind && dotProduct < 0,
      };
    });
  });

  return null;
}

function HomeGlobeScene({ positionsRef }: { positionsRef: React.MutableRefObject<{ x: number; y: number; visible: boolean }[]> }) {
  const [spinning, setSpinning] = useState(true);

  return (
    <>
      <ambientLight intensity={0.4} color="#c0d0e0" />
      <directionalLight position={[5, 3, 5]} intensity={0.6} color="#ffffff" />
      <directionalLight position={[-5, -3, -5]} intensity={0.3} color="#ffffff" />

      <EarthSphere />
      <GlobeGrid />
      <CountryBorders radius={GLOBE_RADIUS} />
      <Atmosphere radius={GLOBE_RADIUS} />
      <PinDots />
      <ScreenProjector positionsRef={positionsRef} />

      <Stars radius={80} depth={60} count={3000} factor={3} saturation={0} fade speed={0.2} />

      <OrbitControls
        enablePan={false}
        enableZoom={true}
        minDistance={3}
        maxDistance={10}
        autoRotate={spinning}
        autoRotateSpeed={0.4}
        dampingFactor={0.08}
        enableDamping
        rotateSpeed={0.5}
        onStart={() => { if (spinning) setSpinning(false); }}
      />
    </>
  );
}

// CSS labels overlay — reads positions from ref via RAF, zero React re-renders
function LabelsOverlay({
  positionsRef,
  onSelect,
}: {
  positionsRef: React.MutableRefObject<{ x: number; y: number; visible: boolean }[]>;
  onSelect: (href: string) => void;
}) {
  const labelRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    function update() {
      positionsRef.current.forEach((pos, i) => {
        const el = labelRefs.current[i];
        if (!el) return;
        if (pos.visible) {
          el.style.transform = `translate(-50%, -100%) translate(${pos.x}px, ${pos.y - 12}px)`;
          el.style.opacity = "1";
          el.style.pointerEvents = "auto";
        } else {
          el.style.opacity = "0";
          el.style.pointerEvents = "none";
        }
      });
      rafRef.current = requestAnimationFrame(update);
    }
    rafRef.current = requestAnimationFrame(update);
    return () => cancelAnimationFrame(rafRef.current);
  }, [positionsRef]);

  return (
    <div className="absolute inset-0 overflow-hidden" style={{ pointerEvents: "none" }}>
      {gamePins.map((pin, i) => (
        <button
          key={pin.id}
          ref={(el) => { labelRefs.current[i] = el; }}
          onClick={() => onSelect(pin.href)}
          className={`
            absolute top-0 left-0 rounded-lg px-3 py-1.5 text-xs font-bold
            backdrop-blur-sm transition-colors duration-150 cursor-pointer
            ${pin.ready
              ? "bg-navy/90 border border-green/40 text-green hover:bg-green/20 hover:border-green shadow-[0_0_12px_rgba(0,230,118,0.15)]"
              : "bg-navy/80 border border-white/10 text-slate-500 hover:bg-white/5"
            }
          `}
          style={{ opacity: 0, pointerEvents: "none", willChange: "transform" }}
        >
          {pin.label}
        </button>
      ))}
    </div>
  );
}

export function HomeGlobe() {
  const router = useRouter();
  const positionsRef = useRef<{ x: number; y: number; visible: boolean }[]>(
    gamePins.map(() => ({ x: 0, y: 0, visible: false }))
  );

  const handleSelect = useCallback((href: string) => {
    router.push(href);
  }, [router]);

  return (
    <div className="relative h-full w-full">
      <Canvas
        camera={{ position: [0, 1.5, 4.5], fov: 45 }}
        style={{ background: "transparent" }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 2]}
      >
        <Suspense fallback={null}>
          <HomeGlobeScene positionsRef={positionsRef} />
        </Suspense>
      </Canvas>
      <LabelsOverlay positionsRef={positionsRef} onSelect={handleSelect} />
    </div>
  );
}
