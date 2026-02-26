import { useState, useEffect, useRef, useCallback } from 'react';

interface TurnTimerOptions {
  duration?: number;
  onTimeout?: () => void;
  enabled?: boolean;
}

export function useTurnTimer(options: TurnTimerOptions = {}) {
  const { duration = 90, onTimeout, enabled = true } = options;
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onTimeoutRef = useRef(onTimeout);
  onTimeoutRef.current = onTimeout;

  const start = useCallback(() => {
    setTimeLeft(duration);
    setIsRunning(true);
  }, [duration]);

  const stop = useCallback(() => {
    setIsRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const reset = useCallback(() => {
    setTimeLeft(duration);
  }, [duration]);

  useEffect(() => {
    if (!isRunning || !enabled) return;

    intervalRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setIsRunning(false);
          onTimeoutRef.current?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, enabled]);

  const progress = timeLeft / duration;
  const color = timeLeft > 30 ? '#44aa44' : timeLeft > 10 ? '#ccaa22' : '#cc4444';

  return { timeLeft, progress, color, isRunning, start, stop, reset, duration };
}
