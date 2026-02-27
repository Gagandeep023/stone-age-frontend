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

// 3D board is 24x18 units. Positions proportionally mapped from board-full.jpg (755x498).
// Conversion: 3D_x = (2D_centerX / 755 * 24) - 12, 3D_z = (2D_centerY / 498 * 18) - 9
// X axis = left-right, Z axis = top-bottom (negative Z = top of board)
export const LOCATION_3D_POSITIONS: Record<LocationId, LocationPosition> = {
  // Resources: spread across top of board
  // Hunting: 2D center (117, 80) → 3D (-8.3, -6.1)
  huntingGrounds: { x: -8.3, y: 0, z: -6.1, color: '#5a3a1a', label: 'Hunting' },
  // Forest: 2D center (290, 80) → 3D (-2.8, -6.1)
  forest: { x: -3.5, y: 0, z: -7.1, color: '#2d5016', label: 'Forest' },
  // Clay Pit: 2D center (455, 78) → 3D (2.5, -6.2)
  clayPit: { x: 2.5, y: 0, z: -6.8, color: '#8b4513', label: 'Clay Pit' },
  // Quarry: 2D center (632, 85) → 3D (8.1, -5.9)
  quarry: { x: 8.8, y: 0, z: -6.8, color: '#6b6b6b', label: 'Quarry' },
  // River: 2D center (662, 233) → 3D (9.0, -0.6)
  river: { x: 10.0, y: 0, z: -0.6, color: '#1a5276', label: 'River' },

  // Village: center of board
  // Tool Maker: 2D center (355, 234) → 3D (-0.7, -0.5)
  toolMaker: { x: 1.0, y: 0, z: 2.5, color: '#7d6608', label: 'Tool Maker' },
  // Love Hut: 2D center (332, 161) → 3D (-1.5, -3.2)
  hut: { x: -1.5, y: 0, z: -3.2, color: '#784212', label: 'Love Hut' },
  // Field: 2D center (212, 282) → 3D (-5.3, 1.2)
  field: { x: -5.3, y: 0, z: 1.2, color: '#4a7c2e', label: 'Field' },

  // Bottom row: buildings left, cards right (same z, matching real board)
  // 2D center y=437 → 3D_z = (437/498*18)-9 = 6.8
  building_0: { x: -8.2, y: 0, z: 8.5, color: '#5d4e37', label: 'Building 1' },
  building_1: { x: -5.8, y: 0, z: 8.5, color: '#5d4e37', label: 'Building 2' },
  building_2: { x: -3.4, y: 0, z: 8.5, color: '#5d4e37', label: 'Building 3' },
  building_3: { x: -1.0, y: 0, z: 8.5, color: '#5d4e37', label: 'Building 4' },

  civCard_0: { x: 1.5, y: 0, z: 8.5, color: '#4a3728', label: 'Card 1' },
  civCard_1: { x: 4.0, y: 0, z: 8.5, color: '#4a3728', label: 'Card 2' },
  civCard_2: { x: 6.5, y: 0, z: 8.5, color: '#4a3728', label: 'Card 3' },
  civCard_3: { x: 9.0, y: 0, z: 8.5, color: '#4a3728', label: 'Card 4' },
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
