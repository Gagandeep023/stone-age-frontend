import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function SmokeParticle({ offset }: { offset: number }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (meshRef.current) {
      const t = (clock.getElapsedTime() + offset) % 3;
      meshRef.current.position.y = 0.5 + t * 0.6;
      meshRef.current.position.x = Math.sin(t * 2 + offset) * 0.15;
      meshRef.current.position.z = Math.cos(t * 1.5 + offset) * 0.1;
      const mat = meshRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = Math.max(0, 0.15 - t * 0.05);
      meshRef.current.scale.setScalar(0.06 + t * 0.04);
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 0.5, 0]}>
      <sphereGeometry args={[1, 6, 6]} />
      <meshBasicMaterial color="#888888" transparent opacity={0.1} />
    </mesh>
  );
}

export function CampfireMesh() {
  const flameRef = useRef<THREE.PointLight>(null);
  const innerFlameRef = useRef<THREE.Mesh>(null);
  const outerFlameRef = useRef<THREE.Mesh>(null);

  const logAngles = useMemo(() => [0, 60, 120, 180, 240, 300], []);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (flameRef.current) {
      flameRef.current.intensity = 2.0 + Math.sin(t * 8) * 0.4 + Math.sin(t * 12) * 0.2 + Math.sin(t * 5) * 0.15;
    }
    if (innerFlameRef.current) {
      innerFlameRef.current.scale.y = 1 + Math.sin(t * 10) * 0.2;
      innerFlameRef.current.scale.x = 1 + Math.sin(t * 7) * 0.12;
      innerFlameRef.current.position.y = 0.3 + Math.sin(t * 6) * 0.02;
    }
    if (outerFlameRef.current) {
      outerFlameRef.current.scale.y = 1 + Math.sin(t * 8 + 1) * 0.15;
      outerFlameRef.current.scale.x = 1 + Math.sin(t * 6 + 0.5) * 0.1;
      const mat = outerFlameRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.25 + Math.sin(t * 9) * 0.08;
    }
  });

  return (
    <group position={[-8, 0, -6]}>
      {/* Stone ring around fire */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => {
        const rad = (angle * Math.PI) / 180;
        return (
          <mesh
            key={`stone-${i}`}
            position={[Math.cos(rad) * 0.4, 0.04, Math.sin(rad) * 0.4]}
            castShadow
          >
            <sphereGeometry args={[0.06, 5, 5]} />
            <meshStandardMaterial color="#5a5a5a" roughness={0.9} />
          </mesh>
        );
      })}

      {/* Log ring */}
      {logAngles.map((angle, i) => {
        const rad = (angle * Math.PI) / 180;
        return (
          <mesh
            key={i}
            position={[Math.cos(rad) * 0.25, 0.06, Math.sin(rad) * 0.25]}
            rotation={[0, rad + Math.PI / 2, Math.PI * 0.05]}
            castShadow
          >
            <cylinderGeometry args={[0.035, 0.04, 0.35, 5]} />
            <meshStandardMaterial color="#3a2010" roughness={1} />
          </mesh>
        );
      })}

      {/* Ember bed */}
      <mesh position={[0, 0.08, 0]}>
        <sphereGeometry args={[0.12, 8, 8]} />
        <meshBasicMaterial color="#cc3300" transparent opacity={0.6} />
      </mesh>

      {/* Inner flame (bright) */}
      <mesh ref={innerFlameRef} position={[0, 0.3, 0]}>
        <sphereGeometry args={[0.12, 8, 8]} />
        <meshBasicMaterial color="#ffaa00" transparent opacity={0.8} />
      </mesh>

      {/* Outer flame (glow) */}
      <mesh ref={outerFlameRef} position={[0, 0.25, 0]}>
        <sphereGeometry args={[0.22, 8, 8]} />
        <meshBasicMaterial color="#ff5500" transparent opacity={0.3} />
      </mesh>

      {/* Flame tip */}
      <mesh position={[0, 0.45, 0]}>
        <coneGeometry args={[0.06, 0.15, 6]} />
        <meshBasicMaterial color="#ff8800" transparent opacity={0.4} />
      </mesh>

      {/* Point light - warm campfire glow */}
      <pointLight
        ref={flameRef}
        position={[0, 0.5, 0]}
        color="#ff8833"
        intensity={2.0}
        distance={5}
        decay={2}
        castShadow
      />

      {/* Secondary fill light (softer, wider) */}
      <pointLight
        position={[0, 0.3, 0]}
        color="#ff6620"
        intensity={0.5}
        distance={3}
        decay={2}
      />

      {/* Smoke particles */}
      {[0, 1, 2, 3].map(i => (
        <SmokeParticle key={i} offset={i * 0.75} />
      ))}
    </group>
  );
}
