"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { latLngToVector3 } from "@/infrastructure/geojson";

interface ArcLineProps {
  from: [number, number]; // [lat, lng]
  to: [number, number]; // [lat, lng]
  radius: number;
  color?: string;
  segments?: number;
}

export function ArcLine({
  from,
  to,
  radius,
  color = "#22d3ee",
  segments = 64,
}: ArcLineProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const lineRef = useRef<any>(null);
  const progressRef = useRef(0);

  const { fullGeometry, points } = useMemo(() => {
    const startVec = new THREE.Vector3(...latLngToVector3(from[0], from[1], radius + 0.01));
    const endVec = new THREE.Vector3(...latLngToVector3(to[0], to[1], radius + 0.01));

    // Calculate a control point above the sphere for the arc
    const mid = new THREE.Vector3().addVectors(startVec, endVec).multiplyScalar(0.5);
    const dist = startVec.distanceTo(endVec);
    const height = Math.max(0.3, dist * 0.4);
    mid.normalize().multiplyScalar(radius + height);

    const curve = new THREE.QuadraticBezierCurve3(startVec, mid, endVec);
    const pts = curve.getPoints(segments);

    const geo = new THREE.BufferGeometry().setFromPoints(pts);

    return { fullGeometry: geo, points: pts };
  }, [from, to, radius, segments]);

  // Animate the arc drawing in
  useFrame((_, delta) => {
    if (progressRef.current < 1) {
      progressRef.current = Math.min(progressRef.current + delta * 1.5, 1);
      const count = Math.floor(progressRef.current * points.length);
      if (lineRef.current) {
        lineRef.current.geometry.setDrawRange(0, count);
      }
    }
  });

  return (
    <primitive object={new THREE.Line(fullGeometry, new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.8 }))} ref={lineRef} />
  );
}
