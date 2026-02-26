import React from 'react';

interface GameOverlayProps {
  children: React.ReactNode;
}

export function GameOverlay({ children }: GameOverlayProps) {
  return (
    <div className="sa-game-overlay">
      {children}
    </div>
  );
}
