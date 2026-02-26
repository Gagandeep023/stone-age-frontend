import React from 'react';
import type { ResourceType, PendingResourceDice } from '../../types/index.js';

const RESOURCE_INFO: { type: ResourceType; label: string; divisor: number; color: string }[] = [
  { type: 'wood', label: 'Wood', divisor: 3, color: 'var(--sa-wood)' },
  { type: 'brick', label: 'Brick', divisor: 4, color: 'var(--sa-brick)' },
  { type: 'stone', label: 'Stone', divisor: 5, color: 'var(--sa-stone)' },
  { type: 'gold', label: 'Gold', divisor: 6, color: 'var(--sa-gold)' },
];

interface ResourceDicePickerProps {
  pending: PendingResourceDice;
  onChoose: (resource: ResourceType) => void;
}

export function ResourceDicePicker({ pending, onChoose }: ResourceDicePickerProps) {
  return (
    <div
      className="sa-card sa-fade-in"
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 280,
        pointerEvents: 'auto',
        zIndex: 40,
      }}
    >
      <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4, color: 'var(--sa-text-primary)' }}>
        Choose Resource Type
      </div>
      <div style={{ fontSize: 12, color: 'var(--sa-text-secondary)', marginBottom: 12 }}>
        Dice: [{pending.dice.join(', ')}] = {pending.total}
      </div>

      {RESOURCE_INFO.map((info) => {
        const amount = Math.floor(pending.total / info.divisor);
        return (
          <button
            key={info.type}
            className="sa-btn"
            style={{
              width: '100%',
              marginBottom: 6,
              display: 'flex',
              justifyContent: 'space-between',
              padding: '8px 12px',
            }}
            onClick={() => onChoose(info.type)}
          >
            <span style={{ color: info.color, fontWeight: 600 }}>{info.label}</span>
            <span style={{ color: 'var(--sa-text-secondary)', fontSize: 12 }}>
              / {info.divisor} = {amount}
            </span>
          </button>
        );
      })}
    </div>
  );
}
