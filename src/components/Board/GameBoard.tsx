import React from 'react';
import type { GameState, LocationId, PlayerColor } from '../../types/index.js';
import { WorkerMeeple } from '../Common/WorkerMeeple.js';

interface GameBoardProps {
  gameState: GameState;
  availableLocations: LocationId[];
  onLocationClick: (location: LocationId) => void;
  selectedLocation: LocationId | null;
}

interface BoardLocation {
  id: LocationId;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
}

const BOARD_LOCATIONS: BoardLocation[] = [
  // Resource gathering
  { id: 'huntingGrounds', label: 'Hunting Grounds', x: 50, y: 50, width: 160, height: 80, color: '#2D5016' },
  { id: 'forest', label: 'Forest', x: 50, y: 150, width: 120, height: 80, color: '#3a6b1f' },
  { id: 'clayPit', label: 'Clay Pit', x: 50, y: 250, width: 120, height: 80, color: '#8B4513' },
  { id: 'quarry', label: 'Quarry', x: 50, y: 350, width: 120, height: 80, color: '#5a5a5a' },
  { id: 'river', label: 'River', x: 50, y: 450, width: 120, height: 80, color: '#2E6B9E' },

  // Village
  { id: 'toolMaker', label: 'Tool Maker', x: 250, y: 50, width: 100, height: 70, color: '#6a4f0f' },
  { id: 'hut', label: 'Hut', x: 370, y: 50, width: 100, height: 70, color: '#8B4513' },
  { id: 'field', label: 'Field', x: 490, y: 50, width: 100, height: 70, color: '#4a8029' },

  // Buildings
  { id: 'building_0', label: 'Build 1', x: 250, y: 150, width: 80, height: 80, color: '#5a3a0a' },
  { id: 'building_1', label: 'Build 2', x: 350, y: 150, width: 80, height: 80, color: '#5a3a0a' },
  { id: 'building_2', label: 'Build 3', x: 450, y: 150, width: 80, height: 80, color: '#5a3a0a' },
  { id: 'building_3', label: 'Build 4', x: 550, y: 150, width: 80, height: 80, color: '#5a3a0a' },

  // Civ cards
  { id: 'civCard_0', label: 'Card (1)', x: 250, y: 260, width: 80, height: 100, color: '#3a2c15' },
  { id: 'civCard_1', label: 'Card (2)', x: 350, y: 260, width: 80, height: 100, color: '#3a2c15' },
  { id: 'civCard_2', label: 'Card (3)', x: 450, y: 260, width: 80, height: 100, color: '#3a2c15' },
  { id: 'civCard_3', label: 'Card (4)', x: 550, y: 260, width: 80, height: 100, color: '#3a2c15' },
];

export function GameBoard({ gameState, availableLocations, onLocationClick, selectedLocation }: GameBoardProps) {
  return (
    <svg viewBox="0 0 700 560" style={{ width: '100%', maxWidth: 800, background: '#2a1f0e', borderRadius: 12 }}>
      {/* Background pattern */}
      <defs>
        <pattern id="sa-crosshatch" width="8" height="8" patternUnits="userSpaceOnUse">
          <line x1="0" y1="0" x2="8" y2="8" stroke="#3a2c15" strokeWidth="0.5" />
        </pattern>
      </defs>
      <rect width="700" height="560" fill="url(#sa-crosshatch)" rx="12" />

      {/* Title */}
      <text x="350" y="28" textAnchor="middle" fill="#d4a017" fontSize="16" fontWeight="700">
        Stone Age
      </text>

      {/* Board locations */}
      {BOARD_LOCATIONS.map(loc => {
        const isAvailable = availableLocations.includes(loc.id);
        const isSelected = selectedLocation === loc.id;
        const isBlocked = gameState.blockedVillageLocation === loc.id;
        const boardLoc = gameState.board.locations[loc.id];
        const workerCount = boardLoc?.totalWorkers || 0;

        // Check if building stack is empty
        let isEmpty = false;
        if (loc.id.startsWith('building_')) {
          const idx = parseInt(loc.id.split('_')[1]);
          isEmpty = idx >= gameState.buildingStacks.length || gameState.buildingStacks[idx].length === 0;
        }
        if (loc.id.startsWith('civCard_')) {
          const idx = parseInt(loc.id.split('_')[1]);
          isEmpty = !gameState.civilizationDisplay[idx];
        }

        return (
          <g
            key={loc.id}
            onClick={() => isAvailable && onLocationClick(loc.id)}
            style={{ cursor: isAvailable ? 'pointer' : 'default' }}
          >
            <rect
              x={loc.x}
              y={loc.y}
              width={loc.width}
              height={loc.height}
              rx={6}
              fill={isBlocked || isEmpty ? '#2a2a2a' : loc.color}
              stroke={isSelected ? '#d4a017' : isAvailable ? '#f0c040' : '#5a4a2a'}
              strokeWidth={isSelected ? 3 : isAvailable ? 2 : 1}
              opacity={isBlocked || isEmpty ? 0.3 : 1}
            />

            {/* Label */}
            <text
              x={loc.x + loc.width / 2}
              y={loc.y + 16}
              textAnchor="middle"
              fill="#f0e6d2"
              fontSize="11"
              fontWeight="600"
            >
              {loc.label}
            </text>

            {/* Worker count badge */}
            {workerCount > 0 && (
              <>
                <circle
                  cx={loc.x + loc.width - 12}
                  cy={loc.y + 12}
                  r={10}
                  fill="#1a1207"
                  stroke="#d4a017"
                  strokeWidth="1.5"
                />
                <text
                  x={loc.x + loc.width - 12}
                  y={loc.y + 16}
                  textAnchor="middle"
                  fill="#d4a017"
                  fontSize="11"
                  fontWeight="700"
                >
                  {workerCount}
                </text>
              </>
            )}

            {/* Show workers by player color */}
            {boardLoc && Object.entries(boardLoc.workersByPlayer).map(([pid, count], playerIdx) => {
              const player = gameState.players.find(p => p.id === pid);
              if (!player || count === 0) return null;
              return (
                <g key={pid}>
                  {Array.from({ length: Math.min(count as number, 5) }).map((_, wi) => (
                    <circle
                      key={wi}
                      cx={loc.x + 14 + (playerIdx * 22) + (wi * 6)}
                      cy={loc.y + loc.height - 14}
                      r={5}
                      fill={getColorHex(player.color)}
                      stroke="#1a1207"
                      strokeWidth="1"
                    />
                  ))}
                </g>
              );
            })}

            {/* Building tile count */}
            {loc.id.startsWith('building_') && !isEmpty && (
              <text
                x={loc.x + loc.width / 2}
                y={loc.y + loc.height / 2 + 4}
                textAnchor="middle"
                fill="#b8a88a"
                fontSize="10"
              >
                {gameState.buildingStacks[parseInt(loc.id.split('_')[1])]?.length || 0} tiles
              </text>
            )}

            {/* Card info */}
            {loc.id.startsWith('civCard_') && !isEmpty && (
              <text
                x={loc.x + loc.width / 2}
                y={loc.y + loc.height / 2 + 4}
                textAnchor="middle"
                fill="#b8a88a"
                fontSize="9"
              >
                Cost: {parseInt(loc.id.split('_')[1]) + 1}
              </text>
            )}

            {/* Blocked indicator */}
            {isBlocked && (
              <text
                x={loc.x + loc.width / 2}
                y={loc.y + loc.height / 2 + 4}
                textAnchor="middle"
                fill="#cc4444"
                fontSize="12"
                fontWeight="700"
              >
                BLOCKED
              </text>
            )}
          </g>
        );
      })}

      {/* Supply info */}
      <g transform="translate(250, 400)">
        <text x="0" y="0" fill="#b8a88a" fontSize="11" fontWeight="600">Supply</text>
        <text x="0" y="18" fill="#8B6914" fontSize="10">Wood: {gameState.supply.wood}</text>
        <text x="80" y="18" fill="#c45a3c" fontSize="10">Brick: {gameState.supply.brick}</text>
        <text x="160" y="18" fill="#6B6B6B" fontSize="10">Stone: {gameState.supply.stone}</text>
        <text x="240" y="18" fill="#d4a017" fontSize="10">Gold: {gameState.supply.gold}</text>
      </g>

      {/* Round info */}
      <g transform="translate(250, 450)">
        <text x="0" y="0" fill="#d4a017" fontSize="13" fontWeight="700">
          Round {gameState.roundNumber}
        </text>
        <text x="0" y="18" fill="#b8a88a" fontSize="11">
          Phase: {formatPhase(gameState.phase)}
        </text>
        <text x="0" y="34" fill="#b8a88a" fontSize="11">
          Cards in deck: {gameState.civilizationDeck.length}
        </text>
      </g>
    </svg>
  );
}

function getColorHex(color: PlayerColor): string {
  const map: Record<PlayerColor, string> = {
    red: '#cc4444',
    blue: '#4488cc',
    green: '#44aa44',
    yellow: '#ccaa22',
  };
  return map[color];
}

function formatPhase(phase: string): string {
  switch (phase) {
    case 'workerPlacement': return 'Worker Placement';
    case 'actionResolution': return 'Action Resolution';
    case 'feeding': return 'Feeding';
    default: return phase;
  }
}
