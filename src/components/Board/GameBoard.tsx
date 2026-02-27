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
  /** Max worker placement slots to render visually */
  slots: number;
}

// Worker placement circle layout per location (spaced for 2X circle size)
function getSlotPositions(loc: BoardLocation): Array<[number, number]> {
  const { width, height, slots, id } = loc;

  if (id === 'huntingGrounds') {
    // 10 circles spread across the area (2 rows of 5)
    const positions: Array<[number, number]> = [];
    const spacing = (width - 40) / 4;
    for (let row = 0; row < 2; row++) {
      for (let col = 0; col < 5; col++) {
        positions.push([
          20 + col * spacing,
          height - 60 + row * 34,
        ]);
      }
    }
    return positions;
  }

  if (slots === 7) {
    // 7 slots: 4 on top, 3 on bottom
    const positions: Array<[number, number]> = [];
    const spacing = (width - 30) / 3;
    const startY = height - 58;
    for (let col = 0; col < 4; col++) {
      positions.push([15 + col * spacing, startY]);
    }
    for (let col = 0; col < 3; col++) {
      positions.push([15 + spacing / 2 + col * spacing, startY + 34]);
    }
    return positions;
  }

  if (slots === 2) {
    return [
      [width / 2 - 22, height - 28],
      [width / 2 + 22, height - 28],
    ];
  }

  if (slots === 1) {
    return [[width / 2, height - 24]];
  }

  return [];
}

// Positions mapped to board-full.jpg (755x498 coordinate space)
// Layout per user instructions:
// - Resources at top: Hunting(left), Forest(center-left), ClayPit(center), Quarry(right)
// - River: right side below quarry, pushed further right
// - Village center: ToolMaker, LoveHut, Field
// - Buildings: bottom-left (4 stacks)
// - Civ cards: bottom-right (4 stacks)
const BOARD_LOCATIONS: BoardLocation[] = [
  // Resources - spread across top of board
  { id: 'huntingGrounds', label: 'Hunting Grounds', x: 20, y: -15, width: 200, height: 155, slots: 10 },
  { id: 'forest', label: 'Forest', x: 165, y: -20, width: 175, height: 120, slots: 7 },
  { id: 'clayPit', label: 'Clay Pit', x: 370, y: -17, width: 175, height: 120, slots: 7 },
  { id: 'quarry', label: 'Quarry', x: 575, y: -20, width: 180, height: 123, slots: 7 },
  { id: 'river', label: 'River', x: 613, y: 148, width: 170, height: 140, slots: 7 },

  // Village - center of board
  { id: 'toolMaker', label: 'Tool Maker', x: 345, y: 245, width: 150, height: 105, slots: 1 },
  { id: 'hut', label: 'Love Hut', x: 270, y: 105, width: 120, height: 80, slots: 2 },
  { id: 'field', label: 'Field', x: 145, y: 235, width: 120, height: 80, slots: 1 },

  // Bottom row: buildings left, cards right (same y level, matching real board layout)
  // Buildings - bottom-left (4 stacks)
  { id: 'building_0', label: '', x: 50, y: 410, width: 68, height: 95, slots: 1 },
  { id: 'building_1', label: '', x: 135, y: 410, width: 68, height: 95, slots: 1 },
  { id: 'building_2', label: '', x: 210, y: 410, width: 68, height: 95, slots: 1 },
  { id: 'building_3', label: '', x: 285, y: 410, width: 68, height: 95, slots: 1 },

  // Civ cards - bottom-right (4 cards, start higher than buildings)
  { id: 'civCard_0', label: '', x: 388, y: 330, width: 82, height: 170, slots: 1 },
  { id: 'civCard_1', label: '', x: 480, y: 330, width: 82, height: 170, slots: 1 },
  { id: 'civCard_2', label: '', x: 570, y: 330, width: 82, height: 170, slots: 1 },
  { id: 'civCard_3', label: '', x: 660, y: 330, width: 82, height: 170, slots: 1 },
];

// Icon images for each location type
const LOCATION_ICONS: Partial<Record<LocationId, string>> = {
  huntingGrounds: 'resources/food.gif',
  forest: 'resources/wood.png',
  clayPit: 'resources/brick.png',
  quarry: 'resources/stone.png',
  river: 'resources/gold.png',
  toolMaker: 'tools/tool-1.jpg',
  hut: 'players/figure-0.png',
  field: 'ui/field-agriculture.png',
};

// Resource supply tokens near resource locations
const LOCATION_RESOURCE: Partial<Record<LocationId, { resource: string; icon: string }>> = {
  forest: { resource: 'wood', icon: 'resources/wood.png' },
  clayPit: { resource: 'brick', icon: 'resources/brick.png' },
  quarry: { resource: 'stone', icon: 'resources/stone.png' },
  river: { resource: 'gold', icon: 'resources/gold.png' },
};

// Map building tile ID (fixed-01..fixed-11, flex-01..flex-08, var-01..var-09) to hut image number (1-28)
function getBuildingImageNum(tileId: string): number {
  const match = tileId.match(/^(fixed|flex|var)-(\d+)$/);
  if (!match) return 1;
  const [, category, numStr] = match;
  const num = parseInt(numStr);
  if (category === 'fixed') return Math.min(num, 11);          // 1-11
  if (category === 'flex') return Math.min(11 + num, 19);      // 12-19
  if (category === 'var') return Math.min(19 + num, 28);       // 20-28
  return 1;
}

// Map card ID (culture-0..culture-15, mult-farmer-16..) to card image number (1-35)
// Card IDs use 0-indexed counter; card images are 1-indexed
function getCardImageNum(cardId: string): number {
  const num = parseInt(cardId.replace(/\D/g, ''));
  if (isNaN(num)) return 1;
  return Math.min(Math.max(num + 1, 1), 35);
}

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
    <div style={{ position: 'relative', width: '100%', maxWidth: '1000px' }}>
      <svg viewBox="0 0 755 560" style={{ width: '100%', borderRadius: 12, overflow: 'hidden' }}>
        {/* Board background image */}
        <image
          href={assetUrl(basePath, 'board-full.jpg')}
          x="0"
          y="0"
          width="755"
          height="498"
          preserveAspectRatio="xMidYMid meet"
        />

        {/* Dark overlay for bottom info area */}
        <rect x="0" y="498" width="755" height="62" fill="rgba(26,18,7,0.92)" />

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
          const isResource = ['huntingGrounds', 'forest', 'clayPit', 'quarry', 'river'].includes(loc.id);

          // Build slot fill map
          const slotPositions = getSlotPositions(loc);
          const filledSlots: Array<{ playerIdx: number; color: PlayerColor } | null> = slotPositions.map(() => null);
          if (boardLoc) {
            let slotIdx = 0;
            for (const [pid, count] of Object.entries(boardLoc.workersByPlayer)) {
              const player = gameState.players.find(p => p.id === pid);
              if (!player || (count as number) === 0) continue;
              for (let i = 0; i < (count as number); i++) {
                if (slotIdx < filledSlots.length) {
                  filledSlots[slotIdx] = { playerIdx: getPlayerIndex(player.color), color: player.color };
                  slotIdx++;
                }
              }
            }
          }

          return (
            <g
              key={loc.id}
              onClick={() => isAvailable && onLocationClick(loc.id)}
              onMouseEnter={() => setHoveredLocation(loc.id)}
              onMouseLeave={() => setHoveredLocation(null)}
              style={{ cursor: isAvailable ? 'pointer' : 'default' }}
            >
              {/* Location hotspot overlay (circle) */}
              {(() => {
                const cx = loc.x + loc.width / 2;
                const cy = loc.y + loc.height / 2;
                const r = Math.min(loc.width, loc.height) * 0.35;
                return (
                  <>
                    <circle
                      cx={cx}
                      cy={cy}
                      r={r}
                      fill={isBlocked || isEmpty ? 'rgba(0,0,0,0.35)' : isHovered && isAvailable ? 'rgba(240,192,64,0.12)' : 'transparent'}
                      stroke={isSelected ? '#d4a017' : isAvailable && isHovered ? '#f0c040' : 'transparent'}
                      strokeWidth={isSelected ? 3 : isAvailable && isHovered ? 2 : 0}
                      filter={isSelected ? 'url(#sa-glow-strong)' : isAvailable && isHovered ? 'url(#sa-glow)' : undefined}
                      opacity={isBlocked || isEmpty ? 0.7 : 1}
                    />
                    {/* Invisible full-area rect for mouse events */}
                    <rect x={loc.x} y={loc.y} width={loc.width} height={loc.height} fill="transparent" />
                  </>
                );
              })()}

              {/* Hover glow for available locations */}
              {isAvailable && isHovered && !isSelected && (() => {
                const cx = loc.x + loc.width / 2;
                const cy = loc.y + loc.height / 2;
                const r = Math.min(loc.width, loc.height) * 0.35 + 3;
                return (
                  <circle
                    cx={cx}
                    cy={cy}
                    r={r}
                    fill="none"
                    stroke="#f0c040"
                    strokeWidth="1.5"
                    opacity="0.5"
                  />
                );
              })()}

              {/* Label for resource/village locations */}
              {!isBuilding && !isCivCard && (
                <text
                  x={loc.x + loc.width / 2}
                  y={loc.y + 14}
                  textAnchor="middle"
                  fill="#f0e6d2"
                  fontSize="10"
                  fontWeight="700"
                  style={{ textShadow: '0 1px 3px rgba(0,0,0,0.9)', pointerEvents: 'none' }}
                  filter="url(#sa-glow)"
                >
                  {loc.label}
                </text>
              )}

              {/* Worker placement circles - only show filled slots with meeples */}
              {(isResource || loc.id === 'toolMaker' || loc.id === 'hut' || loc.id === 'field') && (
                <g style={{ pointerEvents: 'none' }}>
                  {slotPositions.map(([cx, cy], si) => {
                    const filled = filledSlots[si];
                    if (filled) {
                      return (
                        <image
                          key={si}
                          href={assetUrl(basePath, `players/figure-${filled.playerIdx}.png`)}
                          x={loc.x + cx - 16}
                          y={loc.y + cy - 18}
                          width={32}
                          height={36}
                          preserveAspectRatio="xMidYMid meet"
                        />
                      );
                    }
                    return null;
                  })}
                </g>
              )}

              {/* Location icon image */}
              {!isBuilding && !isCivCard && LOCATION_ICONS[loc.id] && loc.id !== 'toolMaker' && (
                <g style={{ pointerEvents: 'none' }}>
                  <image
                    href={assetUrl(basePath, LOCATION_ICONS[loc.id]!)}
                    x={loc.x + loc.width / 2 - 20}
                    y={loc.y + loc.height / 2 - 24}
                    width={50}
                    height={50}
                    preserveAspectRatio="xMidYMid meet"
                  />
                </g>
              )}

              {/* Tool Maker: show both tool-1 and tool-3 side by side */}
              {loc.id === 'toolMaker' && (
                <g style={{ pointerEvents: 'none' }}>
                  <image
                    href={assetUrl(basePath, 'tools/tool-1.jpg')}
                    x={loc.x + loc.width / 2 - 46}
                    y={loc.y + loc.height / 2 - 22}
                    width={36}
                    height={36}
                    preserveAspectRatio="xMidYMid meet"
                  />
                  <image
                    href={assetUrl(basePath, 'tools/tool-3.jpg')}
                    x={loc.x + loc.width / 2 + 10}
                    y={loc.y + loc.height / 2 - 22}
                    width={36}
                    height={36}
                    preserveAspectRatio="xMidYMid meet"
                  />
                </g>
              )}

              {/* Building tile image */}
              {isBuilding && !isEmpty && (() => {
                const idx = parseInt(loc.id.split('_')[1]);
                const topTile = gameState.buildingStacks[idx]?.[0];
                if (!topTile) return null;
                const clampedNum = getBuildingImageNum(topTile.id);
                return (
                  <>
                    {stackSize > 1 && (
                      <>
                        <rect x={loc.x + 4} y={loc.y + 4} width={loc.width - 8} height={loc.height - 8} rx={4} fill="#3a2510" opacity="0.6" />
                        <rect x={loc.x + 2} y={loc.y + 2} width={loc.width - 4} height={loc.height - 4} rx={4} fill="#4a3520" opacity="0.5" />
                      </>
                    )}
                    <image
                      href={assetUrl(basePath, `huts/building-hut-${clampedNum}.jpg`)}
                      x={loc.x + 4}
                      y={loc.y + 4}
                      width={loc.width - 8}
                      height={loc.height - 8}
                      preserveAspectRatio="xMidYMid meet"
                      style={{ cursor: 'zoom-in' }}
                      onDoubleClick={(e) => { e.stopPropagation(); setCardDetail({ type: 'building', index: clampedNum }); }}
                    />
                    <circle cx={loc.x + loc.width - 8} cy={loc.y + loc.height - 8} r={9} fill="rgba(26,18,7,0.85)" stroke="#d4a017" strokeWidth="1" />
                    <text x={loc.x + loc.width - 8} y={loc.y + loc.height - 5} textAnchor="middle" fill="#d4a017" fontSize="9" fontWeight="700">
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
                const clampedNum = getCardImageNum(card.id);
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
                    <circle cx={loc.x + 12} cy={loc.y + 12} r={9} fill="rgba(26,18,7,0.85)" stroke="#f0c040" strokeWidth="1.5" />
                    <text x={loc.x + 12} y={loc.y + 16} textAnchor="middle" fill="#f0c040" fontSize="9" fontWeight="700">
                      {idx + 1}
                    </text>
                  </>
                );
              })()}

              {/* Empty building/card slot */}
              {(isBuilding || isCivCard) && isEmpty && (
                <image
                  href={assetUrl(basePath, isBuilding ? 'huts/symbol-building.png' : 'cards/symbol-card.png')}
                  x={loc.x + loc.width / 2 - 10}
                  y={loc.y + loc.height / 2 - 10}
                  width={20}
                  height={20}
                  opacity={0.3}
                  style={{ pointerEvents: 'none' }}
                />
              )}

              {/* Worker count badge */}
              {workerCount > 0 && (
                <>
                  <circle
                    cx={loc.x + loc.width - 10}
                    cy={loc.y + 10}
                    r={9}
                    fill="rgba(26,18,7,0.9)"
                    stroke="#d4a017"
                    strokeWidth="1.5"
                  />
                  <text
                    x={loc.x + loc.width - 10}
                    y={loc.y + 14}
                    textAnchor="middle"
                    fill="#d4a017"
                    fontSize="10"
                    fontWeight="700"
                  >
                    {workerCount}
                  </text>
                </>
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
                  style={{ textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}
                >
                  BLOCKED
                </text>
              )}
            </g>
          );
        })}

        {/* Supply info with resource token images */}
        <g transform="translate(30, 510)">
          <text x="0" y="0" fill="#d4a017" fontSize="11" fontWeight="700">Supply</text>
          {(['wood', 'brick', 'stone', 'gold'] as const).map((res, i) => (
            <g key={res} transform={`translate(${50 + i * 75}, -4)`}>
              <image
                href={assetUrl(basePath, `resources/${res === 'wood' ? 'wood.png' : res === 'brick' ? 'brick.png' : res === 'stone' ? 'stone.png' : 'gold.png'}`)}
                x="0"
                y="-2"
                width="14"
                height="14"
                preserveAspectRatio="xMidYMid meet"
              />
              <text x="18" y="9" fill="#f0e6d2" fontSize="10" fontWeight="600">
                {gameState.supply[res]}
              </text>
            </g>
          ))}
        </g>

        {/* Round/phase info */}
        <g transform="translate(30, 536)">
          <text x="0" y="0" fill="#d4a017" fontSize="12" fontWeight="700">
            Round {gameState.roundNumber}
          </text>
          <text x="80" y="0" fill="#b8a88a" fontSize="10">
            {formatPhase(gameState.phase)}
          </text>
          <text x="230" y="0" fill="#7a6b52" fontSize="9">
            Deck: {gameState.civilizationDeck.length} cards
          </text>
        </g>

        {/* Player score track */}
        <g transform="translate(420, 510)">
          <text x="0" y="0" fill="#d4a017" fontSize="11" fontWeight="700">Scores</text>
          {gameState.players.map((p, i) => {
            const pIdx = getPlayerIndex(p.color);
            return (
              <g key={p.id} transform={`translate(${50 + i * 60}, -4)`}>
                <image
                  href={assetUrl(basePath, `players/marker-${pIdx}.gif`)}
                  x="0"
                  y="0"
                  width="12"
                  height="12"
                  preserveAspectRatio="xMidYMid meet"
                />
                <text x="16" y="10" fill={getPlayerColorHex(p.color)} fontSize="11" fontWeight="700">
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
