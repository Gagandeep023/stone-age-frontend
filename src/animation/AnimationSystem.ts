import type { GameState, ResourceType } from '../types/index.js';
import type { AnimationEvent } from '../types/three.js';

let eventCounter = 0;
function nextId(): string {
  return `anim-${++eventCounter}`;
}

export function diffStates(
  prev: GameState | null,
  next: GameState,
): AnimationEvent[] {
  if (!prev) return [];
  const events: AnimationEvent[] = [];

  // Phase change
  if (prev.phase !== next.phase) {
    events.push({
      id: nextId(),
      type: 'phaseChange',
      phase: next.phase,
      duration: 1500,
    });
  }

  // Worker placements
  for (const player of next.players) {
    const prevPlayer = prev.players.find(p => p.id === player.id);
    if (!prevPlayer) continue;

    for (const pw of player.placedWorkers) {
      const prevPw = prevPlayer.placedWorkers.find(p => p.location === pw.location);
      if (!prevPw || prevPw.count < pw.count) {
        events.push({
          id: nextId(),
          type: 'workerPlaced',
          playerId: player.id,
          location: pw.location,
          duration: 800,
        });
      }
    }

    // Dice rolls
    if (player.currentDiceRoll && !prevPlayer.currentDiceRoll) {
      events.push({
        id: nextId(),
        type: 'diceRoll',
        playerId: player.id,
        location: player.currentDiceRoll.location,
        dice: player.currentDiceRoll.dice,
        duration: 1500,
      });
    }

    // Resource collection
    for (const res of ['wood', 'brick', 'stone', 'gold', 'food'] as const) {
      const prevAmount = prevPlayer.resources[res];
      const nextAmount = player.resources[res];
      if (nextAmount > prevAmount) {
        events.push({
          id: nextId(),
          type: 'resourceCollected',
          playerId: player.id,
          resource: res === 'food' ? undefined : res as ResourceType,
          amount: nextAmount - prevAmount,
          duration: 1000,
        });
      }
    }

    // Building constructed
    if (player.buildings.length > prevPlayer.buildings.length) {
      events.push({
        id: nextId(),
        type: 'buildingConstructed',
        playerId: player.id,
        duration: 1000,
      });
    }

    // Card pickup
    if (player.civilizationCards.length > prevPlayer.civilizationCards.length) {
      events.push({
        id: nextId(),
        type: 'cardPickup',
        playerId: player.id,
        duration: 1200,
      });
    }

    // Tool upgrade
    const prevToolSum = prevPlayer.tools.reduce((s, t) => s + t.level, 0);
    const nextToolSum = player.tools.reduce((s, t) => s + t.level, 0);
    if (nextToolSum > prevToolSum || player.tools.length > prevPlayer.tools.length) {
      events.push({
        id: nextId(),
        type: 'toolUpgrade',
        playerId: player.id,
        duration: 600,
      });
    }

    // Score change
    if (player.score !== prevPlayer.score) {
      events.push({
        id: nextId(),
        type: 'scoreChange',
        playerId: player.id,
        amount: player.score - prevPlayer.score,
        duration: 800,
      });
    }
  }

  // Game over
  if (next.gameOver && !prev.gameOver) {
    events.push({
      id: nextId(),
      type: 'gameOver',
      duration: 3000,
    });
  }

  return events;
}
