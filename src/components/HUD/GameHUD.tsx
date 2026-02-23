import React from 'react';
import type { GameState } from '../../types/index.js';
import { WorkerMeeple } from '../Common/WorkerMeeple.js';

interface GameHUDProps {
  gameState: GameState;
  userId: string;
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
  const currentPlayer = gameState.players[gameState.currentPlayerIndex];
  const isMyTurn = currentPlayer?.id === userId;

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      padding: '8px 16px',
      background: 'var(--sa-bg-secondary)',
      borderRadius: 'var(--sa-radius)',
      border: '1px solid var(--sa-border)',
      flexWrap: 'wrap',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ fontSize: 12, color: 'var(--sa-text-muted)' }}>Round</span>
        <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--sa-accent)' }}>
          {gameState.roundNumber}
        </span>
      </div>

      <div style={{ width: 1, height: 20, background: 'var(--sa-border)' }} />

      <div style={{
        padding: '3px 10px',
        borderRadius: 12,
        background: 'var(--sa-bg-board)',
        fontSize: 12,
        fontWeight: 600,
        color: 'var(--sa-accent)',
      }}>
        {formatPhase(gameState.phase)}
      </div>

      <div style={{ width: 1, height: 20, background: 'var(--sa-border)' }} />

      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        {currentPlayer && (
          <>
            <WorkerMeeple color={currentPlayer.color} size={16} />
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
          <div style={{ width: 1, height: 20, background: 'var(--sa-border)' }} />
          <span className="sa-pulse" style={{ fontSize: 12, color: 'var(--sa-gold)' }}>
            Choose dice reward...
          </span>
        </>
      )}
    </div>
  );
}
