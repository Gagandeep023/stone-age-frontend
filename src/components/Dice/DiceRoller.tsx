import React, { useState, useEffect } from 'react';

interface DiceRollerProps {
  dice: number[];
  rolling?: boolean;
  size?: number;
}

function DiceFace({ value, size = 48, animating = false }: { value: number; size?: number; animating?: boolean }) {
  const dotPositions: Record<number, Array<[number, number]>> = {
    1: [[24, 24]],
    2: [[14, 14], [34, 34]],
    3: [[14, 14], [24, 24], [34, 34]],
    4: [[14, 14], [34, 14], [14, 34], [34, 34]],
    5: [[14, 14], [34, 14], [24, 24], [14, 34], [34, 34]],
    6: [[14, 12], [34, 12], [14, 24], [34, 24], [14, 36], [34, 36]],
  };

  const dots = dotPositions[value] || [];

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      className={animating ? 'sa-dice-rolling' : ''}
      style={{ filter: 'drop-shadow(2px 2px 3px rgba(0,0,0,0.3))' }}
    >
      <rect x="2" y="2" width="44" height="44" rx="8" fill="#f0e6d2" stroke="#8B6914" strokeWidth="2" />
      {dots.map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r="4.5" fill="#1a1207" />
      ))}
    </svg>
  );
}

export function DiceRoller({ dice, rolling = false, size = 48 }: DiceRollerProps) {
  const [displayDice, setDisplayDice] = useState<number[]>(dice);
  const [isAnimating, setIsAnimating] = useState(rolling);

  useEffect(() => {
    if (rolling) {
      setIsAnimating(true);
      // Show random faces during animation
      const interval = setInterval(() => {
        setDisplayDice(dice.map(() => Math.floor(Math.random() * 6) + 1));
      }, 100);

      const timeout = setTimeout(() => {
        clearInterval(interval);
        setDisplayDice(dice);
        setIsAnimating(false);
      }, 500);

      return () => {
        clearInterval(interval);
        clearTimeout(timeout);
      };
    } else {
      setDisplayDice(dice);
      setIsAnimating(false);
    }
  }, [dice, rolling]);

  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
      {displayDice.map((value, i) => (
        <DiceFace key={i} value={value} size={size} animating={isAnimating} />
      ))}
    </div>
  );
}

export function DiceResult({
  dice,
  total,
  toolBonus,
  finalTotal,
  resourcesEarned,
  resourceName,
}: {
  dice: number[];
  total: number;
  toolBonus: number;
  finalTotal: number;
  resourcesEarned: number;
  resourceName: string;
}) {
  return (
    <div className="sa-card" style={{ textAlign: 'center' }}>
      <DiceRoller dice={dice} size={40} />
      <div style={{ marginTop: 12, fontSize: 14, color: 'var(--sa-text-secondary)' }}>
        Total: {total}
        {toolBonus > 0 && ` + ${toolBonus} (tools) = ${finalTotal}`}
      </div>
      <div style={{ marginTop: 4, fontSize: 18, fontWeight: 600, color: 'var(--sa-accent)' }}>
        {resourcesEarned} {resourceName}
      </div>
    </div>
  );
}
