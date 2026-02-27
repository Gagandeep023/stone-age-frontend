import React, { useRef, useState, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Billboard } from '@react-three/drei';
import * as THREE from 'three';
import type { LocationId } from '../../types/index.js';
import type { LocationPosition } from '../../types/three.js';
import { useAssetPath, assetUrl } from '../../utils/assetPath.js';

// Icon images for each location type
const LOCATION_ICON_PATHS: Partial<Record<LocationId, string>> = {
  huntingGrounds: 'resources/food.gif',
  forest: 'resources/wood.png',
  clayPit: 'resources/brick.png',
  quarry: 'resources/stone.png',
  river: 'resources/gold.png',
  toolMaker: 'tools/tool-1.jpg',
  hut: 'players/figure-0.png',
  field: 'ui/field-agriculture.png',
};

// Max worker placement slots per location type
const LOCATION_SLOTS: Partial<Record<LocationId, number>> = {
  huntingGrounds: 10,
  forest: 7,
  clayPit: 7,
  quarry: 7,
  river: 7,
  toolMaker: 1,
  hut: 2,
  field: 1,
};

// Generate 3D slot positions relative to location center (2X spacing)
function get3DSlotPositions(locationId: LocationId): Array<[number, number]> {
  const slots = LOCATION_SLOTS[locationId];
  if (!slots) return [];

  if (slots === 10) {
    const positions: Array<[number, number]> = [];
    for (let row = 0; row < 2; row++) {
      for (let col = 0; col < 5; col++) {
        positions.push([
          (col - 2) * 0.65,
          (row - 0.5) * 0.65,
        ]);
      }
    }
    return positions;
  }

  if (slots === 7) {
    const positions: Array<[number, number]> = [];
    for (let col = 0; col < 4; col++) {
      positions.push([(col - 1.5) * 0.65, -0.35]);
    }
    for (let col = 0; col < 3; col++) {
      positions.push([(col - 1) * 0.65, 0.3]);
    }
    return positions;
  }

  if (slots === 2) {
    return [[-0.4, 0], [0.4, 0]];
  }

  return [[0, 0]];
}

// Hook to load a texture with proper state updates
function useLoadedTexture(url: string | null): THREE.Texture | null {
  const [texture, setTexture] = useState<THREE.Texture | null>(null);

  useEffect(() => {
    if (!url) {
      setTexture(null);
      return;
    }
    const loader = new THREE.TextureLoader();
    let cancelled = false;
    loader.load(
      url,
      (tex) => {
        if (!cancelled) {
          tex.colorSpace = THREE.SRGBColorSpace;
          tex.needsUpdate = true;
          setTexture(tex);
        }
      },
      undefined,
      () => {
        if (!cancelled) setTexture(null);
      },
    );
    return () => { cancelled = true; };
  }, [url]);

  return texture;
}

interface LocationMeshProps {
  locationId: LocationId;
  position: LocationPosition;
  workerCount: number;
  isAvailable: boolean;
  isSelected: boolean;
  isBlocked: boolean;
  isEmpty: boolean;
  onClick: () => void;
  buildingTexturePath?: string | null;
  cardTexturePath?: string | null;
  stackSize?: number;
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
  buildingTexturePath,
  cardTexturePath,
  stackSize,
}: LocationMeshProps) {
  const basePath = useAssetPath();
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const glowRef = useRef<THREE.Mesh>(null);

  const isBuilding = locationId.startsWith('building_');
  const isCivCard = locationId.startsWith('civCard_');
  const iconPath = LOCATION_ICON_PATHS[locationId];
  const slotPositions = get3DSlotPositions(locationId);

  // Load location icon texture
  const iconUrl = iconPath ? assetUrl(basePath, iconPath) : null;
  const iconTexture = useLoadedTexture(iconUrl);

  // Load tool-3 texture for toolMaker (shows both tools side by side)
  const tool3Url = locationId === 'toolMaker' ? assetUrl(basePath, 'tools/tool-3.jpg') : null;
  const tool3Texture = useLoadedTexture(tool3Url);

  // Load building/card texture with proper state-based loading
  const tilePath = buildingTexturePath || cardTexturePath;
  const tileUrl = tilePath ? assetUrl(basePath, tilePath) : null;
  const tileTexture = useLoadedTexture(tileUrl);

  useFrame(({ clock }) => {
    if (glowRef.current && isAvailable && hovered) {
      const t = clock.getElapsedTime();
      glowRef.current.scale.setScalar(1 + Math.sin(t * 3) * 0.05);
      (glowRef.current.material as THREE.MeshBasicMaterial).opacity =
        0.25 + Math.sin(t * 3) * 0.1;
    }
  });

  return (
    <group position={[position.x, position.y, position.z]}>
      {/* Available glow ring - only on hover */}
      {isAvailable && !isSelected && hovered && (
        <mesh ref={glowRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
          <ringGeometry args={[0.9, 1.15, 32]} />
          <meshBasicMaterial color="#f0c040" transparent opacity={0.25} side={THREE.DoubleSide} />
        </mesh>
      )}

      {/* Selected ring - bright gold */}
      {isSelected && (
        <group>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
            <ringGeometry args={[0.85, 1.15, 32]} />
            <meshBasicMaterial color="#d4a017" transparent opacity={0.6} side={THREE.DoubleSide} />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 0]}>
            <circleGeometry args={[0.85, 32]} />
            <meshBasicMaterial color="#f0c040" transparent opacity={0.08} side={THREE.DoubleSide} />
          </mesh>
        </group>
      )}

      {/* Invisible click target */}
      <mesh
        ref={meshRef}
        position={[0, 0.05, 0]}
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
        <cylinderGeometry args={[1, 1, 0.02, 32]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      {/* Hover highlight */}
      {hovered && isAvailable && !isSelected && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
          <ringGeometry args={[0.8, 1.1, 32]} />
          <meshBasicMaterial color="#f0c040" transparent opacity={0.35} side={THREE.DoubleSide} />
        </mesh>
      )}

      {/* Worker placement ring slots (for resource/village locations, 2X size) */}
      {slotPositions.length > 0 && (
        <group position={[0, 0.015, 0]}>
          {slotPositions.map(([sx, sz], si) => (
            <mesh key={si} rotation={[-Math.PI / 2, 0, 0]} position={[sx, 0, sz]}>
              <ringGeometry args={[0.2, 0.28, 16]} />
              <meshBasicMaterial
                color={si < workerCount ? '#d4a017' : '#ffffff'}
                transparent
                opacity={si < workerCount ? 0.6 : 0.2}
                side={THREE.DoubleSide}
              />
            </mesh>
          ))}
        </group>
      )}

      {/* Building/card tile texture - Billboard facing camera */}
      {tileTexture && !isEmpty && (isBuilding || isCivCard) && (
        <Billboard follow={true} lockX={false} lockY={false} lockZ={false}>
          <group position={[0, 2.2, 0]}>
            {/* Gold border frame - only on hover */}
            {hovered && (
              <mesh position={[0, 0, -0.01]}>
                <planeGeometry args={[isBuilding ? 3.0 : 2.8, isBuilding ? 3.8 : 3.6]} />
                <meshBasicMaterial color="#d4a017" transparent opacity={0.5} />
              </mesh>
            )}
            {/* Tile image - no background frame */}
            <mesh>
              <planeGeometry args={[isBuilding ? 2.8 : 2.6, isBuilding ? 3.6 : 3.4]} />
              <meshBasicMaterial map={tileTexture} side={THREE.DoubleSide} />
            </mesh>
            {/* Stack count badge for buildings */}
            {isBuilding && stackSize != null && stackSize > 0 && (
              <group position={[1.2, -1.55, 0.01]}>
                <mesh>
                  <circleGeometry args={[0.22, 16]} />
                  <meshBasicMaterial color="#1a1207" />
                </mesh>
                <mesh position={[0, 0, 0.005]}>
                  <ringGeometry args={[0.18, 0.24, 16]} />
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
                  {String(stackSize)}
                </Text>
              </group>
            )}
            {/* Cost badge for civ cards */}
            {isCivCard && (
              <group position={[-1.1, 1.45, 0.01]}>
                <mesh>
                  <circleGeometry args={[0.2, 16]} />
                  <meshBasicMaterial color="#1a1207" />
                </mesh>
                <mesh position={[0, 0, 0.005]}>
                  <ringGeometry args={[0.16, 0.22, 16]} />
                  <meshBasicMaterial color="#f0c040" />
                </mesh>
                <Text
                  position={[0, 0, 0.01]}
                  fontSize={0.18}
                  color="#f0c040"
                  anchorX="center"
                  anchorY="middle"
                  fontWeight={700}
                >
                  {String(parseInt(locationId.split('_')[1]) + 1)}
                </Text>
              </group>
            )}
          </group>
        </Billboard>
      )}

      {/* Location icon sprite - floating above the board (2X size) */}
      {iconTexture && !isBuilding && !isCivCard && locationId !== 'toolMaker' && (
        <Billboard follow={true} lockX={false} lockY={false} lockZ={false}>
          <mesh position={[0, 0.5, -0.01]}>
            <circleGeometry args={[0.7, 24]} />
            <meshBasicMaterial color="#1a1207" transparent opacity={0.75} />
          </mesh>
          <mesh position={[0, 0.5, -0.005]}>
            <ringGeometry args={[0.65, 0.72, 24]} />
            <meshBasicMaterial color="#d4a017" transparent opacity={0.6} />
          </mesh>
          <mesh position={[0, 0.5, 0]}>
            <planeGeometry args={[1.0, 1.0]} />
            <meshBasicMaterial map={iconTexture} transparent side={THREE.DoubleSide} />
          </mesh>
        </Billboard>
      )}

      {/* Tool Maker: show both tool-1 and tool-3 side by side */}
      {locationId === 'toolMaker' && iconTexture && (
        <Billboard follow={true} lockX={false} lockY={false} lockZ={false}>
          {/* Tool 1 */}
          <mesh position={[-0.55, 0.5, -0.01]}>
            <circleGeometry args={[0.55, 24]} />
            <meshBasicMaterial color="#1a1207" transparent opacity={0.75} />
          </mesh>
          <mesh position={[-0.55, 0.5, -0.005]}>
            <ringGeometry args={[0.5, 0.57, 24]} />
            <meshBasicMaterial color="#d4a017" transparent opacity={0.6} />
          </mesh>
          <mesh position={[-0.55, 0.5, 0]}>
            <planeGeometry args={[0.8, 0.8]} />
            <meshBasicMaterial map={iconTexture} transparent side={THREE.DoubleSide} />
          </mesh>
          {/* Tool 3 */}
          {tool3Texture && (
            <>
              <mesh position={[0.55, 0.5, -0.01]}>
                <circleGeometry args={[0.55, 24]} />
                <meshBasicMaterial color="#1a1207" transparent opacity={0.75} />
              </mesh>
              <mesh position={[0.55, 0.5, -0.005]}>
                <ringGeometry args={[0.5, 0.57, 24]} />
                <meshBasicMaterial color="#d4a017" transparent opacity={0.6} />
              </mesh>
              <mesh position={[0.55, 0.5, 0]}>
                <planeGeometry args={[0.8, 0.8]} />
                <meshBasicMaterial map={tool3Texture} transparent side={THREE.DoubleSide} />
              </mesh>
            </>
          )}
        </Billboard>
      )}

      {/* Location label */}
      <Billboard follow={true} lockX={false} lockY={false} lockZ={false}>
        <Text
          position={[0, 0.75, 0]}
          fontSize={0.28}
          color="#f0e6d2"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.04}
          outlineColor="#1a1207"
          fontWeight={700}
        >
          {position.label}
        </Text>
      </Billboard>

      {/* Worker count badge */}
      {workerCount > 0 && (
        <Billboard follow={true} lockX={false} lockY={false} lockZ={false}>
          <group position={[0.75, 0.85, 0]}>
            <mesh>
              <circleGeometry args={[0.2, 16]} />
              <meshBasicMaterial color="#1a1207" />
            </mesh>
            <mesh position={[0, 0, -0.01]}>
              <ringGeometry args={[0.18, 0.22, 16]} />
              <meshBasicMaterial color="#d4a017" />
            </mesh>
            <Text
              position={[0, 0, 0.01]}
              fontSize={0.18}
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
            position={[0, 0.95, 0]}
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
