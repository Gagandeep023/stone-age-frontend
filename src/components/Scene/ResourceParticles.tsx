import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { AnimationEvent } from '../../types/three.js';
import { LOCATION_3D_POSITIONS } from '../../types/three.js';
import type { LocationId } from '../../types/index.js';

const RESOURCE_COLORS: Record<string, string> = {
  wood: '#8B6914',
  brick: '#c45a3c',
  stone: '#6B6B6B',
  gold: '#d4a017',
  food: '#2D5016',
};

interface ResourceParticlesProps {
  animation: AnimationEvent | null;
}

export function ResourceParticles({ animation }: ResourceParticlesProps) {
  const pointsRef = useRef<THREE.Points>(null);
  const startTime = useRef(Date.now());

  const particleCount = 30;
  const { positions, velocities } = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    const vel = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      pos[i * 3] = 0;
      pos[i * 3 + 1] = 0;
      pos[i * 3 + 2] = 0;
      vel[i * 3] = (Math.random() - 0.5) * 3;
      vel[i * 3 + 1] = Math.random() * 4 + 1;
      vel[i * 3 + 2] = (Math.random() - 0.5) * 3;
    }
    return { positions: pos, velocities: vel };
  }, []);

  useFrame(() => {
    if (!pointsRef.current || !animation) return;
    const elapsed = (Date.now() - startTime.current) / 1000;
    const posAttr = pointsRef.current.geometry.attributes.position as THREE.BufferAttribute;

    for (let i = 0; i < particleCount; i++) {
      posAttr.array[i * 3] = velocities[i * 3] * elapsed;
      posAttr.array[i * 3 + 1] = velocities[i * 3 + 1] * elapsed - 4.9 * elapsed * elapsed;
      posAttr.array[i * 3 + 2] = velocities[i * 3 + 2] * elapsed;
    }
    posAttr.needsUpdate = true;
  });

  if (!animation || animation.type !== 'resourceCollected') return null;

  const locId = animation.location as LocationId | undefined;
  const locPos = locId ? LOCATION_3D_POSITIONS[locId] : null;
  const color = animation.resource ? RESOURCE_COLORS[animation.resource] || '#ffffff' : '#2D5016';

  startTime.current = Date.now();

  return (
    <points
      ref={pointsRef}
      position={locPos ? [locPos.x, 0.5, locPos.z] : [0, 0.5, 0]}
    >
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial color={color} size={0.15} transparent opacity={0.8} />
    </points>
  );
}
