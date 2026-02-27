import React, { Suspense, useContext } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import type { GameState, LocationId } from '../../types/index.js';
import type { AnimationEvent, CameraPreset } from '../../types/three.js';
import { AssetContext } from '../../utils/assetPath.js';
import { SkyAndLighting } from '../Scene/SkyAndLighting.js';
import { BoardTerrain } from '../Scene/BoardTerrain.js';
import { BoardLocations } from '../Scene/BoardLocations.js';
import { DiceScene } from '../Scene/DiceScene.js';
import { ResourceParticles } from '../Scene/ResourceParticles.js';

interface GameBoard3DProps {
  gameState: GameState;
  availableLocations: LocationId[];
  selectedLocation: LocationId | null;
  onLocationClick: (location: LocationId) => void;
  currentAnimation: AnimationEvent | null;
  cameraPreset: CameraPreset;
}

function Scene({
  gameState,
  availableLocations,
  selectedLocation,
  onLocationClick,
  currentAnimation,
  cameraPreset,
}: GameBoard3DProps) {
  return (
    <>
      <SkyAndLighting />
      <OrbitControls
        target={cameraPreset.target}
        minDistance={5}
        maxDistance={35}
        maxPolarAngle={Math.PI / 2.2}
        enablePan
        enableDamping
        dampingFactor={0.05}
      />

      <BoardTerrain />

      <BoardLocations
        gameState={gameState}
        availableLocations={availableLocations}
        selectedLocation={selectedLocation}
        onLocationClick={onLocationClick}
      />

      {/* Conditional animation elements */}
      <DiceScene animation={currentAnimation} />
      <ResourceParticles animation={currentAnimation} />
    </>
  );
}

export function GameBoard3D(props: GameBoard3DProps) {
  // Bridge AssetContext from parent React tree into Canvas React tree
  const assetBasePath = useContext(AssetContext);

  return (
    <div style={{ width: '100%', height: '100%', minHeight: 400, borderRadius: 12, overflow: 'hidden' }}>
      <Canvas
        shadows
        camera={{
          position: props.cameraPreset.position,
          fov: 50,
          near: 0.1,
          far: 100,
        }}
        style={{ background: '#1a1207' }}
      >
        <AssetContext.Provider value={assetBasePath}>
          <Suspense fallback={null}>
            <Scene {...props} />
          </Suspense>
        </AssetContext.Provider>
      </Canvas>
    </div>
  );
}
