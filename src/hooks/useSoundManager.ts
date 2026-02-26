import { useCallback, useRef, useState } from 'react';
import type { SoundName } from '../types/three.js';

function createOscillatorSound(
  ctx: AudioContext,
  frequency: number,
  duration: number,
  type: OscillatorType = 'sine',
  gain = 0.3,
) {
  const osc = ctx.createOscillator();
  const gainNode = ctx.createGain();
  osc.type = type;
  osc.frequency.value = frequency;
  gainNode.gain.setValueAtTime(gain, ctx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  osc.connect(gainNode);
  gainNode.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + duration);
}

function createNoiseSound(ctx: AudioContext, duration: number, gain = 0.2) {
  const bufferSize = ctx.sampleRate * duration;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  const gainNode = ctx.createGain();
  gainNode.gain.setValueAtTime(gain, ctx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  source.connect(gainNode);
  gainNode.connect(ctx.destination);
  source.start();
}

const SOUND_CONFIGS: Record<SoundName, (ctx: AudioContext) => void> = {
  diceRoll: (ctx) => {
    createNoiseSound(ctx, 0.3, 0.15);
    createOscillatorSound(ctx, 200, 0.1, 'triangle', 0.2);
  },
  diceLand: (ctx) => {
    createOscillatorSound(ctx, 150, 0.15, 'triangle', 0.3);
  },
  cardFlip: (ctx) => {
    createOscillatorSound(ctx, 800, 0.1, 'sine', 0.15);
    setTimeout(() => createOscillatorSound(ctx, 1200, 0.08, 'sine', 0.1), 50);
  },
  resourceCollect: (ctx) => {
    createOscillatorSound(ctx, 600, 0.15, 'sine', 0.2);
    setTimeout(() => createOscillatorSound(ctx, 900, 0.1, 'sine', 0.15), 80);
    setTimeout(() => createOscillatorSound(ctx, 1200, 0.08, 'sine', 0.1), 160);
  },
  workerPlace: (ctx) => {
    createOscillatorSound(ctx, 180, 0.12, 'triangle', 0.25);
  },
  buildingBuild: (ctx) => {
    createOscillatorSound(ctx, 200, 0.2, 'square', 0.15);
    setTimeout(() => createOscillatorSound(ctx, 300, 0.15, 'square', 0.12), 100);
    setTimeout(() => createOscillatorSound(ctx, 400, 0.1, 'square', 0.1), 200);
  },
  notification: (ctx) => {
    createOscillatorSound(ctx, 440, 0.15, 'sine', 0.2);
    setTimeout(() => createOscillatorSound(ctx, 660, 0.1, 'sine', 0.15), 100);
  },
  turnStart: (ctx) => {
    createOscillatorSound(ctx, 523, 0.12, 'sine', 0.2);
    setTimeout(() => createOscillatorSound(ctx, 659, 0.1, 'sine', 0.15), 80);
  },
  victory: (ctx) => {
    const notes = [523, 659, 784, 1047];
    notes.forEach((freq, i) => {
      setTimeout(() => createOscillatorSound(ctx, freq, 0.3, 'sine', 0.2), i * 150);
    });
  },
  click: (ctx) => {
    createOscillatorSound(ctx, 1000, 0.05, 'square', 0.1);
  },
  tick: (ctx) => {
    createOscillatorSound(ctx, 800, 0.04, 'square', 0.15);
  },
};

export function useSoundManager() {
  const ctxRef = useRef<AudioContext | null>(null);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(0.7);

  const getContext = useCallback(() => {
    if (!ctxRef.current) {
      ctxRef.current = new AudioContext();
    }
    if (ctxRef.current.state === 'suspended') {
      ctxRef.current.resume();
    }
    return ctxRef.current;
  }, []);

  const play = useCallback((sound: SoundName) => {
    if (muted) return;
    try {
      const ctx = getContext();
      SOUND_CONFIGS[sound](ctx);
    } catch {
      // Audio not available
    }
  }, [muted, getContext]);

  const toggleMute = useCallback(() => setMuted(m => !m), []);

  return { play, muted, toggleMute, volume, setVolume };
}
