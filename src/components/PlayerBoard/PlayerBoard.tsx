import React from 'react';
import type { PlayerState } from '../../types/index.js';
import { ResourceBadge } from '../Common/ResourceIcon.js';
import { ToolIcon } from '../Common/ToolIcon.js';
import { WorkerMeeple } from '../Common/WorkerMeeple.js';

interface PlayerBoardProps {
  player: PlayerState;
  isCurrentPlayer: boolean;
  isMyPlayer: boolean;
  compact?: boolean;
}

export function PlayerBoard({ player, isCurrentPlayer, isMyPlayer, compact }: PlayerBoardProps) {
  const borderColor = isCurrentPlayer ? 'var(--sa-accent)' : 'var(--sa-border)';
  const bgColor = isMyPlayer ? 'var(--sa-bg-secondary)' : 'var(--sa-bg-card)';

  return (
    <div
      className="sa-card"
      style={{
        borderColor,
        background: bgColor,
        borderWidth: isCurrentPlayer ? 2 : 1,
        opacity: player.connected ? 1 : 0.6,
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <WorkerMeeple color={player.color} size={20} />
        <span style={{ fontWeight: 600, fontSize: 14, flex: 1 }}>
          {player.name}
          {isMyPlayer && ' (You)'}
        </span>
        <span style={{ fontSize: 18, fontWeight: 700, color: 'var(--sa-accent)' }}>
          {player.score} VP
        </span>
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
            <WorkerMeeple color={player.color} size={14} />
            <span>{player.availableWorkers}/{player.totalWorkers} workers available</span>
          </div>

          {/* Food production */}
          <div style={{ fontSize: 12, color: 'var(--sa-text-secondary)', marginBottom: 6 }}>
            Food production: {player.foodProduction}/10
            <div style={{
              height: 4,
              background: 'var(--sa-bg-primary)',
              borderRadius: 2,
              marginTop: 2,
            }}>
              <div style={{
                height: '100%',
                width: `${(player.foodProduction / 10) * 100}%`,
                background: 'var(--sa-food)',
                borderRadius: 2,
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
              <ToolIcon key={i} level={tool.level} used={tool.usedThisRound} size={20} />
            ))}
            {player.oneUseTools.map((value, i) => (
              <span key={`ou-${i}`} style={{
                fontSize: 10,
                padding: '1px 4px',
                background: 'var(--sa-wood)',
                borderRadius: 3,
                color: 'white',
              }}>
                +{value}*
              </span>
            ))}
          </div>

          {/* Cards and buildings count */}
          <div style={{ fontSize: 12, color: 'var(--sa-text-secondary)' }}>
            Cards: {player.civilizationCards.length} | Buildings: {player.buildings.length}
          </div>
        </>
      )}
    </div>
  );
}
