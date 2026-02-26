import React, { useEffect, useState, useMemo } from 'react';
import type { FinalScore, GameState } from '../../types/index.js';

interface VictoryCelebrationProps {
  scores: FinalScore[];
  gameState: GameState;
  userId: string;
  onLeave: () => void;
}

interface ConfettiPiece {
  id: number;
  x: number;
  delay: number;
  duration: number;
  color: string;
  size: number;
}

export function VictoryCelebration({ scores, gameState, userId, onLeave }: VictoryCelebrationProps) {
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [animatedScores, setAnimatedScores] = useState<Record<string, number>>({});

  const winner = scores[0];
  const isWinner = winner?.playerId === userId;

  const confetti = useMemo<ConfettiPiece[]>(() => {
    const colors = ['#d4a017', '#cc4444', '#4488cc', '#44aa44', '#ccaa22', '#ff6600'];
    return Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 2,
      duration: 2 + Math.random() * 3,
      color: colors[i % colors.length],
      size: 4 + Math.random() * 6,
    }));
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setShowBreakdown(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!showBreakdown) return;
    scores.forEach((score) => {
      let current = 0;
      const target = score.totalScore;
      const step = Math.max(1, Math.ceil(target / 30));
      const interval = setInterval(() => {
        current = Math.min(current + step, target);
        setAnimatedScores((prev) => ({ ...prev, [score.playerId]: current }));
        if (current >= target) clearInterval(interval);
      }, 50);
    });
  }, [showBreakdown, scores]);

  return (
    <div
      className="sa-victory"
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(10,8,4,0.92)',
        pointerEvents: 'auto',
        zIndex: 50,
        overflow: 'hidden',
      }}
    >
      {/* Confetti */}
      {confetti.map((c) => (
        <div
          key={c.id}
          className="sa-confetti-piece"
          style={{
            position: 'absolute',
            top: -10,
            left: `${c.x}%`,
            width: c.size,
            height: c.size * 1.5,
            background: c.color,
            borderRadius: 2,
            animationDelay: `${c.delay}s`,
            animationDuration: `${c.duration}s`,
          }}
        />
      ))}

      {/* Winner announcement */}
      <div className="sa-fade-in" style={{ textAlign: 'center', marginBottom: 24 }}>
        <div style={{ fontSize: 14, color: 'var(--sa-text-secondary)', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 8 }}>
          {isWinner ? 'You Won!' : 'Game Over'}
        </div>
        <div style={{ fontSize: 32, fontWeight: 700, color: 'var(--sa-accent)' }}>
          {winner?.playerName}
        </div>
        <div style={{ fontSize: 18, color: 'var(--sa-text-primary)', marginTop: 4 }}>
          {winner?.totalScore} Victory Points
        </div>
      </div>

      {/* Score breakdown */}
      {showBreakdown && (
        <div className="sa-fade-in" style={{ width: '100%', maxWidth: 400, padding: '0 16px' }}>
          {scores.map((score, i) => (
            <div
              key={score.playerId}
              className="sa-card"
              style={{
                marginBottom: 8,
                padding: '10px 16px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                border: score.playerId === userId ? '1px solid var(--sa-accent)' : undefined,
              }}
            >
              <div>
                <span style={{ fontWeight: 600, fontSize: 14 }}>
                  #{i + 1} {score.playerName}
                </span>
                {score.playerId === userId && (
                  <span style={{ color: 'var(--sa-accent)', fontSize: 11, marginLeft: 6 }}>YOU</span>
                )}
              </div>
              <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--sa-accent)' }}>
                {animatedScores[score.playerId] ?? 0}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
        <button className="sa-btn sa-btn-primary" onClick={onLeave}>
          Back to Lobby
        </button>
      </div>
    </div>
  );
}
