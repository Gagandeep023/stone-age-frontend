import React, { useState, useCallback } from 'react';
import type { ResourceType, PendingFlexResources } from '../../types/index.js';

const RESOURCES: ResourceType[] = ['wood', 'brick', 'stone', 'gold'];
const RESOURCE_COLORS: Record<ResourceType, string> = {
  wood: 'var(--sa-wood)',
  brick: 'var(--sa-brick)',
  stone: 'var(--sa-stone)',
  gold: 'var(--sa-gold)',
};

interface FlexResourcePickerProps {
  pending: PendingFlexResources;
  onChoose: (chosen: Partial<Record<ResourceType, number>>) => void;
}

export function FlexResourcePicker({ pending, onChoose }: FlexResourcePickerProps) {
  const [chosen, setChosen] = useState<Record<ResourceType, number>>({
    wood: 0,
    brick: 0,
    stone: 0,
    gold: 0,
  });

  const total = Object.values(chosen).reduce((s, v) => s + v, 0);
  const remaining = pending.amount - total;

  const adjust = useCallback((res: ResourceType, delta: number) => {
    setChosen((prev) => {
      const next = { ...prev };
      next[res] = Math.max(0, prev[res] + delta);
      return next;
    });
  }, []);

  const handleConfirm = () => {
    if (remaining !== 0) return;
    const result: Partial<Record<ResourceType, number>> = {};
    for (const r of RESOURCES) {
      if (chosen[r] > 0) result[r] = chosen[r];
    }
    onChoose(result);
  };

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
      <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8, color: 'var(--sa-text-primary)' }}>
        Choose {pending.amount} Resource{pending.amount > 1 ? 's' : ''}
      </div>
      <div style={{ fontSize: 12, color: 'var(--sa-text-secondary)', marginBottom: 12 }}>
        Remaining: {remaining}
      </div>

      {RESOURCES.map((res) => (
        <div
          key={res}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 6,
            padding: '4px 8px',
            borderRadius: 'var(--sa-radius-sm)',
            background: 'rgba(58,44,21,0.5)',
          }}
        >
          <span style={{ fontSize: 13, color: RESOURCE_COLORS[res], fontWeight: 600, textTransform: 'capitalize' }}>
            {res}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              className="sa-btn"
              style={{ padding: '2px 8px', fontSize: 14, minWidth: 28 }}
              onClick={() => adjust(res, -1)}
              disabled={chosen[res] <= 0}
            >
              -
            </button>
            <span style={{ fontSize: 14, fontWeight: 600, minWidth: 20, textAlign: 'center' }}>
              {chosen[res]}
            </span>
            <button
              className="sa-btn"
              style={{ padding: '2px 8px', fontSize: 14, minWidth: 28 }}
              onClick={() => adjust(res, 1)}
              disabled={remaining <= 0}
            >
              +
            </button>
          </div>
        </div>
      ))}

      <button
        className="sa-btn sa-btn-primary"
        style={{ width: '100%', marginTop: 10 }}
        onClick={handleConfirm}
        disabled={remaining !== 0}
      >
        Confirm Selection
      </button>
    </div>
  );
}
