// Shared types for the Stone Age game frontend
// These mirror the backend types that the frontend needs

export type ResourceType = 'wood' | 'brick' | 'stone' | 'gold';
export type PlayerColor = 'red' | 'blue' | 'green' | 'yellow';
export type GamePhase = 'workerPlacement' | 'actionResolution' | 'feeding';
export type LocationId =
  | 'huntingGrounds' | 'forest' | 'clayPit' | 'quarry' | 'river'
  | 'toolMaker' | 'hut' | 'field'
  | 'building_0' | 'building_1' | 'building_2' | 'building_3'
  | 'civCard_0' | 'civCard_1' | 'civCard_2' | 'civCard_3';

export type CultureSymbol =
  | 'writing' | 'medicine' | 'pottery' | 'art'
  | 'music' | 'weaving' | 'transport' | 'sundial';

export type MultiplierCategory = 'farmer' | 'toolMaker' | 'hutBuilder' | 'shaman';

export interface Tool {
  level: number;
  usedThisRound: boolean;
}

export interface PlayerResources {
  food: number;
  wood: number;
  brick: number;
  stone: number;
  gold: number;
}

export interface PlacedWorker {
  location: LocationId;
  count: number;
}

export interface DiceRollState {
  location: LocationId;
  dice: number[];
  total: number;
  toolsApplied: number[];
  finalTotal: number;
  resourcesEarned: number;
  resolved: boolean;
}

export interface PlayerState {
  id: string;
  name: string;
  color: PlayerColor;
  connected: boolean;
  totalWorkers: number;
  availableWorkers: number;
  placedWorkers: PlacedWorker[];
  resources: PlayerResources;
  foodProduction: number;
  score: number;
  tools: Tool[];
  oneUseTools: number[];
  civilizationCards: CivilizationCard[];
  buildings: BuildingTile[];
  placedLocations: LocationId[];
  hasFed: boolean;
  unresolvedLocations: LocationId[];
  currentDiceRoll: DiceRollState | null;
}

export interface CivilizationCard {
  id: string;
  immediateEffect: ImmediateEffect;
  scoringBottom: ScoringBottom;
}

export type ImmediateEffect =
  | { type: 'food'; amount: number }
  | { type: 'resource'; resource: ResourceType; amount: number }
  | { type: 'resourceDice'; diceCount: number }
  | { type: 'points'; amount: number }
  | { type: 'tool' }
  | { type: 'foodProduction' }
  | { type: 'cardDraw' }
  | { type: 'oneUseTool'; value: number }
  | { type: 'flexResources'; amount: number }
  | { type: 'diceForItems' };

export type ScoringBottom =
  | { type: 'culture'; symbol: CultureSymbol }
  | { type: 'multiplier'; category: MultiplierCategory; figureCount: number };

export type BuildingCost =
  | { type: 'fixed'; resources: Partial<Record<ResourceType, number>>; points: number }
  | { type: 'flexible'; count: number; differentTypes: number }
  | { type: 'variable'; minResources: number; maxResources: number };

export interface BuildingTile {
  id: string;
  cost: BuildingCost;
}

export interface LocationState {
  totalWorkers: number;
  workersByPlayer: Record<string, number>;
}

export interface BoardState {
  locations: Record<LocationId, LocationState>;
}

export interface ResourceSupply {
  wood: number;
  brick: number;
  stone: number;
  gold: number;
}

export interface GameLogEntry {
  timestamp: number;
  playerId?: string;
  message: string;
  type: string;
}

export interface FinalScore {
  playerId: string;
  playerName: string;
  inGameScore: number;
  cultureSetScore: number;
  multiplierScore: {
    farmer: { figures: number; value: number; score: number };
    toolMaker: { figures: number; value: number; score: number };
    hutBuilder: { figures: number; value: number; score: number };
    shaman: { figures: number; value: number; score: number };
    total: number;
  };
  resourceScore: number;
  totalScore: number;
}

export type DiceForItemsChoice =
  | { type: 'resource'; resource: ResourceType }
  | { type: 'tool' }
  | { type: 'foodProduction' };

export interface PendingFlexResources {
  playerId: string;
  amount: number;
  chosen: Partial<Record<ResourceType, number>> | null;
}

export interface PendingResourceDice {
  playerId: string;
  dice: number[];
  total: number;
  chosenResource: ResourceType | null;
}

export interface ChatMessage {
  playerId: string;
  playerName: string;
  message: string;
  emote?: string;
  timestamp?: number;
}

export interface GameState {
  gameId: string;
  roundNumber: number;
  phase: GamePhase;
  currentPlayerIndex: number;
  firstPlayerIndex: number;
  players: PlayerState[];
  board: BoardState;
  civilizationDeck: CivilizationCard[];
  civilizationDisplay: (CivilizationCard | null)[];
  buildingStacks: BuildingTile[][];
  supply: ResourceSupply;
  supplyFood: number;
  gameOver: boolean;
  winner: string | null;
  finalScores: FinalScore[] | null;
  blockedVillageLocation: string | null;
  pendingDiceForItems: {
    cardPlayerId: string;
    dice: number[];
    playerChoices: Record<string, DiceForItemsChoice | null>;
  } | null;
  pendingFlexResources: PendingFlexResources | null;
  pendingResourceDice: PendingResourceDice | null;
  log: GameLogEntry[];
}

export interface GameRoom {
  id: string;
  name: string;
  hostId: string;
  players: { id: string; name: string; picture?: string; connected: boolean }[];
  status: 'waiting' | 'playing' | 'finished';
  maxPlayers: number;
  createdAt: string;
  isPrivate: boolean;
  passcode?: string;
}

// Component props
export interface StoneAgeLobbyProps {
  apiBase: string;
  wsBase: string;
  user: { id: string; name: string; picture?: string };
  authToken: string;
  onJoinGame: (gameId: string) => void;
}

export interface StoneAgeGameProps {
  gameId: string;
  wsBase: string;
  user: { id: string; name: string; picture?: string };
  authToken: string;
  onLeave: () => void;
  assetBasePath?: string;
}
