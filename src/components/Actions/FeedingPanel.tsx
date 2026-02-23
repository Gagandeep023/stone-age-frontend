import React, { useState } from 'react';
import type { PlayerState, ResourceType } from '../../types/index.js';
import { ResourceBadge } from '../Common/ResourceIcon.js';

interface FeedingPanelProps {
  player: PlayerState;
  onFeed: (resourcesAsFood?: Partial<Record<ResourceType, number>>) => void;
  onAcceptStarvation: () => void;
}

const RESOURCE_TYPES: ResourceType[] = ['wood', 'brick', 'stone', 'gold'];

export function FeedingPanel({ player, onFeed, onAcceptStarvation }: FeedingPanelProps) {
  const [resourcesAsFood, setResourcesAsFood] = useState<Partial<Record<ResourceType, number>>>({});

  const foodNeeded = player.totalWorkers;
  const foodAvailable = player.resources.food;
  const resourceFoodValue = Object.values(resourcesAsFood).reduce((s, v) => s + (v || 0), 0);
  const totalFood = foodAvailable + resourceFoodValue;
  const canFeed = totalFood >= foodNeeded;
  const surplus = totalFood - foodNeeded;

  const adjustResource = (res: ResourceType, delta: number) => {
    const current = resourcesAsFood[res] || 0;
    const max = player.resources[res];
    const newVal = Math.max(0, Math.min(max, current + delta));
    setResourcesAsFood({ ...resourcesAsFood, [res]: newVal });
  };

  if (player.hasFed) {
    return (
      <div className="sa-card">
        <div style={{ fontSize: 14, color: 'var(--sa-text-secondary)' }}>
          Workers fed. Waiting for other players...
        </div>
      </div>
    );
  }

  return (
    <div className="sa-card">
      <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>
        Feed Your Workers
      </div>

      <div style={{ fontSize: 13, marginBottom: 8 }}>
        Need: {foodNeeded} food | Have: {foodAvailable} food
        {foodAvailable >= foodNeeded ? (
          <span style={{ color: 'var(--sa-success)', marginLeft: 8 }}>Enough food!</span>
        ) : (
          <span style={{ color: 'var(--sa-error)', marginLeft: 8 }}>
            Short {foodNeeded - foodAvailable} food
          </span>
        )}
      </div>

      {foodAvailable < foodNeeded && (
        <>
          <div style={{ fontSize: 12, color: 'var(--sa-text-secondary)', marginBottom: 8 }}>
            Use resources as food (1 resource = 1 food):
          </div>

          {RESOURCE_TYPES.map(res => {
            const available = player.resources[res];
            const using = resourcesAsFood[res] || 0;
            if (available === 0) return null;

            return (
              <div key={res} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <ResourceBadge type={res} count={available} size={16} />
                <button
                  className="sa-btn"
                  style={{ padding: '2px 8px', fontSize: 11 }}
                  onClick={() => adjustResource(res, -1)}
                  disabled={using <= 0}
                >
                  -
                </button>
                <span style={{ minWidth: 20, textAlign: 'center', fontSize: 13, fontWeight: 600 }}>
                  {using}
                </span>
                <button
                  className="sa-btn"
                  style={{ padding: '2px 8px', fontSize: 11 }}
                  onClick={() => adjustResource(res, 1)}
                  disabled={using >= available}
                >
                  +
                </button>
              </div>
            );
          })}

          <div style={{ fontSize: 12, marginTop: 8, marginBottom: 8, color: canFeed ? 'var(--sa-success)' : 'var(--sa-error)' }}>
            Total food: {totalFood} / {foodNeeded} needed
            {surplus > 0 && ` (${surplus} surplus)`}
          </div>
        </>
      )}

      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
        <button
          className="sa-btn sa-btn-primary"
          onClick={() => onFeed(Object.keys(resourcesAsFood).length > 0 ? resourcesAsFood : undefined)}
          disabled={!canFeed && resourceFoodValue === 0 && foodAvailable === 0}
        >
          {canFeed ? 'Feed Workers' : 'Feed (partial)'}
        </button>

        {!canFeed && (
          <button
            className="sa-btn sa-btn-danger"
            onClick={onAcceptStarvation}
          >
            Accept -10 VP Penalty
          </button>
        )}
      </div>
    </div>
  );
}
