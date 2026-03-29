"use client";

import { useMemo } from "react";
import * as THREE from "three";

interface AtmosphereProps {
  radius: number;
}

const atmosphereVertexShader = `
  varying vec3 vNormal;
  varying vec3 vPosition;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const atmosphereFragmentShader = `
  varying vec3 vNormal;
  varying vec3 vPosition;
  void main() {
    vec3 viewDir = normalize(-vPosition);
    float intensity = pow(0.6 - dot(vNormal, viewDir), 2.0);
    // Blue-teal atmosphere with a hint of green
    vec3 innerColor = vec3(0.1, 0.4, 0.6);  // deep blue-teal
    vec3 outerColor = vec3(0.2, 0.7, 0.5);  // green-teal edge
    vec3 color = mix(innerColor, outerColor, intensity);
    gl_FragColor = vec4(color, intensity * 0.35);
  }
`;

export function Atmosphere({ radius }: AtmosphereProps) {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: atmosphereVertexShader,
        fragmentShader: atmosphereFragmentShader,
        side: THREE.BackSide,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    []
  );

  return (
    <mesh material={material} scale={1.12}>
      <sphereGeometry args={[radius, 64, 64]} />
    </mesh>
  );
}
