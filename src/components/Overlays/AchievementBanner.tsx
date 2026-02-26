import React, { useEffect, useState } from 'react';
import type { Achievement } from '../../types/three.js';

interface AchievementBannerProps {
  achievement: Achievement | null;
  onDismiss: () => void;
}

export function AchievementBanner({ achievement, onDismiss }: AchievementBannerProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (achievement) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        onDismiss();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [achievement, onDismiss]);

  if (!achievement || !visible) return null;

  return (
    <div
      className="sa-achievement"
      style={{
        position: 'absolute',
        top: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        pointerEvents: 'auto',
        zIndex: 30,
        animation: 'sa-slide-down 0.4s ease-out',
      }}
    >
      <div style={{
        background: 'linear-gradient(135deg, rgba(212,160,23,0.95), rgba(180,130,10,0.95))',
        color: '#1a1207',
        padding: '10px 24px',
        borderRadius: '0 0 8px 8px',
        textAlign: 'center',
        minWidth: 200,
        boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
      }}>
        <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, opacity: 0.7 }}>
          Achievement Unlocked
        </div>
        <div style={{ fontSize: 16, fontWeight: 700, marginTop: 2 }}>
          {achievement.title}
        </div>
        <div style={{ fontSize: 12, opacity: 0.8, marginTop: 2 }}>
          {achievement.description}
        </div>
      </div>
    </div>
  );
}
