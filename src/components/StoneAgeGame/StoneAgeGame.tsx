import React, { useState, useCallback } from 'react';
import type {
  StoneAgeGameProps, GameState, LocationId, FinalScore, GamePhase,
} from '../../types/index.js';
import { useStoneAgeSocket } from '../../hooks/useStoneAgeSocket.js';
import { useGameState } from '../../hooks/useGameState.js';
import { GameBoard } from '../Board/GameBoard.js';
import { PlayerBoard } from '../PlayerBoard/PlayerBoard.js';
import { PlacementPanel } from '../Actions/PlacementPanel.js';
import { ActionPanel } from '../Actions/ActionPanel.js';
import { FeedingPanel } from '../Actions/FeedingPanel.js';
import { GameHUD } from '../HUD/GameHUD.js';
import { GameLog } from '../HUD/GameLog.js';
import { FinalScoring } from '../Scoreboard/FinalScoring.js';

export function StoneAgeGame({ gameId, wsBase, user, authToken, onLeave }: StoneAgeGameProps) {
  const [selectedLocation, setSelectedLocation] = useState<LocationId | null>(null);
  const [error, setError] = useState('');
  const [notification, setNotification] = useState('');

  const {
    gameState, updateGameState, myPlayer, isMyTurn, currentPlayer, availableLocations,
  } = useGameState(user.id);

  const showNotification = useCallback((msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 3000);
  }, []);

  const socket = useStoneAgeSocket({
    wsBase,
    authToken,
    onGameState: useCallback((state: GameState) => {
      updateGameState(state);
      setError('');
    }, [updateGameState]),
    onError: useCallback((msg: string) => {
      setError(msg);
      setTimeout(() => setError(''), 5000);
    }, []),
    onPhaseChange: useCallback((phase: GamePhase) => {
      const names: Record<string, string> = {
        workerPlacement: 'Worker Placement',
        actionResolution: 'Action Resolution',
        feeding: 'Feeding',
      };
      showNotification(`Phase: ${names[phase] || phase}`);
    }, [showNotification]),
    onTurnChange: useCallback((playerId: string) => {
      if (playerId === user.id) {
        showNotification('Your turn!');
      }
    }, [user.id, showNotification]),
    onPlayerDisconnected: useCallback((playerId: string) => {
      showNotification('A player disconnected');
    }, [showNotification]),
    onPlayerReconnected: useCallback((playerId: string) => {
      showNotification('Player reconnected');
    }, [showNotification]),
  });

  // Loading state
  if (!gameState) {
    return (
      <div className="sa-container" style={{ padding: 24, textAlign: 'center' }}>
        <div className="sa-pulse" style={{ fontSize: 16 }}>Loading game...</div>
        <div style={{ marginTop: 8, fontSize: 12, color: 'var(--sa-text-muted)' }}>
          {socket.connected ? 'Connected, waiting for game state' : 'Connecting to server...'}
        </div>
      </div>
    );
  }

  // Game over
  if (gameState.gameOver && gameState.finalScores) {
    return (
      <div className="sa-container" style={{ padding: 24 }}>
        <FinalScoring
          scores={gameState.finalScores}
          gameState={gameState}
          userId={user.id}
          onLeave={onLeave}
        />
      </div>
    );
  }

  const handleLocationClick = (location: LocationId) => {
    if (gameState.phase === 'workerPlacement' && isMyTurn) {
      setSelectedLocation(location);
    }
  };

  const handlePlace = (location: LocationId, count: number) => {
    socket.placeWorkers(location, count);
    setSelectedLocation(null);
  };

  return (
    <div className="sa-container" style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: 16 }}>
      {/* HUD */}
      <GameHUD gameState={gameState} userId={user.id} />

      {/* Notifications */}
      {notification && (
        <div className="sa-fade-in" style={{
          padding: '6px 12px',
          background: 'rgba(212,160,23,0.2)',
          border: '1px solid var(--sa-accent)',
          borderRadius: 'var(--sa-radius-sm)',
          fontSize: 13,
          color: 'var(--sa-accent)',
          textAlign: 'center',
        }}>
          {notification}
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{
          padding: '6px 12px',
          background: 'rgba(204,68,68,0.15)',
          border: '1px solid var(--sa-error)',
          borderRadius: 'var(--sa-radius-sm)',
          fontSize: 13,
          color: 'var(--sa-error)',
          textAlign: 'center',
        }}>
          {error}
        </div>
      )}

      {/* Main layout */}
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        {/* Left: Board */}
        <div style={{ flex: '1 1 500px', minWidth: 300 }}>
          <GameBoard
            gameState={gameState}
            availableLocations={isMyTurn ? availableLocations : []}
            onLocationClick={handleLocationClick}
            selectedLocation={selectedLocation}
          />
        </div>

        {/* Right: Controls + Players */}
        <div style={{ flex: '0 1 300px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Action panel */}
          {isMyTurn && myPlayer && (
            <>
              {gameState.phase === 'workerPlacement' && (
                <PlacementPanel
                  player={myPlayer}
                  selectedLocation={selectedLocation}
                  onPlace={handlePlace}
                />
              )}

              {gameState.phase === 'actionResolution' && (
                <ActionPanel
                  player={myPlayer}
                  gameState={gameState}
                  onResolveAction={socket.resolveAction}
                  onUseTools={socket.useTools}
                  onConfirmGathering={socket.confirmResourceGathering}
                  onPayForBuilding={socket.payForBuilding}
                  onPayForCard={socket.payForCard}
                  onSkipAction={socket.skipAction}
                />
              )}

              {gameState.phase === 'feeding' && (
                <FeedingPanel
                  player={myPlayer}
                  onFeed={socket.feedWorkers}
                  onAcceptStarvation={socket.acceptStarvation}
                />
              )}
            </>
          )}

          {!isMyTurn && (
            <div className="sa-card">
              <div style={{ fontSize: 13, color: 'var(--sa-text-secondary)', textAlign: 'center' }}>
                Waiting for {currentPlayer?.name}...
              </div>
            </div>
          )}

          {/* Player boards */}
          {gameState.players.map(p => (
            <PlayerBoard
              key={p.id}
              player={p}
              isCurrentPlayer={p.id === currentPlayer?.id}
              isMyPlayer={p.id === user.id}
              compact={p.id !== user.id}
            />
          ))}

          {/* Game log */}
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--sa-text-secondary)' }}>
            Game Log
          </div>
          <GameLog entries={gameState.log} maxHeight={160} />

          {/* Leave button */}
          <button className="sa-btn sa-btn-danger" onClick={onLeave} style={{ marginTop: 8 }}>
            Leave Game
          </button>
        </div>
      </div>
    </div>
  );
}
