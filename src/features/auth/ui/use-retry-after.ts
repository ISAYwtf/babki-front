import {
  useCallback,
  useEffect,
  useState,
} from 'react';
import { getRetryAfterSeconds } from '../model/two-factor-errors';

export const useRetryAfter = () => {
  const [blockedUntil, setBlockedUntil] = useState(0);
  const [now, setNow] = useState(Date.now());
  const remainingSeconds = Math.max(0, Math.ceil((blockedUntil - now) / 1000));

  useEffect(() => {
    if (remainingSeconds <= 0) return undefined;
    const interval = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(interval);
  }, [remainingSeconds]);

  const applyError = useCallback((error: unknown) => {
    const seconds = getRetryAfterSeconds(error);
    if (seconds > 0) {
      const currentTime = Date.now();
      setNow(currentTime);
      setBlockedUntil(currentTime + seconds * 1000);
    }
  }, []);

  return {
    applyError,
    isBlocked: remainingSeconds > 0,
    remainingSeconds,
  };
};

export type RetryAfterController = ReturnType<typeof useRetryAfter>;
