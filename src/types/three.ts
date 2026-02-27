import type { LocationId, ResourceType, GamePhase } from './index.js';

export type AnimationEventType =
  | 'workerPlaced'
  | 'diceRoll'
  | 'resourceCollected'
  | 'cardPickup'
  | 'buildingConstructed'
  | 'toolUpgrade'
  | 'phaseChange'
  | 'scoreChange'
  | 'gameOver';

export interface AnimationEvent {
  id: string;
  type: AnimationEventType;
  playerId?: string;
  location?: LocationId;
  resource?: ResourceType;
  amount?: number;
  dice?: number[];
  phase?: GamePhase;
  duration: number;
}

export type SoundName =
  | 'diceRoll'
  | 'diceLand'
  | 'cardFlip'
  | 'resourceCollect'
  | 'workerPlace'
  | 'buildingBuild'
  | 'notification'
  | 'turnStart'
  | 'victory'
  | 'click'
  | 'tick';

export type AchievementId =
  | 'firstBlood'
  | 'goldRush'
  | 'masterBuilder'
  | 'toolsmith'
  | 'farmersDelight';

export interface Achievement {
  id: AchievementId;
  title: string;
  description: string;
}

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'firstBlood', title: 'First Blood', description: 'Built your first building' },
  { id: 'goldRush', title: 'Gold Rush', description: 'Collected 3+ gold in one roll' },
  { id: 'masterBuilder', title: 'Master Builder', description: 'Built 3 or more buildings' },
  { id: 'toolsmith', title: 'Toolsmith', description: 'Maxed out all 3 tools' },
  { id: 'farmersDelight', title: "Farmer's Delight", description: 'Reached food production 10' },
];
