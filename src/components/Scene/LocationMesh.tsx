import React, { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Billboard } from '@react-three/drei';
import * as THREE from 'three';
import type { LocationId } from '../../types/index.js';
import type { LocationPosition } from '../../types/three.js';
import { useAssetPath, assetUrl } from '../../utils/assetPath.js';

interface LocationMeshProps {
  locationId: LocationId;
  position: LocationPosition;
  workerCount: number;
  isAvailable: boolean;
  isSelected: boolean;
  isBlocked: boolean;
  isEmpty: boolean;
  onClick: () => void;
}

export function LocationMesh({
  locationId,
  position,
  workerCount,
  isAvailable,
  isSelected,
  isBlocked,
  isEmpty,
  onClick,
}: LocationMeshProps) {
  const basePath = useAssetPath();
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const glowRef = useRef<THREE.Mesh>(null);

  const isBuilding = locationId.startsWith('building_');
  const isCivCard = locationId.startsWith('civCard_');

  // Load marker texture for worker placement spots
  const markerTexture = useMemo(() => {
    const loader = new THREE.TextureLoader();
    const tex = loader.load(assetUrl(basePath, 'ui/marker-place.gif'));
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, [basePath]);

  useFrame(({ clock }) => {
    if (glowRef.current && isAvailable) {
      const t = clock.getElapsedTime();
      glowRef.current.scale.setScalar(1 + Math.sin(t * 3) * 0.05);
      (glowRef.current.material as THREE.MeshBasicMaterial).opacity =
        0.2 + Math.sin(t * 3) * 0.08;
    }
  });

  const opacity = isBlocked || isEmpty ? 0.3 : 1;
  const emissiveColor = isSelected ? '#d4a017' : hovered && isAvailable ? '#f0c040' : '#000000';
  const emissiveIntensity = isSelected ? 0.5 : hovered && isAvailable ? 0.3 : 0;

  // Determine platform color based on location type
  const platformColor = isBuilding || isCivCard
    ? position.color
    : position.color;

  return (
    <group position={[position.x, position.y, position.z]}>
      {/* Available glow ring */}
      {isAvailable && !isSelected && (
        <mesh ref={glowRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
          <ringGeometry args={[1.1, 1.35, 32]} />
          <meshBasicMaterial color="#f0c040" transparent opacity={0.2} side={THREE.DoubleSide} />
        </mesh>
      )}

      {/* Selected ring - golden glow */}
      {isSelected && (
        <group>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
            <ringGeometry args={[1.05, 1.3, 32]} />
            <meshBasicMaterial color="#d4a017" transparent opacity={0.7} side={THREE.DoubleSide} />
          </mesh>
          {/* Additional inner glow */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
            <circleGeometry args={[1.05, 32]} />
            <meshBasicMaterial color="#f0c040" transparent opacity={0.1} side={THREE.DoubleSide} />
          </mesh>
        </group>
      )}

      {/* Main platform - raised stone/wood look */}
      <mesh
        ref={meshRef}
        position={[0, 0.1, 0]}
        castShadow
        receiveShadow
        onClick={(e) => {
          e.stopPropagation();
          if (isAvailable) onClick();
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          if (isAvailable) document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = 'auto';
        }}
      >
        <boxGeometry args={[2, 0.2, 2]} />
        <meshStandardMaterial
          color={platformColor}
          roughness={0.75}
          metalness={0.05}
          emissive={emissiveColor}
          emissiveIntensity={emissiveIntensity}
          transparent
          opacity={opacity}
        />
      </mesh>

      {/* Raised border edges for depth */}
      <mesh position={[0, 0.22, 0]} castShadow>
        <boxGeometry args={[2.1, 0.04, 2.1]} />
        <meshStandardMaterial
          color="#2a1f0e"
          roughness={0.9}
          transparent
          opacity={opacity * 0.5}
        />
      </mesh>

      {/* Worker placement marker spots */}
      {workerCount === 0 && !isBlocked && !isEmpty && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.25, 0]}>
          <planeGeometry args={[0.5, 0.5]} />
          <meshBasicMaterial map={markerTexture} transparent opacity={0.4} side={THREE.DoubleSide} />
        </mesh>
      )}

      {/* Location label */}
      <Billboard follow={true} lockX={false} lockY={false} lockZ={false}>
        <Text
          position={[0, 0.55, 0]}
          fontSize={0.28}
          color="#f0e6d2"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.03}
          outlineColor="#1a1207"
          fontWeight={700}
        >
          {position.label}
        </Text>
      </Billboard>

      {/* Worker count badge */}
      {workerCount > 0 && (
        <Billboard follow={true} lockX={false} lockY={false} lockZ={false}>
          <group position={[0.85, 0.65, 0]}>
            <mesh>
              <circleGeometry args={[0.22, 16]} />
              <meshBasicMaterial color="#1a1207" />
            </mesh>
            <mesh position={[0, 0, -0.01]}>
              <ringGeometry args={[0.2, 0.24, 16]} />
              <meshBasicMaterial color="#d4a017" />
            </mesh>
            <Text
              position={[0, 0, 0.01]}
              fontSize={0.2}
              color="#d4a017"
              anchorX="center"
              anchorY="middle"
              fontWeight={700}
            >
              {String(workerCount)}
            </Text>
          </group>
        </Billboard>
      )}

      {/* Blocked overlay */}
      {isBlocked && (
        <Billboard follow={true} lockX={false} lockY={false} lockZ={false}>
          <Text
            position={[0, 0.75, 0]}
            fontSize={0.25}
            color="#cc4444"
            anchorX="center"
            anchorY="middle"
            fontWeight={700}
            outlineWidth={0.02}
            outlineColor="#000000"
          >
            BLOCKED
          </Text>
        </Billboard>
      )}
    </group>
  );
}
