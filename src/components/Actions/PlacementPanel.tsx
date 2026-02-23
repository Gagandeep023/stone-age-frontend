import React, { useState } from 'react';
import type { LocationId, PlayerState } from '../../types/index.js';

interface PlacementPanelProps {
  player: PlayerState;
  selectedLocation: LocationId | null;
  onPlace: (location: LocationId, count: number) => void;
}

const LOCATION_NAMES: Record<string, string> = {
  huntingGrounds: 'Hunting Grounds',
  forest: 'Forest',
  clayPit: 'Clay Pit',
  quarry: 'Quarry',
  river: 'River',
  toolMaker: 'Tool Maker',
  hut: 'Hut',
  field: 'Field',
};

function getLocationLabel(loc: LocationId): string {
  if (loc.startsWith('building_')) return `Building Stack ${parseInt(loc.split('_')[1]) + 1}`;
  if (loc.startsWith('civCard_')) return `Civ Card Slot ${parseInt(loc.split('_')[1]) + 1}`;
  return LOCATION_NAMES[loc] || loc;
}

function getFixedWorkerCount(loc: LocationId): number | null {
  if (loc === 'toolMaker' || loc === 'field') return 1;
  if (loc === 'hut') return 2;
  if (loc.startsWith('building_') || loc.startsWith('civCard_')) return 1;
  return null;
}

export function PlacementPanel({ player, selectedLocation, onPlace }: PlacementPanelProps) {
  const [workerCount, setWorkerCount] = useState(1);

  if (!selectedLocation) {
    return (
      <div className="sa-card">
        <div style={{ fontSize: 14, color: 'var(--sa-text-secondary)' }}>
          Click a highlighted location on the board to place workers
        </div>
        <div style={{ fontSize: 12, color: 'var(--sa-text-muted)', marginTop: 4 }}>
          {player.availableWorkers} workers available
        </div>
      </div>
    );
  }

  const fixedCount = getFixedWorkerCount(selectedLocation);
  const count = fixedCount || workerCount;
  const maxWorkers = player.availableWorkers;

  return (
    <div className="sa-card">
      <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>
        Place at {getLocationLabel(selectedLocation)}
      </div>

      {!fixedCount && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <span style={{ fontSize: 13, color: 'var(--sa-text-secondary)' }}>Workers:</span>
          <button
            className="sa-btn"
            style={{ padding: '4px 10px', fontSize: 12 }}
            onClick={() => setWorkerCount(Math.max(1, workerCount - 1))}
            disabled={workerCount <= 1}
          >
            -
          </button>
          <span style={{ fontSize: 16, fontWeight: 600, minWidth: 24, textAlign: 'center' }}>
            {workerCount}
          </span>
          <button
            className="sa-btn"
            style={{ padding: '4px 10px', fontSize: 12 }}
            onClick={() => setWorkerCount(Math.min(maxWorkers, workerCount + 1))}
            disabled={workerCount >= maxWorkers}
          >
            +
          </button>
        </div>
      )}

      {fixedCount && (
        <div style={{ fontSize: 12, color: 'var(--sa-text-secondary)', marginBottom: 8 }}>
          Requires {fixedCount} worker{fixedCount > 1 ? 's' : ''}
        </div>
      )}

      <button
        className="sa-btn sa-btn-primary"
        onClick={() => onPlace(selectedLocation, count)}
        disabled={count > maxWorkers}
      >
        Place {count} Worker{count > 1 ? 's' : ''}
      </button>
    </div>
  );
}
