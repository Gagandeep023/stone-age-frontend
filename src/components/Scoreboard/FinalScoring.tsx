import React from 'react';
import type { FinalScore, GameState } from '../../types/index.js';
import { WorkerMeeple } from '../Common/WorkerMeeple.js';

interface FinalScoringProps {
  scores: FinalScore[];
  gameState: GameState;
  userId: string;
  onLeave: () => void;
}

export function FinalScoring({ scores, gameState, userId, onLeave }: FinalScoringProps) {
  const sorted = [...scores].sort((a, b) => b.totalScore - a.totalScore);

  return (
    <div className="sa-card" style={{ maxWidth: 600, margin: '0 auto' }}>
      <h2 style={{ textAlign: 'center', color: 'var(--sa-accent)', marginBottom: 16, fontSize: 20 }}>
        Game Over!
      </h2>

      {sorted.map((score, rank) => {
        const player = gameState.players.find(p => p.id === score.playerId);
        const isWinner = rank === 0;
        const isMe = score.playerId === userId;

        return (
          <div
            key={score.playerId}
            style={{
              padding: 12,
              marginBottom: 8,
              background: isWinner ? 'rgba(212,160,23,0.15)' : 'var(--sa-bg-secondary)',
              border: `1px solid ${isWinner ? 'var(--sa-accent)' : 'var(--sa-border)'}`,
              borderRadius: 'var(--sa-radius)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <span style={{ fontSize: 18, fontWeight: 700, color: isWinner ? 'var(--sa-accent)' : 'var(--sa-text-secondary)' }}>
                #{rank + 1}
              </span>
              {player && <WorkerMeeple color={player.color} size={18} />}
              <span style={{ fontWeight: 600, flex: 1 }}>
                {score.playerName}
                {isMe && ' (You)'}
                {isWinner && ' \u2606'}
              </span>
              <span style={{ fontSize: 22, fontWeight: 700, color: 'var(--sa-accent)' }}>
                {score.totalScore}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2px 12px', fontSize: 12, color: 'var(--sa-text-secondary)' }}>
              <span>In-game VP:</span>
              <span style={{ textAlign: 'right' }}>{score.inGameScore}</span>
              <span>Culture sets:</span>
              <span style={{ textAlign: 'right' }}>{score.cultureSetScore}</span>
              <span>Farmers ({score.multiplierScore.farmer.figures}x{score.multiplierScore.farmer.value}):</span>
              <span style={{ textAlign: 'right' }}>{score.multiplierScore.farmer.score}</span>
              <span>Tool makers ({score.multiplierScore.toolMaker.figures}x{score.multiplierScore.toolMaker.value}):</span>
              <span style={{ textAlign: 'right' }}>{score.multiplierScore.toolMaker.score}</span>
              <span>Hut builders ({score.multiplierScore.hutBuilder.figures}x{score.multiplierScore.hutBuilder.value}):</span>
              <span style={{ textAlign: 'right' }}>{score.multiplierScore.hutBuilder.score}</span>
              <span>Shamans ({score.multiplierScore.shaman.figures}x{score.multiplierScore.shaman.value}):</span>
              <span style={{ textAlign: 'right' }}>{score.multiplierScore.shaman.score}</span>
              <span>Resources/Food:</span>
              <span style={{ textAlign: 'right' }}>{score.resourceScore}</span>
            </div>
          </div>
        );
      })}

      <div style={{ textAlign: 'center', marginTop: 16 }}>
        <button className="sa-btn sa-btn-primary" onClick={onLeave}>
          Back to Lobby
        </button>
      </div>
    </div>
  );
}
