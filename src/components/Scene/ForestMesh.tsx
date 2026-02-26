import React, { useMemo } from 'react';

interface TreeProps {
  position: [number, number, number];
  scale?: number;
  variant?: number;
}

function Tree({ position, scale = 1, variant = 0 }: TreeProps) {
  // Vary tree colors slightly per variant
  const trunkColor = variant % 2 === 0 ? '#4a3520' : '#3a2815';
  const foliageColors = [
    ['#1a4a0a', '#2a5a1a', '#1e5010'],
    ['#1e4a10', '#285818', '#1a4208'],
    ['#224e12', '#2e5e1e', '#1c480c'],
  ];
  const colors = foliageColors[variant % 3];

  return (
    <group position={position} scale={scale}>
      {/* Trunk */}
      <mesh position={[0, 0.4, 0]} castShadow>
        <cylinderGeometry args={[0.06, 0.1, 0.8, 6]} />
        <meshStandardMaterial color={trunkColor} roughness={0.95} />
      </mesh>

      {/* Foliage layers - bottom, wider */}
      <mesh position={[0, 0.85, 0]} castShadow>
        <coneGeometry args={[0.55, 0.7, 7]} />
        <meshStandardMaterial color={colors[0]} roughness={0.85} />
      </mesh>

      {/* Middle layer */}
      <mesh position={[0, 1.2, 0]} castShadow>
        <coneGeometry args={[0.42, 0.6, 7]} />
        <meshStandardMaterial color={colors[1]} roughness={0.85} />
      </mesh>

      {/* Top layer, narrower */}
      <mesh position={[0, 1.55, 0]} castShadow>
        <coneGeometry args={[0.28, 0.5, 6]} />
        <meshStandardMaterial color={colors[2]} roughness={0.85} />
      </mesh>

      {/* Tiny tip */}
      <mesh position={[0, 1.85, 0]} castShadow>
        <coneGeometry args={[0.12, 0.25, 5]} />
        <meshStandardMaterial color={colors[2]} roughness={0.8} />
      </mesh>
    </group>
  );
}

// Small bush/shrub for ground cover
function Bush({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.15, 0]} castShadow>
        <sphereGeometry args={[0.2, 6, 6]} />
        <meshStandardMaterial color="#1e3a08" roughness={0.9} />
      </mesh>
      <mesh position={[0.1, 0.1, 0.08]} castShadow>
        <sphereGeometry args={[0.14, 5, 5]} />
        <meshStandardMaterial color="#264a10" roughness={0.9} />
      </mesh>
    </group>
  );
}

export function ForestMesh() {
  const treePositions = useMemo<[number, number, number][]>(() => [
    [-9.5, 0, -3.5],
    [-10, 0, -1.5],
    [-9.8, 0, 0.5],
    [-10.2, 0, -0.5],
    [-9, 0, -4.5],
    [-10.5, 0, 1.0],
    [-9.3, 0, 2.5],
    [-10.1, 0, -2.5],
    // Additional trees for denser forest
    [-9.7, 0, -5.5],
    [-10.4, 0, -3.0],
    [-9.1, 0, 1.5],
    [-10.8, 0, -1.0],
    [-9.4, 0, 3.5],
    [-10.3, 0, 2.0],
  ], []);

  const scales = useMemo(() =>
    treePositions.map((_, i) => 0.65 + (Math.sin(i * 2.7) + 1) * 0.35),
  [treePositions]);

  const bushPositions = useMemo<[number, number, number][]>(() => [
    [-9.2, 0, -2.0],
    [-10.6, 0, 0.0],
    [-9.6, 0, 3.0],
    [-10.0, 0, -4.0],
    [-9.8, 0, 1.8],
  ], []);

  return (
    <group>
      {treePositions.map((pos, i) => (
        <Tree key={i} position={pos} scale={scales[i]} variant={i} />
      ))}
      {bushPositions.map((pos, i) => (
        <Bush key={`bush-${i}`} position={pos} scale={0.6 + (i % 3) * 0.2} />
      ))}
    </group>
  );
}
