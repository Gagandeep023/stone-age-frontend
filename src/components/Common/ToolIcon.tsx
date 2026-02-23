import React from 'react';

interface ToolIconProps {
  level: number;
  used?: boolean;
  size?: number;
}

export function ToolIcon({ level, used = false, size = 24 }: ToolIconProps) {
  const fill = used ? '#4a4a4a' : '#8B6914';
  const stroke = used ? '#333' : '#6a4f0f';

  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{ opacity: used ? 0.5 : 1 }}>
      {/* Hammer shape */}
      <rect x="10" y="2" width="4" height="10" rx="1" fill={fill} stroke={stroke} strokeWidth="1" />
      <rect x="5" y="2" width="14" height="5" rx="2" fill={fill} stroke={stroke} strokeWidth="1.5" />
      {/* Handle */}
      <rect x="11" y="11" width="2" height="10" fill="#5a3a0a" stroke="#3a2505" strokeWidth="0.5" />
      {/* Level indicator */}
      <text
        x="12"
        y="7"
        textAnchor="middle"
        fill="white"
        fontSize="7"
        fontWeight="bold"
      >
        {level}
      </text>
    </svg>
  );
}
