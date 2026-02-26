import type { LocationId, ResourceType, GamePhase, PlayerColor } from './index.js';

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

export interface CameraPreset {
  position: [number, number, number];
  target: [number, number, number];
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

export interface LocationPosition {
  x: number;
  y: number;
  z: number;
  color: string;
  label: string;
}

export const LOCATION_3D_POSITIONS: Record<LocationId, LocationPosition> = {
  huntingGrounds: { x: -8, y: 0, z: -6, color: '#5a3a1a', label: 'Hunting' },
  forest: { x: -8, y: 0, z: -2, color: '#2d5016', label: 'Forest' },
  clayPit: { x: -8, y: 0, z: 2, color: '#8b4513', label: 'Clay Pit' },
  quarry: { x: -8, y: 0, z: 6, color: '#6b6b6b', label: 'Quarry' },
  river: { x: -4, y: 0, z: -6, color: '#1a5276', label: 'River' },
  toolMaker: { x: 0, y: 0, z: -6, color: '#7d6608', label: 'Tool Maker' },
  hut: { x: 0, y: 0, z: -2, color: '#784212', label: 'Hut' },
  field: { x: 0, y: 0, z: 2, color: '#4a7c2e', label: 'Field' },
  building_0: { x: 4, y: 0, z: -6, color: '#5d4e37', label: 'Building 1' },
  building_1: { x: 4, y: 0, z: -2, color: '#5d4e37', label: 'Building 2' },
  building_2: { x: 4, y: 0, z: 2, color: '#5d4e37', label: 'Building 3' },
  building_3: { x: 4, y: 0, z: 6, color: '#5d4e37', label: 'Building 4' },
  civCard_0: { x: 8, y: 0, z: -6, color: '#4a3728', label: 'Card 1' },
  civCard_1: { x: 8, y: 0, z: -2, color: '#4a3728', label: 'Card 2' },
  civCard_2: { x: 8, y: 0, z: 2, color: '#4a3728', label: 'Card 3' },
  civCard_3: { x: 8, y: 0, z: 6, color: '#4a3728', label: 'Card 4' },
};

export const PLAYER_3D_COLORS: Record<PlayerColor, string> = {
  red: '#cc4444',
  blue: '#4488cc',
  green: '#44aa44',
  yellow: '#ccaa22',
};

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
