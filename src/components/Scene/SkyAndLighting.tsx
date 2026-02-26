import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export function SkyAndLighting() {
  const dirLightRef = useRef<THREE.DirectionalLight>(null);

  useFrame(({ clock }) => {
    if (dirLightRef.current) {
      const t = clock.getElapsedTime() * 0.05;
      dirLightRef.current.position.x = Math.sin(t) * 10;
    }
  });

  return (
    <>
      {/* Sky background gradient via mesh */}
      <mesh position={[0, 30, -30]} scale={[100, 60, 1]}>
        <planeGeometry />
        <meshBasicMaterial color="#1a3a5c" side={THREE.DoubleSide} />
      </mesh>

      {/* Ambient light */}
      <ambientLight intensity={0.4} color="#f5e6c8" />

      {/* Main directional light (sun) */}
      <directionalLight
        ref={dirLightRef}
        position={[8, 15, 5]}
        intensity={0.8}
        color="#ffeedd"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-far={50}
        shadow-camera-left={-15}
        shadow-camera-right={15}
        shadow-camera-top={15}
        shadow-camera-bottom={-15}
      />

      {/* Fill light from opposite side */}
      <directionalLight position={[-5, 8, -3]} intensity={0.2} color="#aaccff" />

      {/* Fog for depth */}
      <fog attach="fog" args={['#1a1207', 25, 50]} />
    </>
  );
}
