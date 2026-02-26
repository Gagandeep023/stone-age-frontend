import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface WorkerMeeple3DProps {
  position: [number, number, number];
  color: string;
}

// Classic meeple silhouette using LatheGeometry
function createMeepleGeometry(): THREE.LatheGeometry {
  // Meeple profile points (half-cross-section, rotated around Y axis)
  const points: THREE.Vector2[] = [
    new THREE.Vector2(0, 0),           // bottom center
    new THREE.Vector2(0.1, 0),         // base
    new THREE.Vector2(0.12, 0.02),     // base edge
    new THREE.Vector2(0.1, 0.05),      // base top
    new THREE.Vector2(0.06, 0.08),     // waist narrow
    new THREE.Vector2(0.05, 0.12),     // body start
    new THREE.Vector2(0.04, 0.18),     // neck
    new THREE.Vector2(0.06, 0.22),     // head start
    new THREE.Vector2(0.065, 0.26),    // head widest
    new THREE.Vector2(0.06, 0.3),      // head top curve
    new THREE.Vector2(0.03, 0.33),     // head tip approach
    new THREE.Vector2(0, 0.35),        // top center
  ];

  return new THREE.LatheGeometry(points, 12);
}

export function WorkerMeeple3D({ position, color }: WorkerMeeple3DProps) {
  const groupRef = useRef<THREE.Group>(null);
  const meepleGeo = useMemo(() => createMeepleGeometry(), []);

  useFrame(({ clock }) => {
    if (groupRef.current) {
      const t = clock.getElapsedTime();
      const offset = position[0] * 0.5 + position[2] * 0.7;
      groupRef.current.position.y = position[1] + Math.sin(t * 2 + offset) * 0.02;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      <mesh geometry={meepleGeo} castShadow>
        <meshStandardMaterial
          color={color}
          roughness={0.5}
          metalness={0.15}
          emissive={color}
          emissiveIntensity={0.05}
        />
      </mesh>
    </group>
  );
}
