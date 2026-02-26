import React from 'react';
import { useAssetPath, assetUrl } from '../../utils/assetPath.js';

interface ToolIconProps {
  level: number;
  used?: boolean;
  size?: number;
}

export function ToolIcon({ level, used = false, size = 24 }: ToolIconProps) {
  const basePath = useAssetPath();
  const clampedLevel = Math.min(Math.max(level, 1), 4);

  return (
    <div style={{
      position: 'relative',
      display: 'inline-block',
      width: size,
      height: size,
      opacity: used ? 0.4 : 1,
      filter: used ? 'grayscale(0.8)' : 'none',
      transition: 'opacity 0.2s, filter 0.2s',
    }}>
      <img
        src={assetUrl(basePath, `tools/tool-${clampedLevel}.jpg`)}
        alt={`Tool level ${level}`}
        width={size}
        height={size}
        style={{ objectFit: 'contain', borderRadius: 3 }}
        draggable={false}
      />
      {used && (
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: size * 0.6,
          color: '#cc4444',
          fontWeight: 700,
          textShadow: '0 1px 2px rgba(0,0,0,0.8)',
        }}>
          ✓
        </div>
      )}
    </div>
  );
}
