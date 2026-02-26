import React from 'react';

interface TurnTimerOverlayProps {
  timeLeft: number;
  progress: number;
  color: string;
  isRunning: boolean;
}

export function TurnTimerOverlay({ timeLeft, progress, color, isRunning }: TurnTimerOverlayProps) {
  if (!isRunning) return null;

  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <div
      className="sa-turn-timer"
      style={{
        position: 'absolute',
        top: 12,
        right: 12,
        pointerEvents: 'auto',
        zIndex: 15,
      }}
    >
      <svg width="48" height="48" viewBox="0 0 48 48">
        {/* Background circle */}
        <circle
          cx="24" cy="24" r={radius}
          fill="rgba(26,18,7,0.8)"
          stroke="rgba(90,74,42,0.4)"
          strokeWidth="2"
        />
        {/* Progress arc */}
        <circle
          cx="24" cy="24" r={radius}
          fill="none"
          stroke={color}
          strokeWidth="3"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform="rotate(-90 24 24)"
          style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.5s' }}
        />
        {/* Time text */}
        <text
          x="24" y="26"
          textAnchor="middle"
          fill={color}
          fontSize="12"
          fontWeight="700"
          fontFamily="'Inter', sans-serif"
        >
          {timeLeft}
        </text>
      </svg>
    </div>
  );
}
