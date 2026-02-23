import React, { useEffect, useRef } from 'react';
import type { GameLogEntry } from '../../types/index.js';

interface GameLogProps {
  entries: GameLogEntry[];
  maxHeight?: number;
}

const TYPE_COLORS: Record<string, string> = {
  placement: '#4488cc',
  dice: '#d4a017',
  resource: '#44aa44',
  building: '#8B6914',
  card: '#9966cc',
  feeding: '#c45a3c',
  phase: '#d4a017',
  system: '#888',
};

export function GameLog({ entries, maxHeight = 200 }: GameLogProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [entries.length]);

  const recent = entries.slice(-50);

  return (
    <div
      ref={scrollRef}
      style={{
        maxHeight,
        overflowY: 'auto',
        padding: 8,
        background: 'var(--sa-bg-primary)',
        borderRadius: 'var(--sa-radius-sm)',
        border: '1px solid var(--sa-border)',
        fontSize: 11,
      }}
    >
      {recent.map((entry, i) => (
        <div
          key={i}
          style={{
            padding: '2px 0',
            color: TYPE_COLORS[entry.type] || 'var(--sa-text-secondary)',
            borderBottom: '1px solid rgba(90,74,42,0.2)',
          }}
        >
          {entry.message}
        </div>
      ))}
      {entries.length === 0 && (
        <div style={{ color: 'var(--sa-text-muted)' }}>Game log empty</div>
      )}
    </div>
  );
}
