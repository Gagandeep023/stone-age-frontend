import React from 'react';
import type { GameState, LocationId } from '../../types/index.js';
import { LOCATION_3D_POSITIONS, PLAYER_3D_COLORS } from '../../types/three.js';
import { LocationMesh } from './LocationMesh.js';
import { WorkerMeeple3D } from './WorkerMeeple3D.js';

interface BoardLocationsProps {
  gameState: GameState;
  availableLocations: LocationId[];
  selectedLocation: LocationId | null;
  onLocationClick: (location: LocationId) => void;
}

export function BoardLocations({
  gameState,
  availableLocations,
  selectedLocation,
  onLocationClick,
}: BoardLocationsProps) {
  const locationIds = Object.keys(LOCATION_3D_POSITIONS) as LocationId[];

  return (
    <group>
      {locationIds.map((locId) => {
        const pos = LOCATION_3D_POSITIONS[locId];
        const boardLoc = gameState.board.locations[locId];
        const workerCount = boardLoc?.totalWorkers || 0;
        const isBlocked = gameState.blockedVillageLocation === locId;

        let isEmpty = false;
        if (locId.startsWith('building_')) {
          const idx = parseInt(locId.split('_')[1]);
          isEmpty = idx >= gameState.buildingStacks.length || gameState.buildingStacks[idx].length === 0;
        }
        if (locId.startsWith('civCard_')) {
          const idx = parseInt(locId.split('_')[1]);
          isEmpty = !gameState.civilizationDisplay[idx];
        }

        // Render workers on this location
        const workers: React.ReactNode[] = [];
        if (boardLoc) {
          let workerIdx = 0;
          for (const [pid, count] of Object.entries(boardLoc.workersByPlayer)) {
            const player = gameState.players.find((p) => p.id === pid);
            if (!player || (count as number) === 0) continue;
            const color = PLAYER_3D_COLORS[player.color] || '#888888';
            for (let i = 0; i < Math.min(count as number, 5); i++) {
              const offsetX = (workerIdx % 3 - 1) * 0.4;
              const offsetZ = Math.floor(workerIdx / 3) * 0.4 - 0.3;
              workers.push(
                <WorkerMeeple3D
                  key={`${pid}-${i}`}
                  position={[pos.x + offsetX, 0.35, pos.z + offsetZ]}
                  color={color}
                />
              );
              workerIdx++;
            }
          }
        }

        return (
          <React.Fragment key={locId}>
            <LocationMesh
              locationId={locId}
              position={pos}
              workerCount={workerCount}
              isAvailable={availableLocations.includes(locId)}
              isSelected={selectedLocation === locId}
              isBlocked={isBlocked}
              isEmpty={isEmpty}
              onClick={() => onLocationClick(locId)}
            />
            {workers}
          </React.Fragment>
        );
      })}
    </group>
  );
}
