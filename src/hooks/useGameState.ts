import { useState, useCallback, useMemo } from 'react';
import type { GameState, PlayerState, LocationId } from '../types/index.js';

export function useGameState(userId: string) {
  const [gameState, setGameState] = useState<GameState | null>(null);

  const updateGameState = useCallback((state: GameState) => {
    setGameState(state);
  }, []);

  const myPlayer = useMemo((): PlayerState | null => {
    if (!gameState) return null;
    return gameState.players.find(p => p.id === userId) || null;
  }, [gameState, userId]);

  const isMyTurn = useMemo((): boolean => {
    if (!gameState || !myPlayer) return false;
    return gameState.players[gameState.currentPlayerIndex]?.id === userId;
  }, [gameState, myPlayer, userId]);

  const currentPlayer = useMemo((): PlayerState | null => {
    if (!gameState) return null;
    return gameState.players[gameState.currentPlayerIndex] || null;
  }, [gameState]);

  const availableLocations = useMemo((): LocationId[] => {
    if (!gameState || !myPlayer || !isMyTurn) return [];
    if (gameState.phase !== 'workerPlacement') return [];

    const all: LocationId[] = [
      'huntingGrounds', 'forest', 'clayPit', 'quarry', 'river',
      'toolMaker', 'hut', 'field',
      'building_0', 'building_1', 'building_2', 'building_3',
      'civCard_0', 'civCard_1', 'civCard_2', 'civCard_3',
    ];

    return all.filter(loc => {
      // Already placed here
      if (myPlayer.placedLocations.includes(loc)) return false;

      // Blocked village
      if (gameState.blockedVillageLocation === loc) return false;

      // Building stack empty
      if (loc.startsWith('building_')) {
        const idx = parseInt(loc.split('_')[1]);
        if (idx >= gameState.buildingStacks.length || gameState.buildingStacks[idx].length === 0) return false;
      }

      // Card slot empty
      if (loc.startsWith('civCard_')) {
        const idx = parseInt(loc.split('_')[1]);
        if (!gameState.civilizationDisplay[idx]) return false;
      }

      // Location capacity
      const maxWorkers: Record<string, number> = {
        huntingGrounds: 40, forest: 7, clayPit: 7, quarry: 7, river: 7,
        toolMaker: 1, hut: 2, field: 1,
        building_0: 1, building_1: 1, building_2: 1, building_3: 1,
        civCard_0: 1, civCard_1: 1, civCard_2: 1, civCard_3: 1,
      };
      const locState = gameState.board.locations[loc];
      if (locState && locState.totalWorkers >= (maxWorkers[loc] || 0)) return false;

      // Hut needs 2 workers
      if (loc === 'hut' && myPlayer.availableWorkers < 2) return false;

      return true;
    });
  }, [gameState, myPlayer, isMyTurn]);

  return {
    gameState,
    updateGameState,
    myPlayer,
    isMyTurn,
    currentPlayer,
    availableLocations,
  };
}
