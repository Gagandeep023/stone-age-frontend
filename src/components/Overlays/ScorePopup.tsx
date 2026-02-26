import React, { useEffect, useState } from 'react';

interface ScorePopupProps {
  amount: number;
  playerId: string;
}

export function ScorePopup({ amount, playerId }: ScorePopupProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  const isPositive = amount > 0;

  return (
    <div
      className="sa-score-popup"
      style={{
        position: 'absolute',
        top: '40%',
        left: '50%',
        transform: 'translateX(-50%)',
        fontSize: 28,
        fontWeight: 700,
        color: isPositive ? 'var(--sa-accent)' : 'var(--sa-error)',
        textShadow: '0 2px 8px rgba(0,0,0,0.5)',
        pointerEvents: 'none',
        zIndex: 25,
        animation: 'sa-score-float 1.5s ease-out forwards',
      }}
    >
      {isPositive ? '+' : ''}{amount} VP
    </div>
  );
}
