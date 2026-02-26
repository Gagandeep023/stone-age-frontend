import React from 'react';
import type { PlayerState, PlayerColor } from '../../types/index.js';
import { ResourceBadge } from '../Common/ResourceIcon.js';
import { ToolIcon } from '../Common/ToolIcon.js';
import { useAssetPath, assetUrl } from '../../utils/assetPath.js';

interface PlayerBoardProps {
  player: PlayerState;
  isCurrentPlayer: boolean;
  isMyPlayer: boolean;
  compact?: boolean;
}

function getPlayerIndex(color: PlayerColor): number {
  const map: Record<PlayerColor, number> = { red: 0, blue: 1, yellow: 2, green: 3 };
  return map[color];
}

export function PlayerBoard({ player, isCurrentPlayer, isMyPlayer, compact }: PlayerBoardProps) {
  const basePath = useAssetPath();
  const pIdx = getPlayerIndex(player.color);
  const borderColor = isCurrentPlayer ? 'var(--sa-accent)' : 'var(--sa-border)';

  return (
    <div
      className="sa-card sa-player-board"
      style={{
        borderColor,
        borderWidth: isCurrentPlayer ? 2 : 1,
        opacity: player.connected ? 1 : 0.6,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <img
          src={assetUrl(basePath, `players/figure-${pIdx}.png`)}
          alt={player.color}
          width={24}
          height={28}
          style={{ objectFit: 'contain' }}
          draggable={false}
        />
        <span style={{ fontWeight: 600, fontSize: 14, flex: 1 }}>
          {player.name}
          {isMyPlayer && ' (You)'}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <img
            src={assetUrl(basePath, `players/marker-${pIdx}.gif`)}
            alt="score"
            width={14}
            height={14}
            style={{ objectFit: 'contain' }}
            draggable={false}
          />
          <span style={{ fontSize: 18, fontWeight: 700, color: 'var(--sa-accent)' }}>
            {player.score}
          </span>
          <span style={{ fontSize: 11, color: 'var(--sa-text-muted)' }}>VP</span>
        </div>
      </div>

      {!player.connected && (
        <div style={{ fontSize: 11, color: 'var(--sa-error)', marginBottom: 4 }}>Disconnected</div>
      )}

      {/* Resources */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
        <ResourceBadge type="food" count={player.resources.food} size={16} />
        <ResourceBadge type="wood" count={player.resources.wood} size={16} />
        <ResourceBadge type="brick" count={player.resources.brick} size={16} />
        <ResourceBadge type="stone" count={player.resources.stone} size={16} />
        <ResourceBadge type="gold" count={player.resources.gold} size={16} />
      </div>

      {!compact && (
        <>
          {/* Workers */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 6, fontSize: 12, color: 'var(--sa-text-secondary)' }}>
            <img
              src={assetUrl(basePath, `players/figure-${pIdx}.png`)}
              alt="worker"
              width={14}
              height={16}
              style={{ objectFit: 'contain' }}
              draggable={false}
            />
            <span>{player.availableWorkers}/{player.totalWorkers} workers available</span>
          </div>

          {/* Food production */}
          <div style={{ fontSize: 12, color: 'var(--sa-text-secondary)', marginBottom: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 2 }}>
              <img
                src={assetUrl(basePath, 'ui/field-agriculture.png')}
                alt="food track"
                width={14}
                height={14}
                style={{ objectFit: 'contain' }}
                draggable={false}
              />
              Food production: {player.foodProduction}/10
            </div>
            <div style={{
              height: 6,
              background: 'var(--sa-bg-primary)',
              borderRadius: 3,
              border: '1px solid var(--sa-border)',
            }}>
              <div style={{
                height: '100%',
                width: `${(player.foodProduction / 10) * 100}%`,
                background: 'linear-gradient(90deg, var(--sa-food), var(--sa-food-light))',
                borderRadius: 3,
                transition: 'width 0.3s ease',
              }} />
            </div>
          </div>

          {/* Tools */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 6 }}>
            <span style={{ fontSize: 12, color: 'var(--sa-text-secondary)' }}>Tools:</span>
            {player.tools.length === 0 && (
              <span style={{ fontSize: 11, color: 'var(--sa-text-muted)' }}>None</span>
            )}
            {player.tools.map((tool, i) => (
              <ToolIcon key={i} level={tool.level} used={tool.usedThisRound} size={24} />
            ))}
            {player.oneUseTools.map((value, i) => (
              <span key={`ou-${i}`} style={{
                fontSize: 10,
                padding: '2px 6px',
                background: 'linear-gradient(135deg, var(--sa-wood), var(--sa-wood-light))',
                borderRadius: 4,
                color: 'white',
                fontWeight: 600,
                boxShadow: '0 1px 2px rgba(0,0,0,0.3)',
              }}>
                +{value}
              </span>
            ))}
          </div>

          {/* Cards and buildings count */}
          <div style={{ display: 'flex', gap: 12, fontSize: 12, color: 'var(--sa-text-secondary)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <img
                src={assetUrl(basePath, 'cards/symbol-card.png')}
                alt="cards"
                width={14}
                height={14}
                style={{ objectFit: 'contain' }}
                draggable={false}
              />
              {player.civilizationCards.length}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <img
                src={assetUrl(basePath, 'huts/symbol-building.png')}
                alt="buildings"
                width={14}
                height={14}
                style={{ objectFit: 'contain' }}
                draggable={false}
              />
              {player.buildings.length}
            </span>
          </div>
        </>
      )}
    </div>
  );
}
