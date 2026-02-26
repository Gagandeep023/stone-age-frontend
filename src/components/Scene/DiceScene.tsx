import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import type { AnimationEvent } from '../../types/three.js';

interface DiceSceneProps {
  animation: AnimationEvent | null;
}

function Die({ value, index, animating }: { value: number; index: number; animating: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const startTime = useRef(Date.now());

  useFrame(() => {
    if (!meshRef.current) return;

    if (animating) {
      const elapsed = (Date.now() - startTime.current) / 1000;
      if (elapsed < 1.0) {
        meshRef.current.rotation.x += 0.2;
        meshRef.current.rotation.z += 0.15;
        meshRef.current.position.y = 3 + Math.sin(elapsed * 8) * (1 - elapsed);
      } else {
        meshRef.current.rotation.set(0, 0, 0);
        meshRef.current.position.y = 2;
      }
    }
  });

  const offsetX = (index - 2) * 0.8;

  return (
    <group position={[offsetX, 2, 0]}>
      <mesh ref={meshRef} castShadow>
        <boxGeometry args={[0.5, 0.5, 0.5]} />
        <meshStandardMaterial color="#f5f0e0" roughness={0.3} metalness={0.05} />
      </mesh>
      {/* Value text on top */}
      <Text
        position={[0, 0.3, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.3}
        color="#1a1207"
        anchorX="center"
        anchorY="middle"
        fontWeight={700}
      >
        {String(value)}
      </Text>
    </group>
  );
}

export function DiceScene({ animation }: DiceSceneProps) {
  if (!animation || animation.type !== 'diceRoll' || !animation.dice) return null;

  return (
    <group position={[0, 0, 0]}>
      {animation.dice.map((value, i) => (
        <Die key={i} value={value} index={i} animating={true} />
      ))}
    </group>
  );
}
