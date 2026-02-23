import React, { useState, useCallback } from 'react';
import type { StoneAgeLobbyProps, GameRoom, GameState } from '../../types/index.js';
import { useStoneAgeSocket } from '../../hooks/useStoneAgeSocket.js';
import { WorkerMeeple } from '../Common/WorkerMeeple.js';

const PLAYER_COLORS = ['red', 'blue', 'green', 'yellow'] as const;

export function StoneAgeLobby({ apiBase, wsBase, user, authToken, onJoinGame }: StoneAgeLobbyProps) {
  const [rooms, setRooms] = useState<GameRoom[]>([]);
  const [currentRoom, setCurrentRoom] = useState<GameRoom | null>(null);
  const [newRoomName, setNewRoomName] = useState('');
  const [maxPlayers, setMaxPlayers] = useState(4);
  const [isPrivate, setIsPrivate] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [joinPasscode, setJoinPasscode] = useState('');
  const [error, setError] = useState('');

  const socket = useStoneAgeSocket({
    wsBase,
    authToken,
    onRoomList: useCallback((r: GameRoom[]) => setRooms(r), []),
    onRoomUpdate: useCallback((room: GameRoom) => {
      setCurrentRoom(room);
      setError('');
    }, []),
    onGameState: useCallback((state: GameState) => {
      if (state.gameId) {
        onJoinGame(state.gameId);
      }
    }, [onJoinGame]),
    onError: useCallback((msg: string) => setError(msg), []),
  });

  const handleCreateRoom = () => {
    if (!newRoomName.trim()) {
      setError('Please enter a room name');
      return;
    }
    if (!socket.connected) {
      setError('Not connected to server. Please wait or refresh.');
      return;
    }
    if (isPrivate && !passcode.trim()) {
      setError('Please enter a passcode for your private room');
      return;
    }
    socket.createRoom(newRoomName.trim(), maxPlayers, isPrivate ? passcode.trim() : undefined);
    setNewRoomName('');
    setPasscode('');
  };

  const handleJoinRoom = (roomId: string) => {
    if (!socket.connected) {
      setError('Not connected to server');
      return;
    }
    socket.joinRoom(roomId);
  };

  const handleJoinByCode = () => {
    if (!joinCode.trim()) {
      setError('Please enter a room code');
      return;
    }
    if (!socket.connected) {
      setError('Not connected to server');
      return;
    }
    socket.joinRoom(joinCode.trim(), joinPasscode.trim() || undefined);
    setJoinCode('');
    setJoinPasscode('');
  };

  const handleLeaveRoom = () => {
    socket.leaveRoom();
    setCurrentRoom(null);
  };

  const handleStartGame = () => {
    socket.startGame();
  };

  // ─── In a room waiting ───
  if (currentRoom) {
    const isHost = currentRoom.hostId === user.id;
    const canStart = currentRoom.players.length >= 2;

    return (
      <div className="sa-lobby">
        <div className="sa-lobby-room">
          <div className="sa-lobby-room-header">
            <h2 className="sa-lobby-room-title">{currentRoom.name}</h2>
            <div className="sa-lobby-room-header-right">
              {currentRoom.isPrivate && (
                <span className="sa-lobby-tag sa-lobby-tag-private">Private</span>
              )}
              <span className="sa-lobby-room-code">#{currentRoom.id}</span>
            </div>
          </div>

          {/* Share info for host */}
          {isHost && (
            <div className="sa-lobby-share-info">
              <span className="sa-lobby-share-label">Share this code with friends:</span>
              <span className="sa-lobby-share-code">{currentRoom.id}</span>
              {currentRoom.passcode && (
                <>
                  <span className="sa-lobby-share-label">Passcode:</span>
                  <span className="sa-lobby-share-code">{currentRoom.passcode}</span>
                </>
              )}
            </div>
          )}

          <div className="sa-lobby-players">
            <div className="sa-lobby-players-header">
              Players ({currentRoom.players.length}/{currentRoom.maxPlayers})
            </div>
            {currentRoom.players.map((p, i) => (
              <div key={p.id} className="sa-lobby-player">
                <WorkerMeeple color={PLAYER_COLORS[i]} size={20} />
                <div className="sa-lobby-player-info">
                  <span className={`sa-lobby-player-name ${p.id === user.id ? 'sa-lobby-player-you' : ''}`}>
                    {p.name}
                  </span>
                  <span className="sa-lobby-player-tags">
                    {p.id === currentRoom.hostId && <span className="sa-lobby-tag sa-lobby-tag-host">Host</span>}
                    {p.id === user.id && <span className="sa-lobby-tag sa-lobby-tag-you">You</span>}
                  </span>
                </div>
                <span className={`sa-lobby-status-dot ${p.connected ? 'sa-lobby-status-online' : 'sa-lobby-status-offline'}`} />
              </div>
            ))}

            {/* Empty slots */}
            {Array.from({ length: currentRoom.maxPlayers - currentRoom.players.length }).map((_, i) => (
              <div key={`empty-${i}`} className="sa-lobby-player sa-lobby-player-empty">
                <WorkerMeeple color={PLAYER_COLORS[currentRoom.players.length + i]} size={20} />
                <span className="sa-lobby-player-waiting">Waiting for player...</span>
              </div>
            ))}
          </div>

          {error && <div className="sa-lobby-error">{error}</div>}

          <div className="sa-lobby-actions">
            {isHost && (
              <button
                className="sa-btn sa-btn-primary sa-lobby-btn-start"
                onClick={handleStartGame}
                disabled={!canStart}
              >
                {canStart ? 'Start Game' : `Need ${2 - currentRoom.players.length} more player${currentRoom.players.length === 1 ? '' : 's'}`}
              </button>
            )}
            <button className="sa-btn sa-btn-danger" onClick={handleLeaveRoom}>
              Leave Room
            </button>
          </div>

          {!isHost && (
            <p className="sa-lobby-wait-msg sa-pulse">
              Waiting for host to start the game...
            </p>
          )}
        </div>
      </div>
    );
  }

  // ─── Lobby view ───
  return (
    <div className="sa-lobby">
      <div className="sa-lobby-header">
        <h1 className="sa-lobby-title">Stone Age</h1>
        <p className="sa-lobby-subtitle">
          Online multiplayer board game. Create or join a room to play.
        </p>
      </div>

      {/* Connection status */}
      <div className={`sa-lobby-connection ${socket.connected ? 'sa-lobby-connection-ok' : 'sa-lobby-connection-err'}`}>
        <span className="sa-lobby-connection-dot" />
        <span className="sa-lobby-connection-text">
          {socket.connected ? 'Connected' : socket.connectionError ? `Connection failed: ${socket.connectionError}` : 'Connecting to server...'}
        </span>
        {!socket.connected && socket.connectionError && (
          <button className="sa-btn sa-lobby-btn-retry" onClick={socket.reconnect}>
            Retry
          </button>
        )}
      </div>

      {/* Create room */}
      <div className="sa-card sa-lobby-create">
        <div className="sa-lobby-create-title">Create a Room</div>
        <div className="sa-lobby-create-form">
          <input
            type="text"
            className="sa-lobby-input"
            placeholder="Room name"
            value={newRoomName}
            onChange={e => setNewRoomName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleCreateRoom()}
            maxLength={32}
          />
          <select
            className="sa-lobby-select"
            value={maxPlayers}
            onChange={e => setMaxPlayers(parseInt(e.target.value))}
          >
            <option value={2}>2 Players</option>
            <option value={3}>3 Players</option>
            <option value={4}>4 Players</option>
          </select>
        </div>

        {/* Private room toggle + passcode */}
        <div className="sa-lobby-create-privacy">
          <label className="sa-lobby-toggle">
            <input
              type="checkbox"
              checked={isPrivate}
              onChange={e => setIsPrivate(e.target.checked)}
            />
            <span className="sa-lobby-toggle-slider" />
            <span className="sa-lobby-toggle-label">Private room</span>
          </label>
          {isPrivate && (
            <input
              type="text"
              className="sa-lobby-input sa-lobby-input-passcode"
              placeholder="Set passcode"
              value={passcode}
              onChange={e => setPasscode(e.target.value)}
              maxLength={20}
            />
          )}
        </div>

        <button
          className="sa-btn sa-btn-primary sa-lobby-create-btn"
          onClick={handleCreateRoom}
          disabled={!socket.connected || !newRoomName.trim() || (isPrivate && !passcode.trim())}
        >
          {isPrivate ? 'Create Private Room' : 'Create Public Room'}
        </button>
      </div>

      {/* Join by code (for private rooms) */}
      <div className="sa-card sa-lobby-join-code">
        <div className="sa-lobby-create-title">Join by Room Code</div>
        <p className="sa-lobby-join-code-hint">Have a room code from a friend? Enter it here.</p>
        <div className="sa-lobby-create-form">
          <input
            type="text"
            className="sa-lobby-input"
            placeholder="Room code"
            value={joinCode}
            onChange={e => setJoinCode(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleJoinByCode()}
            maxLength={8}
          />
          <input
            type="text"
            className="sa-lobby-input sa-lobby-input-passcode"
            placeholder="Passcode (if private)"
            value={joinPasscode}
            onChange={e => setJoinPasscode(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleJoinByCode()}
            maxLength={20}
          />
          <button
            className="sa-btn sa-btn-primary"
            onClick={handleJoinByCode}
            disabled={!socket.connected || !joinCode.trim()}
          >
            Join
          </button>
        </div>
      </div>

      {error && <div className="sa-lobby-error">{error}</div>}

      {/* Room list */}
      <div className="sa-lobby-rooms">
        <div className="sa-lobby-rooms-header">
          <span className="sa-lobby-rooms-title">Public Rooms</span>
          {rooms.length > 0 && <span className="sa-lobby-rooms-count">{rooms.length}</span>}
        </div>

        {rooms.length === 0 ? (
          <div className="sa-card sa-lobby-rooms-empty">
            <div className="sa-lobby-rooms-empty-icon">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                <circle cx="24" cy="24" r="20" stroke="var(--sa-border)" strokeWidth="2" strokeDasharray="4 4" />
                <path d="M18 24h12M24 18v12" stroke="var(--sa-text-muted)" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <p>No public rooms available yet.</p>
            <p className="sa-lobby-rooms-empty-hint">Create one or join a private room by code!</p>
          </div>
        ) : (
          rooms.map(room => (
            <div key={room.id} className="sa-card sa-lobby-room-card sa-fade-in">
              <div className="sa-lobby-room-card-info">
                <div className="sa-lobby-room-card-name">{room.name}</div>
                <div className="sa-lobby-room-card-meta">
                  <span className="sa-lobby-room-card-players">
                    {room.players.map((_, i) => (
                      <WorkerMeeple key={i} color={PLAYER_COLORS[i]} size={14} />
                    ))}
                    <span>{room.players.length}/{room.maxPlayers}</span>
                  </span>
                </div>
              </div>
              <button
                className="sa-btn sa-btn-primary"
                onClick={() => handleJoinRoom(room.id)}
                disabled={!socket.connected || room.players.length >= room.maxPlayers}
              >
                {room.players.length >= room.maxPlayers ? 'Full' : 'Join'}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
