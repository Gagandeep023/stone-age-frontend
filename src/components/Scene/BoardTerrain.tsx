import React, { useMemo } from 'react';
import { useLoader } from '@react-three/fiber';
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

  const dirtTexture = useMemo(() => {
    const loader = new THREE.TextureLoader();
    const tex = loader.load(assetUrl(basePath, 'textures/dirt-diffuse.jpg'));
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(4, 3);
    return tex;
  }, [basePath]);

  const groundGeometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(28, 22, 64, 64);
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      // Subtle terrain undulation
      pos.setZ(i, Math.sin(x * 0.3) * Math.cos(y * 0.3) * 0.15);
    }
    pos.needsUpdate = true;
    geo.computeVertexNormals();
    return geo;
  }, []);

  return (
    <group>
      {/* Main board surface with board image texture */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.5, 0]}
        receiveShadow
      >
        <planeGeometry args={[24, 18]} />
        <meshStandardMaterial
          map={boardTexture}
          roughness={0.8}
          metalness={0.0}
        />
      </mesh>

      {/* Extended ground around the board with dirt texture */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.52, 0]}
        receiveShadow
        geometry={groundGeometry}
      >
        <meshStandardMaterial
          map={dirtTexture}
          roughness={0.95}
          metalness={0.0}
          color="#5a4a30"
        />
      </mesh>

      {/* Subtle elevation around board edges */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.51, 0]}>
        <ringGeometry args={[12, 14.5, 64]} />
        <meshStandardMaterial
          map={dirtTexture}
          roughness={1}
          color="#3a2a18"
          transparent
          opacity={0.7}
        />
      </mesh>

      {/* Warm ambient ground fog plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.53, 0]}>
        <circleGeometry args={[14.5, 64]} />
        <meshStandardMaterial
          color="#2a1f0e"
          roughness={1}
          transparent
          opacity={0.3}
        />
      </mesh>
    </group>
  );
}
