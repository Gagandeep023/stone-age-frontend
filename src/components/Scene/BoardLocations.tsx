import React from 'react';
import type { GameState, LocationId } from '../../types/index.js';
import { LOCATION_3D_POSITIONS, PLAYER_3D_COLORS } from '../../types/three.js';
import { LocationMesh } from './LocationMesh.js';
import { WorkerMeeple3D } from './WorkerMeeple3D.js';

// Map building tile ID (fixed-01..fixed-11, flex-01..flex-08, var-01..var-09) to hut image number (1-28)
function getBuildingImageNum(tileId: string): number {
  const match = tileId.match(/^(fixed|flex|var)-(\d+)$/);
  if (!match) return 1;
  const [, category, numStr] = match;
  const num = parseInt(numStr);
  if (category === 'fixed') return Math.min(num, 11);
  if (category === 'flex') return Math.min(11 + num, 19);
  if (category === 'var') return Math.min(19 + num, 28);
  return 1;
}

// Map card ID (culture-0..culture-15, mult-farmer-16..) to card image number (1-35)
function getCardImageNum(cardId: string): number {
  const num = parseInt(cardId.replace(/\D/g, ''));
  if (isNaN(num)) return 1;
  return Math.min(Math.max(num + 1, 1), 35);
}

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
        let buildingTexturePath: string | null = null;
        let cardTexturePath: string | null = null;
        let stackSize = 0;

        if (locId.startsWith('building_')) {
          const idx = parseInt(locId.split('_')[1]);
          isEmpty = idx >= gameState.buildingStacks.length || gameState.buildingStacks[idx].length === 0;
          stackSize = gameState.buildingStacks[idx]?.length || 0;
          if (!isEmpty) {
            const topTile = gameState.buildingStacks[idx]?.[0];
            if (topTile) {
              buildingTexturePath = `huts/building-hut-${getBuildingImageNum(topTile.id)}.jpg`;
            }
          }
        }
        if (locId.startsWith('civCard_')) {
          const idx = parseInt(locId.split('_')[1]);
          isEmpty = !gameState.civilizationDisplay[idx];
          if (!isEmpty) {
            const card = gameState.civilizationDisplay[idx];
            if (card) {
              cardTexturePath = `cards/civilization-card-${getCardImageNum(card.id)}.jpg`;
            }
          }
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
              buildingTexturePath={buildingTexturePath}
              cardTexturePath={cardTexturePath}
              stackSize={stackSize}
            />
            {workers}
          </React.Fragment>
        );
      })}
    </group>
  );
}
