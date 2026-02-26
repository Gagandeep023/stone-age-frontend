import React from 'react';
import type { ResourceType } from '../../types/index.js';
import { useAssetPath, assetUrl } from '../../utils/assetPath.js';

interface ResourceIconProps {
  type: ResourceType | 'food';
  size?: number;
}

const RESOURCE_FILES: Record<string, string> = {
  wood: 'resources/wood.png',
  brick: 'resources/brick.png',
  stone: 'resources/stone.png',
  gold: 'resources/gold.png',
  food: 'resources/food.gif',
};

export function ResourceIcon({ type, size = 24 }: ResourceIconProps) {
  const basePath = useAssetPath();
  const file = RESOURCE_FILES[type];

  return (
    <img
      src={assetUrl(basePath, file)}
      alt={type}
      width={size}
      height={size}
      style={{ objectFit: 'contain', display: 'inline-block', verticalAlign: 'middle' }}
      draggable={false}
    />
  );
}

export function ResourceBadge({ type, count, size = 20 }: { type: ResourceType | 'food'; count: number; size?: number }) {
  return (
    <span className={`sa-resource-badge ${type}`}>
      <ResourceIcon type={type} size={size} />
      {count}
    </span>
  );
}
