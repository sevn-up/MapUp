"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useGlobeStore } from "@/hooks/useGlobeStore";
import { latLngToVector3 } from "@/lib/geo/geojson-utils";
import { countries } from "@/lib/geo/countries";

interface PinProps {
  position: [number, number, number];
  color: string;
}

function Pin({ position, color }: PinProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (ringRef.current) {
      ringRef.current.scale.x += delta * 0.3;
      ringRef.current.scale.y += delta * 0.3;
      if (ringRef.current.scale.x > 2) {
        ringRef.current.scale.set(1, 1, 1);
      }
      const mat = ringRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = Math.max(0, 1 - (ringRef.current.scale.x - 1));
    }
    if (meshRef.current) {
      meshRef.current.lookAt(0, 0, 0);
    }
  });

  return (
    <group position={position}>
      {/* Pin dot */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.025, 16, 16]} />
        <meshBasicMaterial color={color} />
      </mesh>
      {/* Pulsing ring */}
      <mesh ref={ringRef} rotation={[0, 0, 0]}>
        <ringGeometry args={[0.02, 0.035, 32]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.8}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

interface GlobePinsProps {
  radius: number;
}

export function GlobePins({ radius }: GlobePinsProps) {
  const highlightedCountries = useGlobeStore((s) => s.highlightedCountries);

  const pins = Array.from(highlightedCountries.entries())
    .map(([code, color]) => {
      const country = countries.find((c) => c.code === code);
      if (!country) return null;
      const pos = latLngToVector3(country.lat, country.lng, radius + 0.04);
      return { code, color, position: pos };
    })
    .filter(Boolean) as { code: string; color: string; position: [number, number, number] }[];

  return (
    <group>
      {pins.map((pin) => (
        <Pin key={pin.code} position={pin.position} color={pin.color} />
      ))}
    </group>
  );
}
