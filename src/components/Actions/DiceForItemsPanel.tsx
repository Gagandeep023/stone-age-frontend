import React from 'react';
import type { DiceForItemsChoice, ResourceType } from '../../types/index.js';

interface DiceForItemsPanelProps {
  dice: number[];
  playerChoices: Record<string, DiceForItemsChoice | null>;
  userId: string;
  onChoose: (choice: DiceForItemsChoice) => void;
}

function getOptionsForDie(value: number): { label: string; choice: DiceForItemsChoice }[] {
  switch (value) {
    case 1:
    case 2:
      return [
        { label: 'Wood', choice: { type: 'resource', resource: 'wood' as ResourceType } },
        { label: 'Brick', choice: { type: 'resource', resource: 'brick' as ResourceType } },
        { label: 'Stone', choice: { type: 'resource', resource: 'stone' as ResourceType } },
        { label: 'Gold', choice: { type: 'resource', resource: 'gold' as ResourceType } },
      ];
    case 3:
      return [{ label: 'Stone (forced)', choice: { type: 'resource', resource: 'stone' as ResourceType } }];
    case 4:
      return [{ label: 'Gold (forced)', choice: { type: 'resource', resource: 'gold' as ResourceType } }];
    case 5:
      return [{ label: 'Tool (forced)', choice: { type: 'tool' } }];
    case 6:
      return [{ label: 'Food Production (forced)', choice: { type: 'foodProduction' } }];
    default:
      return [];
  }
}

export function DiceForItemsPanel({ dice, playerChoices, userId, onChoose }: DiceForItemsPanelProps) {
  const hasChosen = playerChoices[userId] !== undefined && playerChoices[userId] !== null;

  if (hasChosen) {
    return (
      <div
        className="sa-card sa-fade-in"
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 260,
          pointerEvents: 'auto',
          zIndex: 40,
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: 13, color: 'var(--sa-text-secondary)' }}>
          Waiting for other players to choose...
        </div>
      </div>
    );
  }

  return (
    <div
      className="sa-card sa-fade-in"
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 300,
        pointerEvents: 'auto',
        zIndex: 40,
        maxHeight: '80vh',
        overflowY: 'auto',
      }}
    >
      <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4, color: 'var(--sa-text-primary)' }}>
        Dice for Items
      </div>
      <div style={{ fontSize: 12, color: 'var(--sa-text-secondary)', marginBottom: 12 }}>
        Choose a reward for each die
      </div>

      {dice.map((value, i) => {
        const options = getOptionsForDie(value);
        return (
          <div key={i} style={{ marginBottom: 10 }}>
            <div style={{
              fontSize: 12,
              fontWeight: 600,
              color: 'var(--sa-accent)',
              marginBottom: 4,
            }}>
              Die {i + 1}: {value}
            </div>
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              {options.map((opt) => (
                <button
                  key={opt.label}
                  className="sa-btn"
                  style={{ fontSize: 11, padding: '4px 10px' }}
                  onClick={() => onChoose(opt.choice)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
