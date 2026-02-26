import React from 'react';
import type { GameState, PlayerColor } from '../../types/index.js';
import { useAssetPath, assetUrl } from '../../utils/assetPath.js';

interface GameHUDProps {
  gameState: GameState;
  userId: string;
}

function getPlayerIndex(color: PlayerColor): number {
  const map: Record<PlayerColor, number> = { red: 0, blue: 1, yellow: 2, green: 3 };
  return map[color];
}

function formatPhase(phase: string): string {
  switch (phase) {
    case 'workerPlacement': return 'Place Workers';
    case 'actionResolution': return 'Resolve Actions';
    case 'feeding': return 'Feed Workers';
    default: return phase;
  }
}

export function GameHUD({ gameState, userId }: GameHUDProps) {
  const basePath = useAssetPath();
  const currentPlayer = gameState.players[gameState.currentPlayerIndex];
  const isMyTurn = currentPlayer?.id === userId;

  return (
    <div className="sa-hud">
      {/* Logo */}
      <img
        src={assetUrl(basePath, 'ui/logo.png')}
        alt="Stone Age"
        height={28}
        style={{ objectFit: 'contain' }}
        draggable={false}
      />

      <div className="sa-hud-divider" />

      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ fontSize: 12, color: 'var(--sa-text-muted)' }}>Round</span>
        <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--sa-accent)' }}>
          {gameState.roundNumber}
        </span>
      </div>

      <div className="sa-hud-divider" />

      <div className="sa-hud-phase-badge">
        {formatPhase(gameState.phase)}
      </div>

      <div className="sa-hud-divider" />

      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {currentPlayer && (
          <>
            <img
              src={assetUrl(basePath, `players/figure-${getPlayerIndex(currentPlayer.color)}.png`)}
              alt={currentPlayer.color}
              width={18}
              height={22}
              style={{ objectFit: 'contain' }}
              draggable={false}
            />
            <span style={{
              fontSize: 13,
              fontWeight: 600,
              color: isMyTurn ? 'var(--sa-accent)' : 'var(--sa-text-primary)',
            }}>
              {isMyTurn ? 'Your Turn' : `${currentPlayer.name}'s Turn`}
            </span>
          </>
        )}
      </div>

      {gameState.pendingDiceForItems && (
        <>
          <div className="sa-hud-divider" />
          <span className="sa-pulse" style={{ fontSize: 12, color: 'var(--sa-gold)' }}>
            Choose dice reward...
          </span>
        </>
      )}
    </div>
  );
}
