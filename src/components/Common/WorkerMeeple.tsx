import React from 'react';
import type { PlayerColor } from '../../types/index.js';

const COLOR_MAP: Record<PlayerColor, string> = {
  red: '#cc4444',
  blue: '#4488cc',
  green: '#44aa44',
  yellow: '#ccaa22',
};

const STROKE_MAP: Record<PlayerColor, string> = {
  red: '#992222',
  blue: '#336699',
  green: '#338833',
  yellow: '#998811',
};

interface WorkerMeepleProps {
  color: PlayerColor;
  size?: number;
  className?: string;
}

export function WorkerMeeple({ color, size = 24, className }: WorkerMeepleProps) {
  const fill = COLOR_MAP[color];
  const stroke = STROKE_MAP[color];

  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
      {/* Head */}
      <circle cx="12" cy="6" r="4" fill={fill} stroke={stroke} strokeWidth="1.5" />
      {/* Body */}
      <path
        d="M6 22 L8 12 L16 12 L18 22 Z"
        fill={fill}
        stroke={stroke}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      {/* Arms */}
      <path
        d="M8 14 L4 18"
        stroke={stroke}
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M16 14 L20 18"
        stroke={stroke}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
