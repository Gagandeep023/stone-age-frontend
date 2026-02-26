import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export function RiverMesh() {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);
  const flowRef = useRef<THREE.Mesh>(null);
  const sparkleGroupRef = useRef<THREE.Group>(null);

  // Create river path geometry (curved, not flat rectangle)
  const riverGeometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(3.5, 3, 16, 16);
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      // Gentle curve to the river
      const warp = Math.sin(y * 1.5) * 0.2;
      pos.setX(i, x + warp);
      pos.setZ(i, Math.sin(x * 0.5) * 0.02);
    }
    pos.needsUpdate = true;
    geo.computeVertexNormals();
    return geo;
  }, []);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (meshRef.current) {
      meshRef.current.position.y = -0.3 + Math.sin(t * 0.5) * 0.01;
    }
    if (materialRef.current) {
      materialRef.current.emissiveIntensity = 0.12 + Math.sin(t * 0.8) * 0.06;
    }
    // Animate flow overlay
    if (flowRef.current) {
      const mat = flowRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.08 + Math.sin(t * 1.5) * 0.04;
      flowRef.current.position.y = -0.28 + Math.sin(t * 0.7) * 0.01;
    }
    // Sparkle gold nuggets
    if (sparkleGroupRef.current) {
      sparkleGroupRef.current.children.forEach((child, i) => {
        const sparkle = child as THREE.Mesh;
        const offset = i * 1.3;
        sparkle.position.y = -0.15 + Math.sin(t * 1.5 + offset) * 0.05;
        sparkle.rotation.y = t * 2 + offset;
        const mat = sparkle.material as THREE.MeshBasicMaterial;
        mat.opacity = 0.4 + Math.sin(t * 3 + offset) * 0.3;
      });
    }
  });

  return (
    <group>
      {/* Main river body */}
      <mesh
        ref={meshRef}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[-4, -0.3, -6]}
        geometry={riverGeometry}
      >
        <meshStandardMaterial
          ref={materialRef}
          color="#1a6090"
          roughness={0.15}
          metalness={0.35}
          emissive="#0a4070"
          emissiveIntensity={0.12}
          transparent
          opacity={0.88}
        />
      </mesh>

      {/* Flow shimmer overlay */}
      <mesh
        ref={flowRef}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[-4, -0.28, -6]}
      >
        <planeGeometry args={[3, 2.5]} />
        <meshBasicMaterial
          color="#4090c0"
          transparent
          opacity={0.08}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* River extension (wider shallow area) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-6, -0.35, -6]}>
        <planeGeometry args={[2.5, 2]} />
        <meshStandardMaterial
          color="#1a5276"
          roughness={0.25}
          metalness={0.25}
          transparent
          opacity={0.55}
        />
      </mesh>

      {/* River bank edges */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-4, -0.38, -6]}>
        <planeGeometry args={[4, 3.5]} />
        <meshStandardMaterial
          color="#3a3020"
          roughness={1}
          transparent
          opacity={0.3}
        />
      </mesh>

      {/* Gold sparkles floating in river */}
      <group ref={sparkleGroupRef}>
        {[
          [-3.5, -0.15, -5.8],
          [-4.2, -0.15, -6.2],
          [-4.8, -0.15, -5.5],
          [-3.8, -0.15, -6.5],
          [-4.5, -0.15, -6.0],
        ].map((pos, i) => (
          <mesh key={i} position={pos as [number, number, number]}>
            <sphereGeometry args={[0.03, 6, 6]} />
            <meshBasicMaterial color="#f0c040" transparent opacity={0.5} />
          </mesh>
        ))}
      </group>
    </group>
  );
}
