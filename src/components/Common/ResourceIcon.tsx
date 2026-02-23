import React from 'react';
import type { ResourceType } from '../../types/index.js';

interface ResourceIconProps {
  type: ResourceType | 'food';
  size?: number;
}

const COLORS: Record<string, { fill: string; stroke: string }> = {
  wood: { fill: '#8B6914', stroke: '#6a4f0f' },
  brick: { fill: '#c45a3c', stroke: '#a04830' },
  stone: { fill: '#6B6B6B', stroke: '#505050' },
  gold: { fill: '#d4a017', stroke: '#b08010' },
  food: { fill: '#2D5016', stroke: '#1e3a0e' },
};

export function ResourceIcon({ type, size = 24 }: ResourceIconProps) {
  const color = COLORS[type];

  switch (type) {
    case 'wood':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24">
          <rect x="4" y="8" width="16" height="6" rx="3" fill={color.fill} stroke={color.stroke} strokeWidth="1.5" />
          <rect x="6" y="3" width="12" height="6" rx="3" fill={color.fill} stroke={color.stroke} strokeWidth="1.5" />
          <rect x="5" y="13" width="14" height="6" rx="3" fill={color.fill} stroke={color.stroke} strokeWidth="1.5" />
          <line x1="7" y1="6" x2="16" y2="6" stroke={color.stroke} strokeWidth="0.5" />
          <line x1="6" y1="11" x2="18" y2="11" stroke={color.stroke} strokeWidth="0.5" />
        </svg>
      );

    case 'brick':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24">
          <rect x="3" y="4" width="18" height="7" rx="1" fill={color.fill} stroke={color.stroke} strokeWidth="1.5" />
          <rect x="3" y="13" width="18" height="7" rx="1" fill={color.fill} stroke={color.stroke} strokeWidth="1.5" />
          <line x1="12" y1="4" x2="12" y2="11" stroke={color.stroke} strokeWidth="1" />
          <line x1="8" y1="13" x2="8" y2="20" stroke={color.stroke} strokeWidth="1" />
          <line x1="16" y1="13" x2="16" y2="20" stroke={color.stroke} strokeWidth="1" />
        </svg>
      );

    case 'stone':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24">
          <path d="M12 3 L20 9 L18 19 L6 19 L4 9 Z" fill={color.fill} stroke={color.stroke} strokeWidth="1.5" />
          <path d="M8 9 L16 9" stroke={color.stroke} strokeWidth="0.7" />
          <path d="M7 14 L17 14" stroke={color.stroke} strokeWidth="0.7" />
        </svg>
      );

    case 'gold':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24">
          <ellipse cx="12" cy="12" rx="8" ry="7" fill={color.fill} stroke={color.stroke} strokeWidth="1.5" />
          <ellipse cx="12" cy="12" rx="5" ry="4.5" fill="none" stroke={color.stroke} strokeWidth="0.7" />
          <circle cx="12" cy="12" r="2" fill={color.stroke} />
        </svg>
      );

    case 'food':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24">
          <ellipse cx="12" cy="14" rx="7" ry="5" fill={color.fill} stroke={color.stroke} strokeWidth="1.5" />
          <path d="M9 5 Q12 2 15 5 Q15 9 12 10 Q9 9 9 5Z" fill="#4a8029" stroke={color.stroke} strokeWidth="1" />
          <line x1="12" y1="10" x2="12" y2="14" stroke={color.stroke} strokeWidth="1.5" />
        </svg>
      );
  }
}

export function ResourceBadge({ type, count, size = 20 }: { type: ResourceType | 'food'; count: number; size?: number }) {
  return (
    <span className={`sa-resource-badge ${type}`}>
      <ResourceIcon type={type} size={size} />
      {count}
    </span>
  );
}
