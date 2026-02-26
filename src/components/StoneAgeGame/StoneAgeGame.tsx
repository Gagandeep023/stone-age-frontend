import React, { useState, useCallback, useRef, Suspense, lazy } from 'react';
import type {
  StoneAgeGameProps, GameState, LocationId, GamePhase, ChatMessage, ResourceType,
} from '../../types/index.js';
import type { AnimationEvent, Achievement } from '../../types/three.js';
import { ACHIEVEMENTS } from '../../types/three.js';
import { useStoneAgeSocket } from '../../hooks/useStoneAgeSocket.js';
import { useGameState } from '../../hooks/useGameState.js';
import { useAnimationQueue } from '../../hooks/useAnimationQueue.js';
import { useSoundManager } from '../../hooks/useSoundManager.js';
import { useCameraController } from '../../hooks/useCameraController.js';
import { useTurnTimer } from '../../hooks/useTurnTimer.js';
import { diffStates } from '../../animation/AnimationSystem.js';
import { GameBoard } from '../Board/GameBoard.js';
import { GameBoard3D } from '../Board/GameBoard3D.js';
import { GameOverlay } from '../Overlays/GameOverlay.js';
import { NotificationToast } from '../Overlays/NotificationToast.js';
import { TurnTimerOverlay } from '../Overlays/TurnTimerOverlay.js';
import { ScorePopup } from '../Overlays/ScorePopup.js';
import { AchievementBanner } from '../Overlays/AchievementBanner.js';
import { ChatPanel } from '../Overlays/ChatPanel.js';
import { VictoryCelebration } from '../Overlays/VictoryCelebration.js';
import { PlayerBoard } from '../PlayerBoard/PlayerBoard.js';
import { PlacementPanel } from '../Actions/PlacementPanel.js';
import { ActionPanel } from '../Actions/ActionPanel.js';
import { FeedingPanel } from '../Actions/FeedingPanel.js';
import { FlexResourcePicker } from '../Actions/FlexResourcePicker.js';
import { ResourceDicePicker } from '../Actions/ResourceDicePicker.js';
import { DiceForItemsPanel } from '../Actions/DiceForItemsPanel.js';
import { GameHUD } from '../HUD/GameHUD.js';
import { GameLog } from '../HUD/GameLog.js';
import { AssetContext } from '../../utils/assetPath.js';

export function StoneAgeGame({ gameId, wsBase, user, authToken, onLeave, assetBasePath = '/assets/stone-age' }: StoneAgeGameProps) {
  const [selectedLocation, setSelectedLocation] = useState<LocationId | null>(null);
  const [error, setError] = useState('');
  const [notification, setNotification] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [scorePopup, setScorePopup] = useState<{ amount: number; playerId: string } | null>(null);
  const [currentAchievement, setCurrentAchievement] = useState<Achievement | null>(null);
  const [use3D, setUse3D] = useState(true);
  const [unlockedAchievements, setUnlockedAchievements] = useState<Set<string>>(new Set());
  const leavingRef = React.useRef(false);
  const prevStateRef = useRef<GameState | null>(null);

  const {
    gameState, updateGameState, myPlayer, isMyTurn, currentPlayer, availableLocations,
  } = useGameState(user.id);

  const animationQueue = useAnimationQueue();
  const sound = useSoundManager();
  const camera = useCameraController();
  const timer = useTurnTimer({
    duration: 90,
    enabled: isMyTurn,
    onTimeout: () => {
      showNotification('Time is up!');
    },
  });

  const showNotification = useCallback((msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 3000);
  }, []);

  const checkAchievements = useCallback((state: GameState) => {
    if (!myPlayer) return;
    const checks: { id: string; condition: boolean }[] = [
      { id: 'firstBlood', condition: myPlayer.buildings.length >= 1 },
      { id: 'masterBuilder', condition: myPlayer.buildings.length >= 3 },
      { id: 'toolsmith', condition: myPlayer.tools.length >= 3 && myPlayer.tools.every(t => t.level >= 4) },
      { id: 'farmersDelight', condition: myPlayer.foodProduction >= 10 },
    ];
    if (myPlayer.currentDiceRoll?.resourcesEarned) {
      const loc = myPlayer.currentDiceRoll.location;
      if (loc === 'river' && myPlayer.currentDiceRoll.resourcesEarned >= 3) {
        checks.push({ id: 'goldRush', condition: true });
      }
    }
    for (const check of checks) {
      if (check.condition && !unlockedAchievements.has(check.id)) {
        const achievement = ACHIEVEMENTS.find(a => a.id === check.id);
        if (achievement) {
          setUnlockedAchievements(prev => new Set([...prev, check.id]));
          setCurrentAchievement(achievement);
          sound.play('notification');
        }
      }
    }
  }, [myPlayer, unlockedAchievements, sound]);

  const handleAnimationEvent = useCallback((event: AnimationEvent) => {
    switch (event.type) {
      case 'diceRoll':
        sound.play('diceRoll');
        break;
      case 'resourceCollected':
        sound.play('resourceCollect');
        break;
      case 'workerPlaced':
        sound.play('workerPlace');
        break;
      case 'buildingConstructed':
        sound.play('buildingBuild');
        break;
      case 'cardPickup':
        sound.play('cardFlip');
        break;
      case 'scoreChange':
        if (event.amount) {
          setScorePopup({ amount: event.amount, playerId: event.playerId || '' });
          setTimeout(() => setScorePopup(null), 1500);
        }
        break;
      case 'phaseChange':
        sound.play('turnStart');
        if (event.phase) {
          const preset = camera.getPresetForPhase(event.phase);
          camera.setPreset(preset);
        }
        break;
      case 'gameOver':
        sound.play('victory');
        camera.setPreset(camera.presets.victory);
        break;
    }
  }, [sound, camera]);

  const socket = useStoneAgeSocket({
    wsBase,
    authToken,
    onGameState: useCallback((state: GameState) => {
      if (leavingRef.current) return;

      const prev = prevStateRef.current;
      updateGameState(state);
      prevStateRef.current = state;

      // Generate animation events from state diff
      const events = diffStates(prev, state);
      if (events.length > 0) {
        animationQueue.enqueue(events);
        events.forEach(handleAnimationEvent);
      }

      // Check achievements
      checkAchievements(state);

      setError('');
    }, [updateGameState, animationQueue, handleAnimationEvent, checkAchievements]),
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
        sound.play('turnStart');
        timer.start();
      } else {
        timer.stop();
      }
    }, [user.id, showNotification, sound, timer]),
    onPlayerDisconnected: useCallback(() => {
      showNotification('A player disconnected');
    }, [showNotification]),
    onPlayerReconnected: useCallback(() => {
      showNotification('Player reconnected');
    }, [showNotification]),
    onGameEnded: useCallback((reason: string) => {
      leavingRef.current = true;
      onLeave();
    }, [onLeave]),
    onChat: useCallback((msg: ChatMessage) => {
      setChatMessages(prev => [...prev.slice(-49), msg]);
    }, []),
  });

  const handleLeave = useCallback(() => {
    leavingRef.current = true;
    socket.leaveRoom();
    onLeave();
  }, [socket, onLeave]);

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

  // Game over with celebration
  if (gameState.gameOver && gameState.finalScores) {
    return (
      <div className="sa-container sa-game-wrapper" style={{ position: 'relative' }}>
        <VictoryCelebration
          scores={gameState.finalScores}
          gameState={gameState}
          userId={user.id}
          onLeave={handleLeave}
        />
      </div>
    );
  }

  const handleLocationClick = (location: LocationId) => {
    if (gameState.phase === 'workerPlacement' && isMyTurn) {
      setSelectedLocation(location);
      sound.play('click');
    }
  };

  const handlePlace = (location: LocationId, count: number) => {
    socket.placeWorkers(location, count);
    setSelectedLocation(null);
  };

  const handleSendChat = (message: string) => {
    socket.sendChat(message);
  };

  const handleSendEmote = (emote: string) => {
    socket.sendChat(emote, emote);
  };

  return (
    <AssetContext.Provider value={assetBasePath}>
    <div className="sa-container sa-game-wrapper" style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 12, padding: 16 }}>
      {/* HUD */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ flex: 1 }}>
          <GameHUD gameState={gameState} userId={user.id} />
        </div>
        <button
          className="sa-btn"
          style={{ fontSize: 11, padding: '4px 8px' }}
          onClick={() => setUse3D(v => !v)}
        >
          {use3D ? '2D' : '3D'}
        </button>
        <button
          className="sa-btn"
          style={{ fontSize: 11, padding: '4px 8px' }}
          onClick={sound.toggleMute}
        >
          {sound.muted ? 'Unmute' : 'Mute'}
        </button>
      </div>

      {/* Main layout */}
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        {/* Left: Board */}
        <div style={{ flex: '1 1 500px', minWidth: 300, position: 'relative' }}>
          {use3D ? (
            <GameBoard3D
              gameState={gameState}
              availableLocations={isMyTurn ? availableLocations : []}
              onLocationClick={handleLocationClick}
              selectedLocation={selectedLocation}
              currentAnimation={animationQueue.currentAnimation}
              cameraPreset={camera.targetPreset}
            />
          ) : (
            <GameBoard
              gameState={gameState}
              availableLocations={isMyTurn ? availableLocations : []}
              onLocationClick={handleLocationClick}
              selectedLocation={selectedLocation}
            />
          )}

          {/* Overlay elements positioned over the board */}
          <GameOverlay>
            {/* Turn timer */}
            <TurnTimerOverlay
              timeLeft={timer.timeLeft}
              progress={timer.progress}
              color={timer.color}
              isRunning={timer.isRunning}
            />

            {/* Score popup */}
            {scorePopup && (
              <ScorePopup amount={scorePopup.amount} playerId={scorePopup.playerId} />
            )}

            {/* Achievement banner */}
            <AchievementBanner
              achievement={currentAchievement}
              onDismiss={() => setCurrentAchievement(null)}
            />

            {/* Chat */}
            <ChatPanel
              messages={chatMessages}
              onSendMessage={handleSendChat}
              onSendEmote={handleSendEmote}
            />

            {/* Pending flex resources picker */}
            {gameState.pendingFlexResources && gameState.pendingFlexResources.playerId === user.id && (
              <FlexResourcePicker
                pending={gameState.pendingFlexResources}
                onChoose={socket.chooseFlexResources}
              />
            )}

            {/* Pending resource dice picker */}
            {gameState.pendingResourceDice && gameState.pendingResourceDice.playerId === user.id && (
              <ResourceDicePicker
                pending={gameState.pendingResourceDice}
                onChoose={socket.chooseResourceDiceType}
              />
            )}

            {/* Pending dice-for-items */}
            {gameState.pendingDiceForItems && (
              <DiceForItemsPanel
                dice={gameState.pendingDiceForItems.dice}
                playerChoices={gameState.pendingDiceForItems.playerChoices}
                userId={user.id}
                onChoose={socket.chooseDiceReward}
              />
            )}
          </GameOverlay>
        </div>

        {/* Right: Controls + Players */}
        <div style={{ flex: '0 1 300px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Notifications */}
          {notification && (
            <NotificationToast message={notification} onDismiss={() => setNotification('')} />
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

          {/* Game controls */}
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <button className="sa-btn sa-btn-danger" onClick={handleLeave} style={{ flex: 1 }}>
              Leave Game
            </button>
            {gameState.players[0]?.id === user.id && (
              <button
                className="sa-btn sa-btn-danger"
                style={{ flex: 1, background: 'rgba(204,68,68,0.3)', borderColor: 'var(--sa-error)' }}
                onClick={() => {
                  if (confirm('End the game for all players?')) {
                    socket.endGame();
                  }
                }}
              >
                End Game
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
    </AssetContext.Provider>
  );
}
