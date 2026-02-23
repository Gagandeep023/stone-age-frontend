import { useEffect, useRef, useState, useCallback } from 'react';
import { io, type Socket } from 'socket.io-client';
import type { GameState, GameRoom, FinalScore, GamePhase, LocationId, ResourceType, DiceForItemsChoice } from '../types/index.js';

interface UseStoneAgeSocketOptions {
  wsBase: string;
  authToken: string;
  onGameState?: (state: GameState) => void;
  onRoomUpdate?: (room: GameRoom) => void;
  onRoomList?: (rooms: GameRoom[]) => void;
  onError?: (message: string) => void;
  onGameOver?: (scores: FinalScore[]) => void;
  onPhaseChange?: (phase: GamePhase, roundNumber: number) => void;
  onTurnChange?: (playerId: string) => void;
  onPlayerDisconnected?: (playerId: string) => void;
  onPlayerReconnected?: (playerId: string) => void;
}

export function useStoneAgeSocket(options: UseStoneAgeSocketOptions) {
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  useEffect(() => {
    const socket = io(`${options.wsBase}/stone-age`, {
      path: '/stone-age-ws',
      auth: { token: options.authToken },
      transports: ['polling', 'websocket'],
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setConnected(true);
      setConnectionError(null);
    });
    socket.on('disconnect', () => setConnected(false));
    socket.on('connect_error', (err) => {
      setConnectionError(err.message);
      options.onError?.(err.message);
    });

    socket.on('gameState', (state: GameState) => {
      options.onGameState?.(state);
    });

    socket.on('roomUpdate', (room: GameRoom) => {
      options.onRoomUpdate?.(room);
    });

    socket.on('roomList', (rooms: GameRoom[]) => {
      options.onRoomList?.(rooms);
    });

    socket.on('error', (data: { message: string }) => {
      options.onError?.(data.message);
    });

    socket.on('gameOver', (data: { finalScores: FinalScore[] }) => {
      options.onGameOver?.(data.finalScores);
    });

    socket.on('phaseChange', (data: { phase: GamePhase; roundNumber: number }) => {
      options.onPhaseChange?.(data.phase, data.roundNumber);
    });

    socket.on('turnChange', (data: { playerId: string }) => {
      options.onTurnChange?.(data.playerId);
    });

    socket.on('playerDisconnected', (data: { playerId: string }) => {
      options.onPlayerDisconnected?.(data.playerId);
    });

    socket.on('playerReconnected', (data: { playerId: string }) => {
      options.onPlayerReconnected?.(data.playerId);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [options.wsBase, options.authToken]);

  // --- Emit functions ---

  const createRoom = useCallback((name: string, maxPlayers: number, passcode?: string) => {
    socketRef.current?.emit('createRoom', { name, maxPlayers, passcode });
  }, []);

  const joinRoom = useCallback((roomId: string, passcode?: string) => {
    socketRef.current?.emit('joinRoom', { roomId, passcode });
  }, []);

  const leaveRoom = useCallback(() => {
    socketRef.current?.emit('leaveRoom');
  }, []);

  const startGame = useCallback(() => {
    socketRef.current?.emit('startGame');
  }, []);

  const placeWorkers = useCallback((location: LocationId, count: number) => {
    socketRef.current?.emit('placeWorkers', { location, count });
  }, []);

  const resolveAction = useCallback((location: LocationId) => {
    socketRef.current?.emit('resolveAction', { location });
  }, []);

  const useTools = useCallback((toolIndices: number[]) => {
    socketRef.current?.emit('useTools', { toolIndices });
  }, []);

  const confirmResourceGathering = useCallback(() => {
    socketRef.current?.emit('confirmResourceGathering');
  }, []);

  const payForBuilding = useCallback((resources: Partial<Record<ResourceType, number>>) => {
    socketRef.current?.emit('payForBuilding', { resources });
  }, []);

  const payForCard = useCallback((resources: ResourceType[]) => {
    socketRef.current?.emit('payForCard', { resources });
  }, []);

  const skipAction = useCallback(() => {
    socketRef.current?.emit('skipAction');
  }, []);

  const feedWorkers = useCallback((resourcesAsFood?: Partial<Record<ResourceType, number>>) => {
    socketRef.current?.emit('feedWorkers', { resourcesAsFood });
  }, []);

  const acceptStarvation = useCallback(() => {
    socketRef.current?.emit('acceptStarvation');
  }, []);

  const chooseDiceReward = useCallback((choice: DiceForItemsChoice) => {
    socketRef.current?.emit('chooseDiceReward', { choice });
  }, []);

  const reconnect = useCallback(() => {
    socketRef.current?.connect();
  }, []);

  return {
    connected,
    connectionError,
    createRoom,
    joinRoom,
    leaveRoom,
    startGame,
    placeWorkers,
    resolveAction,
    useTools,
    confirmResourceGathering,
    payForBuilding,
    payForCard,
    skipAction,
    feedWorkers,
    acceptStarvation,
    chooseDiceReward,
    reconnect,
  };
}
