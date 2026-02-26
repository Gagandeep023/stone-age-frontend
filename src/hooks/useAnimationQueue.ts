import { useState, useCallback, useRef, useEffect } from 'react';
import type { AnimationEvent } from '../types/three.js';

export function useAnimationQueue() {
  const [currentAnimation, setCurrentAnimation] = useState<AnimationEvent | null>(null);
  const queueRef = useRef<AnimationEvent[]>([]);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const processNext = useCallback(() => {
    if (queueRef.current.length === 0) {
      setCurrentAnimation(null);
      return;
    }
    const next = queueRef.current.shift()!;
    setCurrentAnimation(next);
    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      processNext();
    }, next.duration);
  }, []);

  const enqueue = useCallback((events: AnimationEvent[]) => {
    queueRef.current.push(...events);
    if (!timerRef.current && !currentAnimation) {
      processNext();
    }
  }, [processNext, currentAnimation]);

  const clear = useCallback(() => {
    queueRef.current = [];
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setCurrentAnimation(null);
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return { currentAnimation, enqueue, clear, queueLength: queueRef.current.length };
}
