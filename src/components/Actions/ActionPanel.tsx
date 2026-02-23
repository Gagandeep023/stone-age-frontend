import React, { useState } from 'react';
import type { PlayerState, LocationId, ResourceType, GameState } from '../../types/index.js';
import { DiceRoller, DiceResult } from '../Dice/DiceRoller.js';
import { ToolIcon } from '../Common/ToolIcon.js';
import { ResourceIcon } from '../Common/ResourceIcon.js';

interface ActionPanelProps {
  player: PlayerState;
  gameState: GameState;
  onResolveAction: (location: LocationId) => void;
  onUseTools: (toolIndices: number[]) => void;
  onConfirmGathering: () => void;
  onPayForBuilding: (resources: Partial<Record<ResourceType, number>>) => void;
  onPayForCard: (resources: ResourceType[]) => void;
  onSkipAction: () => void;
}

const RESOURCE_LOCATION_MAP: Record<string, string> = {
  huntingGrounds: 'food',
  forest: 'wood',
  clayPit: 'brick',
  quarry: 'stone',
  river: 'gold',
};

const LOCATION_NAMES: Record<string, string> = {
  huntingGrounds: 'Hunting Grounds', forest: 'Forest', clayPit: 'Clay Pit',
  quarry: 'Quarry', river: 'River', toolMaker: 'Tool Maker', hut: 'Hut', field: 'Field',
};

function getLocationLabel(loc: string): string {
  if (loc.startsWith('building_')) return `Building Stack ${parseInt(loc.split('_')[1]) + 1}`;
  if (loc.startsWith('civCard_')) return `Civ Card ${parseInt(loc.split('_')[1]) + 1}`;
  return LOCATION_NAMES[loc] || loc;
}

export function ActionPanel({
  player, gameState, onResolveAction, onUseTools,
  onConfirmGathering, onPayForBuilding, onPayForCard, onSkipAction,
}: ActionPanelProps) {
  const [selectedTools, setSelectedTools] = useState<number[]>([]);
  const [buildingPayment, setBuildingPayment] = useState<Partial<Record<ResourceType, number>>>({});
  const [cardPayment, setCardPayment] = useState<ResourceType[]>([]);

  // If there's a pending dice roll
  if (player.currentDiceRoll && !player.currentDiceRoll.resolved) {
    const roll = player.currentDiceRoll;
    const resourceName = RESOURCE_LOCATION_MAP[roll.location] || 'resources';
    const toolBonus = selectedTools.reduce((sum, idx) => {
      if (idx < player.tools.length) return sum + player.tools[idx].level;
      const ouIdx = idx - player.tools.length;
      if (ouIdx < player.oneUseTools.length) return sum + player.oneUseTools[ouIdx];
      return sum;
    }, 0);

    return (
      <div className="sa-card">
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>
          Dice Roll at {getLocationLabel(roll.location)}
        </div>

        <DiceRoller dice={roll.dice} size={36} />

        <div style={{ margin: '8px 0', fontSize: 13, color: 'var(--sa-text-secondary)' }}>
          Total: {roll.total}
          {toolBonus > 0 && ` + ${toolBonus} = ${roll.total + toolBonus}`}
          {' => '}{roll.resourcesEarned} {resourceName}
        </div>

        {/* Tool selection */}
        {(player.tools.length > 0 || player.oneUseTools.length > 0) && (
          <div style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 12, color: 'var(--sa-text-secondary)', marginBottom: 4 }}>Use tools:</div>
            <div style={{ display: 'flex', gap: 4 }}>
              {player.tools.map((tool, i) => (
                <button
                  key={i}
                  className={`sa-btn ${selectedTools.includes(i) ? 'sa-btn-primary' : ''}`}
                  style={{ padding: '2px 6px' }}
                  disabled={tool.usedThisRound}
                  onClick={() => {
                    const newTools = selectedTools.includes(i)
                      ? selectedTools.filter(t => t !== i)
                      : [...selectedTools, i];
                    setSelectedTools(newTools);
                    onUseTools(newTools);
                  }}
                >
                  <ToolIcon level={tool.level} used={tool.usedThisRound} size={18} />
                </button>
              ))}
            </div>
          </div>
        )}

        <button className="sa-btn sa-btn-primary" onClick={onConfirmGathering}>
          Collect {roll.resourcesEarned} {resourceName}
        </button>
      </div>
    );
  }

  // Show unresolved locations
  if (player.unresolvedLocations.length === 0) {
    return (
      <div className="sa-card">
        <div style={{ fontSize: 14, color: 'var(--sa-text-secondary)' }}>
          All actions resolved. Waiting for other players...
        </div>
      </div>
    );
  }

  return (
    <div className="sa-card">
      <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>
        Resolve Your Actions
      </div>
      <div style={{ fontSize: 12, color: 'var(--sa-text-secondary)', marginBottom: 8 }}>
        Choose a location to resolve:
      </div>

      {player.unresolvedLocations.map(loc => (
        <div key={loc} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <button
            className="sa-btn"
            onClick={() => onResolveAction(loc)}
            style={{ flex: 1, justifyContent: 'flex-start' }}
          >
            {getLocationLabel(loc)}
          </button>
          {(loc.startsWith('building_') || loc.startsWith('civCard_')) && (
            <button
              className="sa-btn sa-btn-danger"
              onClick={onSkipAction}
              style={{ padding: '4px 8px', fontSize: 11 }}
            >
              Skip
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
