import React, { useState, useEffect } from 'react';
import { useAssetPath, assetUrl } from '../../utils/assetPath.js';

interface DiceRollerProps {
  dice: number[];
  rolling?: boolean;
  size?: number;
}

function DiceFace({ value, size = 48, animating = false }: { value: number; size?: number; animating?: boolean }) {
  const basePath = useAssetPath();

  return (
    <div
      className={animating ? 'sa-dice-rolling' : ''}
      style={{
        width: size,
        height: size,
        filter: 'drop-shadow(2px 2px 3px rgba(0,0,0,0.4))',
        transition: animating ? 'none' : 'transform 0.2s',
      }}
    >
      <img
        src={assetUrl(basePath, `dice/dice-${value}.gif`)}
        alt={`Die: ${value}`}
        width={size}
        height={size}
        style={{ objectFit: 'contain', display: 'block' }}
        draggable={false}
      />
    </div>
  );
}

export function DiceRoller({ dice, rolling = false, size = 48 }: DiceRollerProps) {
  const basePath = useAssetPath();
  const [displayDice, setDisplayDice] = useState<number[]>(dice);
  const [isAnimating, setIsAnimating] = useState(rolling);

  useEffect(() => {
    if (rolling) {
      setIsAnimating(true);
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
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center' }}>
      <img
        src={assetUrl(basePath, 'dice/cup.png')}
        alt="Dice cup"
        width={size * 1.2}
        height={size * 1.2}
        style={{ objectFit: 'contain', marginRight: 4, opacity: 0.8 }}
        draggable={false}
      />
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
