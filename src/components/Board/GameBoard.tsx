import React, { useState } from 'react';
import type { GameState, LocationId, PlayerColor } from '../../types/index.js';
import { useAssetPath, assetUrl } from '../../utils/assetPath.js';
import { CardDetailOverlay } from '../Overlays/CardDetailOverlay.js';

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

// Positions mapped to the illustrated board-full.jpg (768x542 natural size, using 700x495 viewBox region)
const BOARD_LOCATIONS: BoardLocation[] = [
  // Resource gathering - top half of board
  { id: 'huntingGrounds', label: 'Hunting Grounds', x: 30, y: 30, width: 150, height: 90, color: 'rgba(45,80,22,0.35)' },
  { id: 'forest', label: 'Forest', x: 30, y: 135, width: 130, height: 80, color: 'rgba(58,107,31,0.35)' },
  { id: 'clayPit', label: 'Clay Pit', x: 30, y: 230, width: 130, height: 80, color: 'rgba(139,69,19,0.35)' },
  { id: 'quarry', label: 'Quarry', x: 30, y: 325, width: 130, height: 80, color: 'rgba(90,90,90,0.35)' },
  { id: 'river', label: 'River', x: 175, y: 30, width: 115, height: 90, color: 'rgba(46,107,158,0.35)' },

  // Village - center
  { id: 'toolMaker', label: 'Tool Maker', x: 305, y: 30, width: 100, height: 70, color: 'rgba(106,79,15,0.35)' },
  { id: 'hut', label: 'Love Hut', x: 420, y: 30, width: 100, height: 70, color: 'rgba(139,66,19,0.35)' },
  { id: 'field', label: 'Field', x: 535, y: 30, width: 100, height: 70, color: 'rgba(74,128,41,0.35)' },

  // Buildings - center row
  { id: 'building_0', label: '', x: 195, y: 155, width: 90, height: 110, color: 'rgba(90,58,10,0.3)' },
  { id: 'building_1', label: '', x: 300, y: 155, width: 90, height: 110, color: 'rgba(90,58,10,0.3)' },
  { id: 'building_2', label: '', x: 405, y: 155, width: 90, height: 110, color: 'rgba(90,58,10,0.3)' },
  { id: 'building_3', label: '', x: 510, y: 155, width: 90, height: 110, color: 'rgba(90,58,10,0.3)' },

  // Civ cards - bottom row
  { id: 'civCard_0', label: '', x: 195, y: 290, width: 90, height: 120, color: 'rgba(58,44,21,0.3)' },
  { id: 'civCard_1', label: '', x: 300, y: 290, width: 90, height: 120, color: 'rgba(58,44,21,0.3)' },
  { id: 'civCard_2', label: '', x: 405, y: 290, width: 90, height: 120, color: 'rgba(58,44,21,0.3)' },
  { id: 'civCard_3', label: '', x: 510, y: 290, width: 90, height: 120, color: 'rgba(58,44,21,0.3)' },
];

function getPlayerColorHex(color: PlayerColor): string {
  const map: Record<PlayerColor, string> = {
    red: '#cc4444',
    blue: '#4488cc',
    green: '#44aa44',
    yellow: '#ccaa22',
  };
  return map[color];
}

function getPlayerIndex(color: PlayerColor): number {
  const map: Record<PlayerColor, number> = { red: 0, blue: 1, yellow: 2, green: 3 };
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

export function GameBoard({ gameState, availableLocations, onLocationClick, selectedLocation }: GameBoardProps) {
  const basePath = useAssetPath();
  const [hoveredLocation, setHoveredLocation] = useState<LocationId | null>(null);
  const [cardDetail, setCardDetail] = useState<{ type: 'card' | 'building'; index: number } | null>(null);

  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: 800 }}>
      <svg viewBox="0 0 700 530" style={{ width: '100%', borderRadius: 12, overflow: 'hidden' }}>
        {/* Board background image */}
        <image
          href={assetUrl(basePath, 'board-full.jpg')}
          x="0"
          y="0"
          width="700"
          height="495"
          preserveAspectRatio="xMidYMid slice"
        />

        {/* Dark overlay for bottom info area */}
        <rect x="0" y="420" width="700" height="110" fill="rgba(26,18,7,0.85)" />

        {/* Defs for glow effects */}
        <defs>
          <filter id="sa-glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="sa-glow-strong">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Interactive location overlays */}
        {BOARD_LOCATIONS.map(loc => {
          const isAvailable = availableLocations.includes(loc.id);
          const isSelected = selectedLocation === loc.id;
          const isHovered = hoveredLocation === loc.id;
          const isBlocked = gameState.blockedVillageLocation === loc.id;
          const boardLoc = gameState.board.locations[loc.id];
          const workerCount = boardLoc?.totalWorkers || 0;

          let isEmpty = false;
          let stackSize = 0;
          if (loc.id.startsWith('building_')) {
            const idx = parseInt(loc.id.split('_')[1]);
            isEmpty = idx >= gameState.buildingStacks.length || gameState.buildingStacks[idx].length === 0;
            stackSize = gameState.buildingStacks[idx]?.length || 0;
          }
          if (loc.id.startsWith('civCard_')) {
            const idx = parseInt(loc.id.split('_')[1]);
            isEmpty = !gameState.civilizationDisplay[idx];
          }

          const isBuilding = loc.id.startsWith('building_');
          const isCivCard = loc.id.startsWith('civCard_');

          return (
            <g
              key={loc.id}
              onClick={() => isAvailable && onLocationClick(loc.id)}
              onMouseEnter={() => setHoveredLocation(loc.id)}
              onMouseLeave={() => setHoveredLocation(null)}
              style={{ cursor: isAvailable ? 'pointer' : 'default' }}
            >
              {/* Location hotspot overlay */}
              <rect
                x={loc.x}
                y={loc.y}
                width={loc.width}
                height={loc.height}
                rx={6}
                fill={isBlocked || isEmpty ? 'rgba(0,0,0,0.4)' : isHovered && isAvailable ? 'rgba(240,192,64,0.2)' : loc.color}
                stroke={isSelected ? '#d4a017' : isAvailable ? '#f0c040' : 'transparent'}
                strokeWidth={isSelected ? 3 : isAvailable ? 2 : 0}
                filter={isSelected ? 'url(#sa-glow-strong)' : isAvailable && isHovered ? 'url(#sa-glow)' : undefined}
                opacity={isBlocked || isEmpty ? 0.6 : 1}
              />

              {/* Pulsing glow for available locations */}
              {isAvailable && !isSelected && (
                <rect
                  x={loc.x - 2}
                  y={loc.y - 2}
                  width={loc.width + 4}
                  height={loc.height + 4}
                  rx={8}
                  fill="none"
                  stroke="#f0c040"
                  strokeWidth="1.5"
                  opacity="0.5"
                  className="sa-pulse"
                />
              )}

              {/* Label for resource/village locations */}
              {!isBuilding && !isCivCard && (
                <text
                  x={loc.x + loc.width / 2}
                  y={loc.y + 18}
                  textAnchor="middle"
                  fill="#f0e6d2"
                  fontSize="12"
                  fontWeight="700"
                  style={{ textShadow: '0 1px 3px rgba(0,0,0,0.8)', pointerEvents: 'none' }}
                  filter="url(#sa-glow)"
                >
                  {loc.label}
                </text>
              )}

              {/* Building tile image */}
              {isBuilding && !isEmpty && (() => {
                const idx = parseInt(loc.id.split('_')[1]);
                const topTile = gameState.buildingStacks[idx]?.[0];
                if (!topTile) return null;
                const tileNum = parseInt(topTile.id.replace(/\D/g, '')) || (idx * 7 + 1);
                const clampedNum = Math.min(Math.max(tileNum, 1), 28);
                return (
                  <>
                    {/* Stack shadow cards behind */}
                    {stackSize > 1 && (
                      <>
                        <rect x={loc.x + 4} y={loc.y + 4} width={loc.width - 8} height={loc.height - 8} rx={4} fill="#3a2510" opacity="0.6" />
                        <rect x={loc.x + 2} y={loc.y + 2} width={loc.width - 4} height={loc.height - 4} rx={4} fill="#4a3520" opacity="0.5" />
                      </>
                    )}
                    <image
                      href={assetUrl(basePath, `huts/building-hut-${clampedNum}.jpg`)}
                      x={loc.x + 5}
                      y={loc.y + 5}
                      width={loc.width - 10}
                      height={loc.height - 10}
                      preserveAspectRatio="xMidYMid meet"
                      style={{ cursor: 'zoom-in' }}
                      onDoubleClick={(e) => { e.stopPropagation(); setCardDetail({ type: 'building', index: clampedNum }); }}
                    />
                    {/* Stack count badge */}
                    <circle cx={loc.x + loc.width - 12} cy={loc.y + loc.height - 12} r={10} fill="rgba(26,18,7,0.85)" stroke="#d4a017" strokeWidth="1" />
                    <text x={loc.x + loc.width - 12} y={loc.y + loc.height - 8} textAnchor="middle" fill="#d4a017" fontSize="10" fontWeight="700">
                      {stackSize}
                    </text>
                  </>
                );
              })()}

              {/* Civilization card image */}
              {isCivCard && !isEmpty && (() => {
                const idx = parseInt(loc.id.split('_')[1]);
                const card = gameState.civilizationDisplay[idx];
                if (!card) return null;
                const cardNum = parseInt(card.id.replace(/\D/g, '')) || (idx + 1);
                const clampedNum = Math.min(Math.max(cardNum, 1), 35);
                return (
                  <>
                    <image
                      href={assetUrl(basePath, `cards/civilization-card-${clampedNum}.jpg`)}
                      x={loc.x + 3}
                      y={loc.y + 3}
                      width={loc.width - 6}
                      height={loc.height - 6}
                      preserveAspectRatio="xMidYMid meet"
                      style={{ cursor: 'zoom-in' }}
                      onDoubleClick={(e) => { e.stopPropagation(); setCardDetail({ type: 'card', index: clampedNum }); }}
                    />
                    {/* Cost badge */}
                    <circle cx={loc.x + 14} cy={loc.y + 14} r={10} fill="rgba(26,18,7,0.85)" stroke="#f0c040" strokeWidth="1.5" />
                    <text x={loc.x + 14} y={loc.y + 18} textAnchor="middle" fill="#f0c040" fontSize="11" fontWeight="700">
                      {idx + 1}
                    </text>
                  </>
                );
              })()}

              {/* Empty building/card slot */}
              {(isBuilding || isCivCard) && isEmpty && (
                <>
                  <image
                    href={assetUrl(basePath, isBuilding ? 'huts/symbol-building.png' : 'cards/symbol-card.png')}
                    x={loc.x + loc.width / 2 - 12}
                    y={loc.y + loc.height / 2 - 12}
                    width={24}
                    height={24}
                    opacity={0.3}
                    style={{ pointerEvents: 'none' }}
                  />
                </>
              )}

              {/* Worker count badge */}
              {workerCount > 0 && (
                <>
                  <circle
                    cx={loc.x + loc.width - 14}
                    cy={loc.y + 14}
                    r={11}
                    fill="rgba(26,18,7,0.9)"
                    stroke="#d4a017"
                    strokeWidth="1.5"
                  />
                  <text
                    x={loc.x + loc.width - 14}
                    y={loc.y + 18}
                    textAnchor="middle"
                    fill="#d4a017"
                    fontSize="12"
                    fontWeight="700"
                  >
                    {workerCount}
                  </text>
                </>
              )}

              {/* Player meeple images for placed workers */}
              {boardLoc && Object.entries(boardLoc.workersByPlayer).map(([pid, count], playerIdx) => {
                const player = gameState.players.find(p => p.id === pid);
                if (!player || count === 0) return null;
                const pIdx = getPlayerIndex(player.color);
                return (
                  <g key={pid}>
                    {Array.from({ length: Math.min(count as number, 5) }).map((_, wi) => (
                      <image
                        key={wi}
                        href={assetUrl(basePath, `players/figure-${pIdx}.png`)}
                        x={loc.x + 4 + (playerIdx * 24) + (wi * 8)}
                        y={loc.y + loc.height - 28}
                        width={20}
                        height={24}
                        preserveAspectRatio="xMidYMid meet"
                        style={{ pointerEvents: 'none' }}
                      />
                    ))}
                  </g>
                );
              })}

              {/* Blocked indicator */}
              {isBlocked && (
                <text
                  x={loc.x + loc.width / 2}
                  y={loc.y + loc.height / 2 + 4}
                  textAnchor="middle"
                  fill="#cc4444"
                  fontSize="13"
                  fontWeight="700"
                  style={{ textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}
                >
                  BLOCKED
                </text>
              )}
            </g>
          );
        })}

        {/* Supply info with resource token images */}
        <g transform="translate(30, 435)">
          <text x="0" y="0" fill="#d4a017" fontSize="13" fontWeight="700">Supply</text>
          {(['wood', 'brick', 'stone', 'gold'] as const).map((res, i) => (
            <g key={res} transform={`translate(${i * 90}, 16)`}>
              <image
                href={assetUrl(basePath, `resources/${res === 'wood' ? 'wood.png' : res === 'brick' ? 'brick.png' : res === 'stone' ? 'stone.png' : 'gold.png'}`)}
                x="0"
                y="-2"
                width="18"
                height="18"
                preserveAspectRatio="xMidYMid meet"
              />
              <text x="22" y="12" fill="#f0e6d2" fontSize="12" fontWeight="600">
                {gameState.supply[res]}
              </text>
            </g>
          ))}
        </g>

        {/* Round/phase info */}
        <g transform="translate(30, 490)">
          <text x="0" y="0" fill="#d4a017" fontSize="14" fontWeight="700">
            Round {gameState.roundNumber}
          </text>
          <text x="100" y="0" fill="#b8a88a" fontSize="12">
            {formatPhase(gameState.phase)}
          </text>
          <text x="280" y="0" fill="#7a6b52" fontSize="11">
            Deck: {gameState.civilizationDeck.length} cards
          </text>
        </g>

        {/* Player score track */}
        <g transform="translate(430, 435)">
          <text x="0" y="0" fill="#d4a017" fontSize="13" fontWeight="700">Scores</text>
          {gameState.players.map((p, i) => {
            const pIdx = getPlayerIndex(p.color);
            return (
              <g key={p.id} transform={`translate(${i * 65}, 14)`}>
                <image
                  href={assetUrl(basePath, `players/marker-${pIdx}.gif`)}
                  x="0"
                  y="0"
                  width="14"
                  height="14"
                  preserveAspectRatio="xMidYMid meet"
                />
                <text x="18" y="12" fill={getPlayerColorHex(p.color)} fontSize="12" fontWeight="700">
                  {p.score}
                </text>
              </g>
            );
          })}
        </g>
      </svg>

      {/* Card/building detail overlay */}
      {cardDetail && (
        <CardDetailOverlay
          type={cardDetail.type}
          index={cardDetail.index}
          onClose={() => setCardDetail(null)}
        />
      )}
    </div>
  );
}
