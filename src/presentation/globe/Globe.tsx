"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import { GlobeScene } from "./GlobeScene";

export function Globe() {
  return (
    <Canvas
      camera={{ position: [0, 0, 4.5], fov: 45 }}
      style={{ background: "transparent" }}
      gl={{ antialias: true, alpha: true }}
      dpr={[1, 2]}
    >
      <Suspense fallback={null}>
        <GlobeScene />
      </Suspense>
    </Canvas>
  );
}
