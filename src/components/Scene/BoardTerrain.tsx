import React, { useMemo } from 'react';
import * as THREE from 'three';
import { useAssetPath, assetUrl } from '../../utils/assetPath.js';

export function BoardTerrain() {
  const basePath = useAssetPath();

  const boardTexture = useMemo(() => {
    const loader = new THREE.TextureLoader();
    const tex = loader.load(assetUrl(basePath, 'board-full.jpg'));
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.minFilter = THREE.LinearMipmapLinearFilter;
    tex.magFilter = THREE.LinearFilter;
    return tex;
  }, [basePath]);

  return (
    <group>
      {/* Main board surface with board image texture - flat, no undulation */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.5, 0]}
        receiveShadow
      >
        <planeGeometry args={[24, 18]} />
        <meshStandardMaterial
          map={boardTexture}
          roughness={0.7}
          metalness={0.0}
        />
      </mesh>

      {/* Thin dark ground plane extending beyond the board */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.52, 0]}
        receiveShadow
      >
        <planeGeometry args={[40, 30]} />
        <meshStandardMaterial
          color="#1a1207"
          roughness={1}
          metalness={0}
        />
      </mesh>
    </group>
  );
}
